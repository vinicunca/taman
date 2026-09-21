import type { Component } from 'vue';

import { defineComponent, h, markRaw, onUnmounted } from 'vue';

type AsyncFieldValidator = (...args: Array<any>) => Promise<unknown> | unknown;
interface AsyncStandardSchemaValidator {
  '~standard': {
    validate: (value: unknown) =>
      | Promise<{ issues?: ReadonlyArray<unknown> }>
      | { issues?: ReadonlyArray<unknown> };
  };
}

function isAsyncStandardSchemaValidator(
  validator: unknown,
): validator is AsyncStandardSchemaValidator {
  return Boolean(
    validator
    && typeof validator === 'object'
    && '~standard' in validator,
  );
}

export type FieldValidationInvalidator = () => void;

const asyncValidatorKeys = [
  'onBlurAsync',
  'onChangeAsync',
  'onDynamicAsync',
  'onSubmitAsync',
] as const;

export function createRuntimeFieldComponent(
  fieldComponent: Component,
  registerInvalidator: (
    fieldName: string,
    invalidator: FieldValidationInvalidator,
  ) => () => void,
  onValidatingChange: (fieldName: string, delta: -1 | 1) => void,
) {
  return markRaw(
    defineComponent({
      inheritAttrs: false,
      setup(_, { attrs, slots }) {
        const fieldName = String(attrs.name ?? '');
        let validationRunId = 0;
        let cachedValidators: Record<string, any> | undefined;
        let cachedWrappedValidators: Record<string, any> | undefined;
        const unregisterInvalidator = registerInvalidator(fieldName, () => {
          validationRunId += 1;
        });
        onUnmounted(unregisterInvalidator);

        function wrapValidators(validators: Record<string, any>) {
          if (validators === cachedValidators && cachedWrappedValidators) {
            return cachedWrappedValidators;
          }
          const wrappedValidators = { ...validators };
          for (const key of asyncValidatorKeys) {
            const validator = validators[key] as
              | AsyncFieldValidator
              | AsyncStandardSchemaValidator
              | undefined;
            if (
              typeof validator !== 'function'
              && !isAsyncStandardSchemaValidator(validator)
            ) {
              continue;
            }
            wrappedValidators[key] = async (...args: Array<any>) => {
              const currentValidationRunId = ++validationRunId;
              onValidatingChange(fieldName, 1);
              try {
                const result = typeof validator === 'function'
                  ? await validator(...args)
                  : (await validator['~standard'].validate(args[0]?.value)).issues;
                return currentValidationRunId === validationRunId
                  ? result
                  : undefined;
              } finally {
                onValidatingChange(fieldName, -1);
              }
            };
          }
          cachedValidators = validators;
          cachedWrappedValidators = wrappedValidators;
          return wrappedValidators;
        }

        return () => {
          const validators = attrs.validators as
            | Record<string, any>
            | undefined;
          return h(
            fieldComponent,
            {
              ...attrs,
              ...(validators ? { validators: wrapValidators(validators) } : {}),
            },
            slots,
          );
        };
      },
    }),
  );
}
