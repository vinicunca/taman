import type { Component, VNode } from 'vue';
import type { ZodType } from 'zod';

export type FormValues = Record<string, any>;

export type FieldComponentRegistry = Record<string, Component>;

/**
 * Extracts a component's props type; falls back to an open record so raw
 * components and non-inferable registries stay usable.
 */
export type PropsOf<C> = C extends new (...args: any) => { $props: infer P }
  ? Partial<P> & Record<string, any>
  : Record<string, any>;

export type MaybeReactiveProps<P>
  = | P
    | ((values: FormValues, api: FormApiLike) => P);

type MaybeAsync<T> = T | PromiseLike<T>;

/** Structural stand-in so types.ts does not import the FormApi class (avoids a cycle). */
export interface FormApiLike {
  getValues: () => FormValues;
  setFieldValue: (path: string, value: unknown, shouldValidate?: boolean) => Promise<void>;
  setValues: (values: FormValues, opts?: { shouldValidate?: boolean }) => Promise<void>;
  values: FormValues;
}

export interface FieldDependencies {
  triggerFields: Array<string>;
  /** false => unmount, exclude rule from schema and value from getValues() */
  if?: boolean | ((values: FormValues, api: FormApiLike) => MaybeAsync<boolean>);
  /** false => CSS-hide, still validated and present in values */
  show?: boolean | ((values: FormValues, api: FormApiLike) => MaybeAsync<boolean>);
  disabled?: boolean | ((values: FormValues, api: FormApiLike) => MaybeAsync<boolean>);
  required?: (values: FormValues, api: FormApiLike) => MaybeAsync<boolean>;
  rules?: (values: FormValues, api: FormApiLike) => MaybeAsync<undefined | ZodType>;
  props?: (values: FormValues, api: FormApiLike) => MaybeAsync<Record<string, any>>;
  trigger?: (values: FormValues, api: FormApiLike) => MaybeAsync<void>;
}

export interface FieldAsyncValidate {
  handler: (value: unknown, values: FormValues) => Promise<string | undefined>;
  /** ms, default 300 */
  debounce?: number;
  /** default 'blur' */
  on?: 'blur' | 'input';
}

export interface FieldTransform {
  /** API/external value -> form value, applied on setValues() */
  in?: (apiValue: unknown, values: FormValues) => unknown;
  /**
   * form value -> API value, applied on getValues()/submit.
   * Return undefined to drop the field from output; use setExtra to emit
   * additional output keys (e.g. range split).
   */
  out?: (
    formValue: unknown,
    setExtra: (path: string, value: unknown) => void,
    values: FormValues,
  ) => unknown;
}

export interface FieldRepeat<R extends FieldComponentRegistry = FieldComponentRegistry> {
  fields: Array<FieldConfig<R>>;
  min?: number;
  max?: number;
  sortable?: boolean;
  addLabel?: string;
}

/** Subset of PFormField props forwarded verbatim (kept local — no pohon type import). */
export interface FormFieldPropsSubset {
  size?: string;
  hint?: string;
  eagerValidation?: boolean;
  validateOnInputDelay?: number;
}

interface FieldConfigBody<R extends FieldComponentRegistry> {
  /** Dot paths allowed ('address.city'). Omitted => display-only entry. */
  name?: string;
  rules?: ZodType;
  label?: string | (() => VNode);
  description?: string;
  help?: string | ((values: FormValues) => string);
  /**
   * Nested-path gotcha: a dependency-gated field with a dotted name (e.g.
   * 'meta.slug') needs its ancestor object seeded in initialValues
   * (`{ meta: { slug: '' } }`). Otherwise, once the field mounts, zod
   * reports a generic "expected object, received undefined" error on the
   * parent path ('meta') — which no PFormField matches — instead of the
   * field's own message.
   */
  dependencies?: FieldDependencies;
  asyncValidate?: FieldAsyncValidate;
  transform?: FieldTransform;
  repeat?: FieldRepeat<R>;
  slots?: Record<string, (props: unknown) => VNode | Array<VNode>>;
  formFieldProps?: FormFieldPropsSubset;
  span?: 'full' | number;
  newRow?: boolean;
  class?: string;
  labelClass?: string;
  hide?: boolean | ((values: FormValues) => boolean);
  keepValueOnHide?: boolean;
}

type RegistryFieldConfig<R extends FieldComponentRegistry> = {
  [K in keyof R & string]: {
    component: K;
    props?: MaybeReactiveProps<PropsOf<R[K]>>;
  } & FieldConfigBody<R>;
}[keyof R & string];

type RawFieldConfig<R extends FieldComponentRegistry> = {
  component: Component;
  props?: MaybeReactiveProps<Record<string, any>>;
} & FieldConfigBody<R>;

export type FieldConfig<R extends FieldComponentRegistry = FieldComponentRegistry>
  = | RawFieldConfig<R>
    | RegistryFieldConfig<R>;

export interface FormLayoutOptions {
  /** @default 'vertical' */
  labelPlacement?: 'horizontal' | 'vertical';
  /** responsive grid column counts, rendered as CSS grid */
  cols?: { base?: number; lg?: number; md?: number };
  compact?: boolean;
}

export interface FormBuilderMessages {
  collapse: string;
  expand: string;
  reset: string;
  submit: string;
}

export const DEFAULT_MESSAGES: FormBuilderMessages = {
  collapse: 'Collapse',
  expand: 'Expand',
  reset: 'Reset',
  submit: 'Submit',
};

export type FormValidateOn = Array<'blur' | 'change' | 'input'>;

export interface FormBuilderState<R extends FieldComponentRegistry = FieldComponentRegistry> {
  collapsed: boolean;
  collapsedRows: number;
  disabled: boolean;
  errorDisplay: 'inline' | 'tooltip';
  fields: Array<FieldConfig<R>>;
  layout: FormLayoutOptions;
  messages?: Partial<FormBuilderMessages>;
  preset?: 'search';
  showDefaultActions: boolean;
  /**
   * @default true
   * Hide the Reset button when it doesn't make sense (e.g. login/auth
   * forms). Submit still renders; only Reset is affected.
   */
  showResetButton: boolean;
  submitOnChange: boolean;
  validateOn?: FormValidateOn;
}

/**
 * `TValues` is the shape the caller expects out of the form — declare it
 * (`useTamanForm<TalentFormValues>`) to get typed `getValues()`/handlers
 * instead of `Record<string, any>`. It is an assertion, not an inference:
 * `transform.out` and `dependencies.if` can add or drop keys at runtime, so
 * the field list can't be the source of truth for the output shape.
 */
export interface TamanFormOptions<
  R extends FieldComponentRegistry = FieldComponentRegistry,
  TValues extends FormValues = FormValues,
> extends Partial<FormBuilderState<R>> {
  handleReset?: (values: TValues) => void;
  handleSubmit?: (values: TValues) => void | Promise<void>;
  initialValues?: Partial<TValues>;
}

export interface FieldRuntimeState {
  disabled: boolean;
  dynamicProps: Record<string, any>;
  dynamicRules?: ZodType;
  if: boolean;
  required?: boolean;
  show: boolean;
  validating: boolean;
}

export function createFieldRuntime(): FieldRuntimeState {
  return {
    disabled: false,
    dynamicProps: {},
    dynamicRules: undefined,
    if: true,
    required: undefined,
    show: true,
    validating: false,
  };
}

export interface FormValidationResult {
  errors: Array<{ message: string; path: string }>;
  valid: boolean;
}

/**
 * INTERNAL contract of the pohon PForm template ref (refs unwrapped by
 * Vue's expose proxy). Never exported from the package barrel.
 */
export interface PohonFormRef {
  clear: (name?: RegExp | string) => void;
  dirty: boolean;
  dirtyFields: ReadonlySet<string>;
  errors: Array<{ id?: string; message: string; name?: string }>;
  getErrors: (name?: RegExp | string) => Array<{ id?: string; message: string; name?: string }>;
  setErrors: (
    errors: Array<{ message: string; name?: string }>,
    name?: RegExp | string,
  ) => void;
  submit: () => Promise<void>;
  touchedFields: ReadonlySet<string>;
  validate: (opts?: {
    name?: string | Array<string>;
    silent?: boolean;
  }) => Promise<false | FormValues>;
}

export function defineFields<R extends FieldComponentRegistry>(
  fields: Array<FieldConfig<R>>,
): Array<FieldConfig<R>> {
  return fields;
}
