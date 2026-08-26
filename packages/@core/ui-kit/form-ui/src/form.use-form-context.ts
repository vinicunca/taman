import type { ComputedRef } from 'vue';
import type { ZodType } from 'zod';

import type { ExtendedFormApi, FormActions, TamanFormProps } from './form.types';

import { isString, mergeWithArrayOverride, set } from '@taman-core/shared/utils';
import { createContext } from '@taman-core/taman-ui';
import { computed, toRaw, unref, useSlots } from 'vue';
import { object } from 'zod';
import { getDefaultsForSchema } from 'zod-defaults';

import { useFormRuntime } from './form.runtime';
import {
  getCustomDefaultValue,
  schemaForZodDefaults,
} from './form.schema-defaults';

type ExtendFormProps = TamanFormProps & {
  formApi?: ExtendedFormApi<any, any, any>;
};

export const [
  injectFormProps,
  provideFormProps,
] = createContext<[ComputedRef<ExtendFormProps> | ExtendFormProps, FormActions]>(
  'TamanFormProps',
);

export const [
  injectComponentRefMap,
  provideComponentRefMap,
] = createContext<Map<string, unknown>>('ComponentRefMap');

export function useFormInitial(
  props: ComputedRef<TamanFormProps> | TamanFormProps,
) {
  const slots = useSlots();
  const initialValues = generateInitialValues();

  const form = useFormRuntime(initialValues);

  const delegatedSlots = computed(() => {
    const resultSlots: Array<string> = [];

    for (const key of Object.keys(slots)) {
      if (key !== 'default') {
        resultSlots.push(key);
      }
    }
    return resultSlots;
  });

  function generateInitialValues() {
    const initialValues: Record<string, any> = {};

    const zodObject: Record<string, ZodType> = {};
    (unref(props).schema || []).forEach((item) => {
      if (Reflect.has(item, 'defaultValue')) {
        set(initialValues, item.fieldName, item.defaultValue);
      } else if (item.rules && !isString(item.rules)) {
        // Check whether the rule is suitable for extracting default values.
        const rawRules = toRaw(item.rules);
        const customDefaultValue = getCustomDefaultValue(rawRules);
        zodObject[item.fieldName] = schemaForZodDefaults(rawRules);
        if (customDefaultValue !== undefined) {
          initialValues[item.fieldName] = customDefaultValue;
        }
      }
    });

    const schemaInitialValues = getDefaultsForSchema(object(zodObject));

    const zodDefaults: Record<string, any> = {};
    for (const key of Object.keys(schemaInitialValues)) {
      set(zodDefaults, key, schemaInitialValues[key]);
    }
    return mergeWithArrayOverride(initialValues, zodDefaults);
  }

  return {
    delegatedSlots,
    form,
  };
}
