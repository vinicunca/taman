/* eslint-disable ts/no-dynamic-delete */
import type { ComputedRef } from 'vue';
import type {
  FieldComponentRegistry,
  FieldConfig,
  FieldRuntimeState,
  FormBuilderState,
  FormValidationResult,
  FormValues,
  PohonFormRef,
  TamanFormOptions,
} from './types';
import { Store } from '@taman-core/shared/store';
import {
  bindMethods,
  clone,
  mergeWithArrayOverride,
  StateHandler,
} from '@taman-core/shared/utils';
import { computed, markRaw, reactive, toRaw } from 'vue';

import { deepAssign, deletePath, setPath } from './paths';
import { assertUniqueFieldNames } from './schema';
import { applyTransformsIn, applyTransformsOut } from './transforms';
import { createFieldRuntime } from './types';

/**
 * FieldConfig entries can carry a Zod schema (`rules`) in `field.rules`.
 * Zod's runtime uses non-configurable lazy getters (`_zod`) that violate
 * Proxy invariants once Vue's reactive()/readonly() wraps them (thrown when
 * the store state flows through `useSelector`'s `readonly()`). Field configs
 * are static definitions, not reactive state, so mark them raw wherever they
 * enter the store to keep Vue from ever proxying them.
 */
function markFieldsRaw(fields: ReadonlyArray<FieldConfig>): Array<FieldConfig> {
  return fields.map((field) => markRaw(field));
}

function getDefaultState(): FormBuilderState {
  return {
    collapsed: false,
    collapsedRows: 1,
    disabled: false,
    errorDisplay: 'inline',
    fields: [],
    layout: {},
    showDefaultActions: true,
    showResetButton: true,
    submitOnChange: false,
  };
}

export class FormApi<TValues extends FormValues = FormValues> {
  public isMounted = false;
  public state: FormBuilderState | null = null;
  public store: Store<FormBuilderState>;
  public values: TValues;
  public runtime: Record<string, FieldRuntimeState>;

  private formRef: null | PohonFormRef = null;
  private initialValues: TValues;
  private latestSubmissionValues: TValues | null = null;
  private stateHandler: StateHandler;
  private asyncErrors: Record<string, string> = {};
  private pendingValidations = new Set<Promise<unknown>>();
  private componentRefMap = new Map<string, unknown>();

  public handleReset?: (values: TValues) => void;
  public handleSubmit?: (values: TValues) => Promise<void> | void;

  constructor(options: TamanFormOptions<FieldComponentRegistry, TValues> = {}) {
    const { handleReset, handleSubmit, initialValues, ...state } = options;
    this.handleReset = handleReset;
    this.handleSubmit = handleSubmit;
    this.initialValues = clone(initialValues ?? {}) as TValues;
    this.values = reactive(clone(this.initialValues)) as TValues;
    this.runtime = reactive({});
    assertUniqueFieldNames(state.fields ?? []);
    this.store = new Store<FormBuilderState>({
      ...getDefaultState(),
      ...(state as Partial<FormBuilderState>),
      ...(state.fields ? { fields: markFieldsRaw(state.fields) } : {}),
    });
    this.store.subscribe(() => {
      this.state = this.store.state;
    });
    this.state = this.store.state;
    this.stateHandler = new StateHandler();
    bindMethods(this);
  }

  mount(formRef: PohonFormRef): void {
    if (this.isMounted) {
      return;
    }
    this.formRef = formRef;
    this.isMounted = true;
    this.stateHandler.setConditionTrue();
  }

  unmount(): void {
    this.formRef = null;
    this.isMounted = false;
    this.latestSubmissionValues = null;
    this.stateHandler.setConditionFalse();
    this.stateHandler.reset();
    this.componentRefMap.clear();
  }

  registerComponentRef(name: string, componentRef: unknown): void {
    if (componentRef === null || componentRef === undefined) {
      this.componentRefMap.delete(name);
    } else {
      this.componentRefMap.set(name, componentRef);
    }
  }

  getFieldComponentRef<T = unknown>(name: string): T | undefined {
    return this.componentRefMap.get(name) as T | undefined;
  }

  focusField(name: string): void {
    const componentRef = this.componentRefMap.get(name) as any;
    if (!componentRef) {
      return;
    }
    if (typeof componentRef.focus === 'function') {
      componentRef.focus();
      return;
    }
    const el: HTMLElement | undefined = componentRef.$el;
    if (el) {
      const focusable = (
        el.matches?.('input,textarea,select')
          ? el
          : el.querySelector?.('input,textarea,select')
      ) as HTMLElement | undefined;
      focusable?.focus?.();
    }
  }

  protected async getForm(): Promise<PohonFormRef> {
    if (!this.isMounted) {
      try {
        await this.stateHandler.waitForCondition();
      } catch {
        throw new Error(
          '[form-builder] Form was unmounted before mounting; pending call cancelled',
        );
      }
    }
    if (!this.formRef) {
      throw new Error('[form-builder] <Form /> is not mounted');
    }
    return this.formRef;
  }

  setState(
    update:
      | ((prev: FormBuilderState) => Partial<FormBuilderState>)
      | Partial<FormBuilderState>,
  ): void {
    // Fields may enter the store through any patch; normalize them through
    // markFieldsRaw so no public path can install un-marked configs (whose
    // zod rules crash under Vue's readonly proxy — see markFieldsRaw).
    const normalize = (patch: Partial<FormBuilderState>) =>
      patch.fields ? { ...patch, fields: markFieldsRaw(patch.fields) } : patch;
    if (typeof update === 'function') {
      this.store.setState((prev) => {
        const patch = normalize(update(prev));
        return mergeWithArrayOverride(patch, prev) as FormBuilderState;
      });
    } else {
      this.store.setState(
        (prev) => mergeWithArrayOverride(normalize(update), prev) as FormBuilderState,
      );
    }
  }

  updateSchema(partials: Array<Partial<FieldConfig> & { name: string }>): void {
    const fields = [...(this.state?.fields ?? [])];
    for (const partial of partials) {
      const index = fields.findIndex((field) => field.name === partial.name);
      if (index === -1) {
        console.warn(`[form-builder] updateSchema: unknown field "${partial.name}"`);
        continue;
      }
      fields[index] = markRaw(
        mergeWithArrayOverride(partial, fields[index]) as FieldConfig,
      );
    }
    this.setState({ fields });
  }

  setFields(fields: Array<FieldConfig>): void {
    assertUniqueFieldNames(fields);
    fields = markFieldsRaw(fields);
    const previousNames = new Set(
      (this.state?.fields ?? []).map((field) => field.name).filter(Boolean) as Array<string>,
    );
    const nextNames = new Set(
      fields.map((field) => field.name).filter(Boolean) as Array<string>,
    );
    for (const name of previousNames) {
      if (!nextNames.has(name)) {
        deletePath(this.values, name);
        delete this.runtime[name];
        this.formRef?.clear(name);
      }
    }
    this.store.setState((prev) => ({ ...prev, fields }));
  }

  setFieldRuntime(name: string, partial: Partial<FieldRuntimeState>): void {
    this.runtime[name] = { ...createFieldRuntime(), ...this.runtime[name], ...partial };
  }

  getFieldRuntime(name: string): FieldRuntimeState {
    return this.runtime[name] ?? createFieldRuntime();
  }

  /**
   * Current error message for a field, read live from the mounted PForm's
   * error list — covers sync (zod), async, and server-set (setErrors)
   * errors uniformly. Drives "live validation after first error" in the
   * renderer without depending on PForm's own blur-tracking, which some
   * browsers never trigger on a submit-button click.
   */
  getFieldError(name: string): string | undefined {
    return this.formRef?.errors.find((error) => error.name === name)?.message;
  }

  // Completed in Task 7 (result mapping); the getForm() delegation is final.
  async validate(paths?: Array<string>): Promise<FormValidationResult> {
    const form = await this.getForm();
    const data = await form.validate({ name: paths, silent: true });
    const errors = form
      .getErrors()
      .map((error) => ({ message: error.message, path: error.name ?? '' }));
    return { errors, valid: data !== false };
  }

  getRawValues(): TValues {
    return clone(toRaw(this.values));
  }

  getValues(): TValues {
    const fields = this.state?.fields ?? [];
    const fieldByName = new Map(fields.filter((f) => f.name).map((f) => [f.name!, f]));
    return applyTransformsOut(fields, this.getRawValues(), {
      isIfFalse: (name) =>
        this.getFieldRuntime(name).if === false && fieldByName.has(name),
    }) as TValues;
  }

  async setValues(
    incoming: Partial<TValues>,
    opts: { shouldValidate?: boolean } = {},
  ): Promise<void> {
    const transformed = applyTransformsIn(this.state?.fields ?? [], incoming);
    deepAssign(this.values, transformed);
    if (opts.shouldValidate) {
      await this.validate();
    }
  }

  async setFieldValue(
    path: string,
    value: unknown,
    shouldValidate = false,
  ): Promise<void> {
    setPath(this.values, path, value);
    if (shouldValidate) {
      const form = await this.getForm();
      await form.validate({ name: [path], silent: true });
    }
  }

  useValues<T = TValues>(selector?: (values: TValues) => T): ComputedRef<T> {
    return computed(() =>
      selector ? selector(this.values) : (this.values as unknown as T),
    );
  }

  async setErrors(errors: Array<{ message: string; path: string }>): Promise<void> {
    const form = await this.getForm();
    form.setErrors(errors.map((e) => ({ message: e.message, name: e.path })));
  }

  async clearErrors(paths?: Array<string>): Promise<void> {
    const form = await this.getForm();
    if (!paths) {
      form.clear();
      return;
    }
    for (const path of paths) {
      form.clear(path);
    }
  }

  async setAsyncError(path: string, message: string | undefined): Promise<void> {
    if (message === undefined) {
      // No async error on record => nothing to clear. Guard hard here:
      // without it, a speculative clear (e.g. clear-on-change) would wipe
      // any DISPLAYED SYNC error for the path via form.clear().
      if (!(path in this.asyncErrors)) {
        return;
      }
      delete this.asyncErrors[path];
      await this.clearErrors([path]);
    } else {
      this.asyncErrors[path] = message;
      await this.setErrors([{ message, path }]);
    }
  }

  trackAsyncValidation(promise: Promise<unknown>): void {
    this.pendingValidations.add(promise);
    // Swallow rejections on this bookkeeping chain: the validation owner
    // handles the original promise's outcome; without the catch, `.finally()`
    // would mint a rejected derived promise nobody awaits (unhandled
    // rejection). Keep deleting the ORIGINAL promise from the set.
    promise
      .catch(() => {})
      .finally(() => this.pendingValidations.delete(promise));
  }

  private async awaitAsyncValidations(): Promise<void> {
    while (this.pendingValidations.size > 0) {
      // eslint-disable-next-line no-await-in-loop
      await Promise.allSettled([...this.pendingValidations]);
    }
  }

  /** Transform + handleSubmit, no validation. Internal submit entries use this. */
  async runSubmitPipeline(): Promise<TValues> {
    const output = this.getValues();
    await this.handleSubmit?.(output);
    this.latestSubmissionValues = clone(output);
    return output;
  }

  /**
   * Shared async-validation gate for both submit entries. Awaits any
   * in-flight async validations, then — if async errors are on record —
   * re-asserts them on top of the form's CURRENT error list (a sync
   * validation pass, ours or PForm's own submit-time validate(), replaces
   * `errors.value` wholesale, silently wiping async-only entries) and
   * scrolls to the first error. Returns true when submission must be blocked.
   */
  private async gateOnAsyncErrors(): Promise<boolean> {
    const form = await this.getForm();
    await this.awaitAsyncValidations();
    const asyncErrorEntries = Object.entries(this.asyncErrors);
    if (asyncErrorEntries.length === 0) {
      return false;
    }
    // form.validate() replaced the error list; merge the current sync
    // errors with async errors (async wins per name — fresher signal).
    const asyncNames = new Set(asyncErrorEntries.map(([name]) => name));
    const syncErrors = form
      .getErrors()
      .filter((error) => !error.name || !asyncNames.has(error.name))
      .map((error) => ({ message: error.message, name: error.name }));
    form.setErrors([
      ...syncErrors,
      ...asyncErrorEntries.map(([name, message]) => ({ message, name })),
    ]);
    await this.scrollToFirstError();
    return true;
  }

  /** Public/manual submit entry: runs our own sync validation, then the async gate. */
  async submit(): Promise<TValues | undefined> {
    const form = await this.getForm();
    await this.awaitAsyncValidations();
    const data = await form.validate({ silent: true });
    const blocked = await this.gateOnAsyncErrors();
    if (data === false || blocked) {
      if (!blocked) {
        await this.scrollToFirstError();
      }
      return undefined;
    }
    return this.runSubmitPipeline();
  }

  /**
   * Native <form> submit entry (form-renderer's @submit). PForm's own
   * onSubmitWrapper has already run schema validation before this is
   * reached — throwing on failure, so we're only invoked once that pass has
   * succeeded — but that pass replaces the whole error list, silently
   * wiping any displayed async errors. Re-assert the async gate before
   * running the submit pipeline.
   */
  async submitFromNativeEvent(): Promise<TValues | undefined> {
    const blocked = await this.gateOnAsyncErrors();
    return blocked ? undefined : this.runSubmitPipeline();
  }

  async resetForm(values?: Partial<TValues>): Promise<void> {
    for (const key of Object.keys(this.values)) {
      delete this.values[key];
    }
    deepAssign(this.values, clone(values ?? this.initialValues));
    await this.resetValidate();
    this.handleReset?.(this.getValues());
  }

  async resetValidate(): Promise<void> {
    this.asyncErrors = {};
    const form = await this.getForm();
    form.clear();
  }

  getLatestSubmissionValues(): TValues | null {
    return this.latestSubmissionValues;
  }

  async scrollToFirstError(): Promise<void> {
    const form = await this.getForm();
    const first = form.getErrors()[0];
    if (!first?.id) {
      return;
    }
    document
      .getElementById(first.id)
      ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  get dirty(): boolean {
    return this.formRef?.dirty ?? false;
  }

  get dirtyFields(): ReadonlySet<string> {
    return this.formRef?.dirtyFields ?? new Set();
  }

  get touchedFields(): ReadonlySet<string> {
    return this.formRef?.touchedFields ?? new Set();
  }
}
