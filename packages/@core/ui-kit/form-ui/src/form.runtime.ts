import type { FieldValidationInvalidator } from './form.runtime-field';
import type {
  FormActions,
  FormFieldName,
  FormFieldValue,
  FormResetOptions,
  FormRuntimeState,
  FormValues,
} from './form.types';

import { mergeWithArrayOverride } from '@taman-core/shared/utils';
import { batch } from '@tanstack/store';
import { useForm } from '@tanstack/vue-form';
import { computed, shallowRef } from 'vue';

import { createRuntimeFieldComponent } from './form.runtime-field';

function normalizeError(error: unknown): string | undefined {
  if (typeof error === 'string') {
    return error;
  }
  if (error && typeof error === 'object' && 'message' in error) {
    const message = Reflect.get(error, 'message');
    return typeof message === 'string' ? message : undefined;
  }
  return error === undefined || error === null ? undefined : String(error);
}

function normalizeFieldMetaError(meta: unknown) {
  if (!meta || typeof meta !== 'object' || !('errors' in meta)) {
    return undefined;
  }
  const errors = Reflect.get(meta, 'errors');
  return normalizeError(Array.isArray(errors) ? errors[0] : undefined);
}

export function useFormRuntime<TValues extends FormValues>(
  defaultValues: TValues,
): FormActions<TValues> {
  const rawForm = useForm({
    defaultValues,
    onSubmit: () => {},
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
    validating: isValidating.value || isAnyFieldValidating.value,
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
      errors: error ? { [fieldName]: error } : {},
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
      rawForm.setFieldMeta(fieldName as never, (meta) => ({
        ...meta,
        errorMap: {},
      }));
    }
  }

  async function reset(
    resetState?: { values?: Partial<TValues> },
    options?: FormResetOptions,
  ) {
    for (const fieldName of validationInvalidators.keys()) {
      invalidateFieldValidation(fieldName);
    }
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
