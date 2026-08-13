import type {
  ExtendedFormApi,
  FormItemDependencies,
  FormSchemaRuleType,
  MaybeComponentProps,
} from '../types';

import { computed, isRef, ref, watch } from 'vue';

import { get, isBoolean, isFunction } from '@taman-core/shared/utils';

import { useFormValues } from 'vee-validate';

import { resolveFieldNamePath } from '../field-name';
import { injectFormProps } from '../use-form-context';
import { injectRenderFormProps } from './context';

/**
 * Resolve a nested object field value from form values
 * @param values Form values
 * @param fieldName Field name
 */
function resolveValueByFieldName(
  values: Record<string, any>,
  fieldName: string,
) {
  // vee-validate: [] disables nesting
  const { rawKey } = resolveFieldNamePath(fieldName);
  if (rawKey) {
    return values[rawKey];
  }

  return get(values, fieldName);
}
export default function useDependencies(
  getDependencies: () => FormItemDependencies | undefined,
) {
  const values = useFormValues();

  const [extendApi] = injectFormProps();
  const formRenderProps = injectRenderFormProps();

  const formApi = formRenderProps.form;

  if (!formApi) {
    throw new Error('Form api is required in useDependencies');
  }

  if (!values) {
    throw new Error('useDependencies should be used within <VbenForm>');
  }

  // Exposes extendApi access within dependencies
  const getController = (): ExtendedFormApi => {
    const controller = isRef(extendApi)
      ? extendApi.value.formApi
      : extendApi.formApi;

    if (!controller) {
      throw new Error('formApi is required in useDependencies');
    }

    return controller;
  };

  const isIf = ref(true);
  const isDisabled = ref(false);
  const isShow = ref(true);
  const isRequired = ref(false);
  const dynamicComponentProps = ref<MaybeComponentProps>({});
  const dynamicRules = ref<FormSchemaRuleType>();

  const triggerFieldValues = computed(() => {
    // This field may be triggered by multiple fields
    const triggerFields = getDependencies()?.triggerFields ?? [];
    return triggerFields.map((dep) => {
      return resolveValueByFieldName(values.value, dep);
    });
  });

  const resetConditionState = () => {
    isDisabled.value = false;
    isIf.value = true;
    isShow.value = true;
    isRequired.value = false;
    dynamicRules.value = undefined;
    dynamicComponentProps.value = {};
  };

  watch(
    [triggerFieldValues, getDependencies],
    async ([_values, dependencies]) => {
      if (!dependencies || !dependencies?.triggerFields?.length) {
        return;
      }
      resetConditionState();
      const {
        componentProps,
        disabled,
        if: whenIf,
        required,
        rules,
        show,
        trigger,
      } = dependencies;

      // 1. Evaluate `if` first; when false, skip DOM and remaining checks
      const formValues = values.value;

      if (isFunction(whenIf)) {
        isIf.value = !!(await whenIf(formValues, formApi, getController()));
        // Do not render
        if (!isIf.value) return;
      } else if (isBoolean(whenIf)) {
        isIf.value = whenIf;
        if (!isIf.value) return;
      }

      // 2. Evaluate `show`; when false, hide via CSS
      if (isFunction(show)) {
        isShow.value = !!(await show(formValues, formApi, getController()));
      } else if (isBoolean(show)) {
        isShow.value = show;
      }

      if (isFunction(componentProps)) {
        dynamicComponentProps.value = await componentProps(
          formValues,
          formApi,
          getController(),
        );
      }

      if (isFunction(rules)) {
        dynamicRules.value = await rules(formValues, formApi, getController());
      }

      if (isFunction(disabled)) {
        isDisabled.value = !!(await disabled(
          formValues,
          formApi,
          getController(),
        ));
      } else if (isBoolean(disabled)) {
        isDisabled.value = disabled;
      }

      if (isFunction(required)) {
        isRequired.value = !!(await required(
          formValues,
          formApi,
          getController(),
        ));
      }

      if (isFunction(trigger)) {
        await trigger(formValues, formApi, getController());
      }
    },
    { deep: true, immediate: true },
  );

  return {
    dynamicComponentProps,
    dynamicRules,
    isDisabled,
    isIf,
    isRequired,
    isShow,
  };
}
