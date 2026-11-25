import type {
  ValidationLogicFn,
  ValidationLogicValidatorsFn,
} from '@tanstack/vue-form';
import type { FieldValidationInvalidator } from './form.runtime-field';
import type {
  FormActions,
  FormFieldName,
  FormFieldValue,
  FormResetOptions,
  FormRuntimeState,
  FormValues,
} from './form.types';
import { batch } from '@tanstack/store';
import {
  defaultValidationLogic,
  useForm,
} from '@tanstack/vue-form';
import { mergeWithArrayOverride } from '@vinicunca/taman-core/utils';
import { computed, nextTick, shallowRef } from 'vue';

import { createRuntimeFieldComponent } from './form.runtime-field';

function normalizeError(error: unknown): string | undefined {
  if (typeof error === 'string') {
    return error;
  }
  if (error && typeof error === 'object' && 'message' in error) {
    const message = Reflect.get(error, 'message');
    return typeof message === 'string'
      ? message
      : undefined;
  }
  return error === undefined || error === null
    ? undefined
    : String(error);
}

function normalizeFieldMetaError(meta: unknown) {
  if (!meta || typeof meta !== 'object' || !('errors' in meta)) {
    return undefined;
  }
  const errors = Reflect.get(meta, 'errors');
  return normalizeError(Array.isArray(errors)
    ? errors[0]
    : undefined);
}

function isArrayIndex(index: number, length: number) {
  return Number.isInteger(index) && index >= 0 && index < length;
}

/**
 * Splits `contacts[2].name` into the item index (`2`) and the rest of the
 * path (`.name`), for paths inside the array field `contacts`.
 */
function parseArrayItemPath(arrayField: string, path: string) {
  const prefix = `${arrayField}[`;
  if (!path.startsWith(prefix)) {
    return undefined;
  }
  const match = /^(\d+)\](.*)$/s.exec(path.slice(prefix.length));
  return match
    ? {
        index: Number(match[1]),
        rest: match[2] ?? '',
      }
    : undefined;
}

/** The index an item at `index` ends up at after moving `from` to `to`. */
function getMovedIndex(index: number, from: number, to: number) {
  if (index === from) {
    return to;
  }
  if (from < to && index > from && index <= to) {
    return index - 1;
  }
  if (from > to && index >= to && index < from) {
    return index + 1;
  }
  return index;
}

function hasErrors(errorMap: Record<string, unknown> | undefined) {
  return Object.values(errorMap ?? {}).some((error) => error !== undefined);
}

function createProgressiveValidationLogic(
  revealedFields: Set<string>,
): ValidationLogicFn {
  return (props) => {
    let defaultValidators: Array<ValidationLogicValidatorsFn | undefined> = [];
    defaultValidationLogic({
      ...props,
      runValidation: ({ validators }) => {
        defaultValidators = validators;
      },
    });

    const fieldName = props.event.fieldName;
    const startsProgressiveValidation
      = props.event.type === 'blur' || props.event.type === 'submit';
    if (fieldName && startsProgressiveValidation) {
      revealedFields.add(fieldName);
    }
    const shouldRunProgressiveValidator = Boolean(
      fieldName
      && (
        startsProgressiveValidation
        || (
          props.event.type === 'change'
          && revealedFields.has(fieldName)
        )
      ),
    );
    const dynamicValidator = props.event.async
      ? props.validators?.onDynamicAsync
      : props.validators?.onDynamic;

    return props.runValidation({
      form: props.form,
      validators: shouldRunProgressiveValidator && dynamicValidator
        ? [
            ...defaultValidators,
            { cause: 'dynamic', fn: dynamicValidator },
          ]
        : defaultValidators,
    });
  };
}

export function useFormRuntime<TValues extends FormValues>(
  defaultValues: TValues,
): FormActions<TValues> {
  const revealedFields = new Set<string>();
  const rawForm = useForm({
    defaultValues,
    onSubmit: () => {},
    validationLogic: createProgressiveValidationLogic(revealedFields),
  });
  const values = rawForm.useSelector((formState) => formState.values);
  const fieldMeta = rawForm.useSelector((formState) => formState.fieldMeta);
  const isDirty = rawForm.useSelector((formState) => formState.isDirty);
  const isSubmitting = rawForm.useSelector(
    (formState) => formState.isSubmitting,
  );
  const isValid = rawForm.useSelector((formState) => formState.isValid);
  const isValidating = rawForm.useSelector(
    (formState) => formState.isValidating,
  );
  const validationInvalidators = new Map<
    string,
    Set<FieldValidationInvalidator>
  >();

  // TanStack Form's own `formState.isValidating` doesn't reliably flip to
  // true for async field validators driven through the render-prop `Field`
  // pattern used here, even though each field's own `isValidating` does.
  // Track it ourselves from the same wrapper that powers the per-field
  // loading state, so the two stay consistent.
  const pendingAsyncValidations = shallowRef(0);
  const pendingFieldValidations = shallowRef(new Map<string, number>());
  const isAnyFieldValidating = computed(() => pendingAsyncValidations.value > 0);
  const isAnyNativeFieldValidating = computed(() =>
    Object.values(fieldMeta.value).some((meta) =>
      Boolean((meta as { isValidating?: boolean }).isValidating),
    ),
  );

  function onFieldValidatingChange(fieldName: string, delta: -1 | 1) {
    pendingAsyncValidations.value += delta;
    const nextPendingFieldValidations = new Map(pendingFieldValidations.value);
    const nextCount = (nextPendingFieldValidations.get(fieldName) ?? 0) + delta;
    if (nextCount > 0) {
      nextPendingFieldValidations.set(fieldName, nextCount);
    } else {
      nextPendingFieldValidations.delete(fieldName);
    }
    pendingFieldValidations.value = nextPendingFieldValidations;
  }

  function registerValidationInvalidator(
    fieldName: string,
    invalidator: FieldValidationInvalidator,
  ) {
    let fieldInvalidators = validationInvalidators.get(fieldName);
    if (!fieldInvalidators) {
      fieldInvalidators = new Set();
      validationInvalidators.set(fieldName, fieldInvalidators);
    }
    fieldInvalidators.add(invalidator);
    return () => {
      invalidator();
      fieldInvalidators.delete(invalidator);
      if (fieldInvalidators.size === 0) {
        validationInvalidators.delete(fieldName);
        revealedFields.delete(fieldName);
      }
    };
  }

  function invalidateFieldValidation(fieldName: string) {
    for (const invalidator of validationInvalidators.get(fieldName) ?? []) {
      invalidator();
    }
  }

  const RuntimeField = createRuntimeFieldComponent(
    rawForm.Field,
    registerValidationInvalidator,
    onFieldValidatingChange,
  );

  function getErrors() {
    const result: Record<string, string> = {};
    for (const [fieldName, meta] of Object.entries(fieldMeta.value)) {
      const error = normalizeFieldMetaError(meta);
      if (error) {
        result[fieldName] = error;
      }
    }
    return result;
  }

  const errors = computed(getErrors);
  const meta = computed(() => ({
    dirty: isDirty.value,
    submitting: isSubmitting.value,
    valid: isValid.value,
    validating:
      isValidating.value
      || isAnyFieldValidating.value
      || isAnyNativeFieldValidating.value,
  }));
  const runtimeState = computed<FormRuntimeState<TValues>>(() => ({
    errors: errors.value,
    meta: meta.value,
    values: values.value,
  }));

  function getFieldError(fieldName: string) {
    return normalizeFieldMetaError(Reflect.get(fieldMeta.value, fieldName));
  }

  function useFieldError(fieldName: string) {
    const schemaError = rawForm.useSelector((formState) =>
      normalizeFieldMetaError(Reflect.get(formState.fieldMeta, fieldName)),
    );
    return schemaError;
  }

  function useFieldValidating(fieldName: string) {
    return computed(() =>
      Boolean(
        pendingFieldValidations.value.get(fieldName)
        || (
          Reflect.get(fieldMeta.value, fieldName) as
          | { isValidating?: boolean }
          | undefined
        )?.isValidating,
      ),
    );
  }

  function useFieldValue<TFieldName extends FormFieldName<TValues>>(
    fieldName: TFieldName,
  ) {
    return rawForm.useSelector(
      () =>
        rawForm.getFieldValue(fieldName as never) as FormFieldValue<
          TValues,
          TFieldName
        >,
    );
  }

  function useFieldValues<TFieldName extends FormFieldName<TValues>>(
    fieldNames: ReadonlyArray<TFieldName>,
  ) {
    const selectedValues = fieldNames.map((fieldName) =>
      useFieldValue(fieldName),
    );
    return computed(() => selectedValues.map((value) => value.value));
  }

  async function validateField(fieldName: string) {
    await rawForm.validateField(fieldName as never, 'submit');
    const error = getFieldError(fieldName);
    return {
      errors: error
        ? { [fieldName]: error }
        : {},
      valid: !error,
    };
  }

  async function validate() {
    await rawForm.validateAllFields('submit');
    const errors = getErrors();
    return {
      errors,
      valid: Object.keys(errors).length === 0,
    };
  }

  function setFieldError(fieldName: string, error?: string) {
    rawForm.setFieldMeta(fieldName as never, (meta) => ({
      ...meta,
      errorMap: {
        ...meta?.errorMap,
        onServer: error,
      },
    }));
  }

  function clearValidation(
    fieldNames?: FormFieldName<TValues> | Array<FormFieldName<TValues>>,
  ) {
    let requestedFieldNames: Array<FormFieldName<TValues>> | undefined;
    if (Array.isArray(fieldNames)) {
      requestedFieldNames = fieldNames;
    } else if (fieldNames) {
      requestedFieldNames = [fieldNames];
    }
    const targetFieldNames = requestedFieldNames ?? [
      ...new Set([
        ...validationInvalidators.keys(),
        ...Object.keys(rawForm.getAllErrors().fields),
      ]),
    ];

    for (const fieldName of targetFieldNames) {
      invalidateFieldValidation(fieldName);
      revealedFields.delete(fieldName);
      rawForm.setFieldMeta(fieldName as never, (meta) => ({
        ...meta,
        errorMap: {},
      }));
    }
  }

  /**
   * TanStack moves the value, but its meta shift is not enough on its own:
   * - it rewrites the first `[n]` in each path, which is the wrong index for
   *   an array nested in another array;
   * - fields rendered under a new path remount (rows keyed by `rowKey`), and
   *   TanStack clears a field's errors when its old instance unmounts;
   * - the progressive-validation reveal state here is keyed by path.
   * So the meta of every moved item is snapshotted and written back under the
   * item's new index.
   */
  async function moveFieldValue(fieldName: string, from: number, to: number) {
    const items = rawForm.getFieldValue(fieldName as never) as unknown;
    if (
      !Array.isArray(items)
      || from === to
      || !isArrayIndex(from, items.length)
      || !isArrayIndex(to, items.length)
    ) {
      return;
    }

    const low = Math.min(from, to);
    const high = Math.max(from, to);
    function getMovedPath(path: string) {
      const itemPath = parseArrayItemPath(fieldName, path);
      if (!itemPath || itemPath.index < low || itemPath.index > high) {
        return undefined;
      }
      return `${fieldName}[${getMovedIndex(itemPath.index, from, to)}]${itemPath.rest}`;
    }

    type FieldMeta = NonNullable<ReturnType<typeof rawForm.getFieldMeta>>;
    const movedMeta = new Map<string, FieldMeta>();
    const affectedPaths: Array<string> = [];
    for (const path of Object.keys(rawForm.state.fieldMeta)) {
      const movedPath = getMovedPath(path);
      const meta = rawForm.getFieldMeta(path as never);
      if (movedPath === undefined) {
        continue;
      }
      affectedPaths.push(path);
      if (meta) {
        movedMeta.set(movedPath, meta);
      }
    }

    const revealedPaths = [...revealedFields];
    revealedFields.clear();
    for (const path of revealedPaths) {
      revealedFields.add(getMovedPath(path) ?? path);
    }

    // An async result started before the move would land on whichever item
    // has that path now.
    for (const path of [
      ...validationInvalidators.keys(),
    ]) {
      if (getMovedPath(path) !== undefined) {
        invalidateFieldValidation(path);
      }
    }

    batch(() => {
      rawForm.moveFieldValues(fieldName as never, from, to);
      for (const [path, meta] of movedMeta) {
        rawForm.setFieldMeta(path as never, meta);
      }
      for (const path of affectedPaths) {
        if (!movedMeta.has(path)) {
          rawForm.setFieldMeta(path as never, (meta) => ({
            ...meta,
            errorMap: {},
            errorSourceMap: {},
            isBlurred: false,
            isDirty: false,
            isTouched: false,
            isValidating: false,
          }));
        }
      }
    });

    // Remounted fields render on the next flush, clearing their errors as the
    // old instances unmount. Restore what the move put there.
    await nextTick();
    for (const [path, meta] of movedMeta) {
      const currentMeta = rawForm.getFieldMeta(path as never);
      if (
        currentMeta
        && hasErrors(meta.errorMap)
        && !hasErrors(currentMeta.errorMap)
      ) {
        rawForm.setFieldMeta(path as never, (current) => ({
          ...current,
          errorMap: meta.errorMap,
          errorSourceMap: meta.errorSourceMap,
        }));
      }
    }
  }

  async function reset(
    resetState?: { values?: Partial<TValues> },
    options?: FormResetOptions,
  ) {
    for (const fieldName of validationInvalidators.keys()) {
      invalidateFieldValidation(fieldName);
    }
    revealedFields.clear();
    const partialValues = resetState?.values;
    let resetValues: TValues | undefined;
    if (partialValues) {
      resetValues = options?.force
        ? (partialValues as TValues)
        : (mergeWithArrayOverride(
            partialValues,
            rawForm.options.defaultValues ?? defaultValues,
          ) as TValues);
    }
    rawForm.reset(resetValues, {
      keepDefaultValues: options?.keepDefaultValues,
    });
  }

  async function submit() {
    await rawForm.handleSubmit();
  }

  const actions: FormActions<TValues> = {
    clearValidation,
    get errors() {
      return errors.value;
    },
    fieldComponent: RuntimeField,
    get meta() {
      return meta.value;
    },
    get values() {
      return values.value;
    },
    getFieldError,
    getFieldValue(fieldName) {
      return rawForm.getFieldValue(fieldName as never) as FormFieldValue<
        TValues,
        typeof fieldName
      >;
    },
    handleSubmit(callback?) {
      return async (event?: Event) => {
        event?.preventDefault();
        event?.stopPropagation();
        const result = await validate();
        if (result.valid) {
          await callback?.(values.value as TValues);
        }
      };
    },
    isFieldValid(fieldName) {
      return !getFieldError(fieldName);
    },
    moveFieldValue,
    pushFieldValue(fieldName, value) {
      rawForm.pushFieldValue(fieldName as never, value as never);
    },
    async removeFieldValue(fieldName, index) {
      await rawForm.removeFieldValue(fieldName as never, index);
    },
    reset,
    setFieldError,
    async setFieldValue(fieldName, value, shouldValidate) {
      rawForm.setFieldValue(fieldName as never, value as never, {
        dontValidate: !shouldValidate,
      });
      if (shouldValidate) {
        await validateField(fieldName);
      }
    },
    async setValues(values, shouldValidate) {
      batch(() => {
        for (const [fieldName, value] of Object.entries(values)) {
          rawForm.setFieldValue(fieldName as never, value as never, {
            dontValidate: !shouldValidate,
          });
        }
      });
      if (shouldValidate) {
        await validate();
      }
    },
    submit,
    useSelector(selector) {
      return computed(() => selector(runtimeState.value));
    },
    useFieldError,
    useFieldValidating,
    useFieldValue,
    useFieldValues,
    useValues() {
      return values;
    },
    validate,
    validateField,
  };

  return actions;
}
