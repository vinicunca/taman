import type {
  ExtendedFormApi,
  FormDependenciesResolveContext,
  FormDependenciesResolvedState,
  FormItemDependencies,
  FormSchemaContext,
  FormSchemaRuleType,
  MaybeComponentProps,
} from '../form.types';

import { clone, get, isDeepEqual } from '@taman-core/shared/utils';
import { computed, isRef, onScopeDispose, shallowRef, watch } from 'vue';

import { resolveFieldNamePath } from '../form.field-name';
import { injectFormProps } from '../form.use-form-context';
import { injectRenderFormProps } from './form-render.context';

interface DependencyState {
  dynamicComponentProps: MaybeComponentProps;
  dynamicHelp: FormDependenciesResolvedState['help'];
  dynamicHelpResolved: boolean;
  dynamicRenderComponentContent: FormDependenciesResolvedState['renderComponentContent'];
  dynamicRenderComponentContentResolved: boolean;
  dynamicRules: FormSchemaRuleType | undefined;
  dynamicRulesResolved: boolean;
  isDisabled: boolean;
  isIf: boolean;
  isRequired: boolean;
  isShow: boolean;
}

/**
 * Resolve the value of the nested objects corresponding to the field name
 * @param values form values
 * @param fieldName field name
 */
function resolveValueByFieldName(
  values: Record<string, any>,
  fieldName: string,
) {
  // [] means disable nested
  const { rawKey } = resolveFieldNamePath(fieldName);
  if (rawKey) {
    return values[rawKey];
  }

  return get(values, fieldName);
}

function createDependencyState(
  patch: FormDependenciesResolvedState = {},
): DependencyState {
  return {
    dynamicComponentProps: patch.componentProps ?? {},
    dynamicHelp: patch.help,
    dynamicHelpResolved: Reflect.has(patch, 'help'),
    dynamicRenderComponentContent: patch.renderComponentContent,
    dynamicRenderComponentContentResolved: Reflect.has(
      patch,
      'renderComponentContent',
    ),
    dynamicRules: patch.rules,
    dynamicRulesResolved: Reflect.has(patch, 'rules'),
    isDisabled: patch.disabled ?? false,
    isIf: patch.if ?? true,
    isRequired: patch.required ?? false,
    isShow: patch.show ?? true,
  };
}

export default function useDependencies(
  getDependencies: () => FormItemDependencies | undefined,
  getSchemaContext: () => FormSchemaContext = () => ({}),
) {
  const [extendApi] = injectFormProps();
  const formRenderProps = injectRenderFormProps();

  const formApi = formRenderProps.form;

  if (!formApi) {
    throw new Error('Form api is required in useDependencies');
  }

  const values = formApi.useValues();
  const initialTriggerFields = getDependencies()?.triggerFields ?? [];
  const initialTriggerValues = formApi.useFieldValues(initialTriggerFields);

  // Provide the ability to access extendApi in dependencies
  function getController(): ExtendedFormApi {
    const controller = isRef(extendApi)
      ? extendApi.value.formApi
      : extendApi.formApi;

    if (!controller) {
      throw new Error('formApi is required in useDependencies');
    }

    return controller as unknown as ExtendedFormApi;
  }

  const dependencyState = shallowRef(createDependencyState());
  let previousDependencies: FormItemDependencies | undefined;
  let previousTriggerValues: Array<any> | undefined;
  let dependencyEvaluationId = 0;

  const triggerFieldValues = computed(() => {
    // This field may be triggered by multiple fields
    const triggerFields = getDependencies()?.triggerFields ?? [];
    const usesInitialTriggerFields
      = triggerFields.length === initialTriggerFields.length
        && triggerFields.every(
          (fieldName, index) => fieldName === initialTriggerFields[index],
        );
    if (usesInitialTriggerFields) {
      return initialTriggerValues.value;
    }
    return triggerFields.map((dep) => {
      return resolveValueByFieldName(values.value, dep);
    });
  });

  function resetConditionState() {
    dependencyState.value = createDependencyState();
  }

  watch(
    [triggerFieldValues, getDependencies],
    async ([currentTriggerValues, dependencies]) => {
      if (!dependencies || !dependencies?.triggerFields?.length) {
        dependencyEvaluationId += 1;
        previousDependencies = dependencies;
        previousTriggerValues = undefined;
        resetConditionState();
        return;
      }
      if (
        dependencies === previousDependencies
        && previousTriggerValues
        && isDeepEqual(currentTriggerValues, previousTriggerValues)
      ) {
        return;
      }
      previousDependencies = dependencies;
      previousTriggerValues = clone(currentTriggerValues);
      const currentEvaluationId = ++dependencyEvaluationId;
      const context: FormDependenciesResolveContext = {
        actions: formApi,
        controller: getController(),
        schema: {
          ...getSchemaContext(),
          rootValues: values.value,
        },
        values: values.value,
      };
      const patch = await dependencies.resolve(context);
      if (currentEvaluationId !== dependencyEvaluationId) {
        return;
      }
      dependencyState.value = createDependencyState(patch);
    },
    { immediate: true },
  );

  onScopeDispose(() => {
    dependencyEvaluationId += 1;
  });

  return {
    dynamicComponentProps: computed(
      () => dependencyState.value.dynamicComponentProps,
    ),
    dynamicHelp: computed(() => dependencyState.value.dynamicHelp),
    dynamicHelpResolved: computed(
      () => dependencyState.value.dynamicHelpResolved,
    ),
    dynamicRenderComponentContent: computed(
      () => dependencyState.value.dynamicRenderComponentContent,
    ),
    dynamicRenderComponentContentResolved: computed(
      () => dependencyState.value.dynamicRenderComponentContentResolved,
    ),
    dynamicRules: computed(() => dependencyState.value.dynamicRules),
    dynamicRulesResolved: computed(
      () => dependencyState.value.dynamicRulesResolved,
    ),
    isDisabled: computed(() => dependencyState.value.isDisabled),
    isIf: computed(() => dependencyState.value.isIf),
    isRequired: computed(() => dependencyState.value.isRequired),
    isShow: computed(() => dependencyState.value.isShow),
  };
}
