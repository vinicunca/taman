<script setup lang="ts">
import type { ZodType } from 'zod';
import type {
  FormFieldProps,
  FormRuleContext,
  FormRuntimeField,
  MaybeComponentProps,
} from '../form.types';

import { globalShareState } from '@taman-core/shared/global-state';
import { isFunction, isString } from '@taman-core/shared/utils';
import {
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
  TamanRenderContent,
} from '@taman-core/taman-ui';
import PButton from 'pohon-ui/components/Button.vue';
import {
  computed,
  markRaw,
  nextTick,
  onUnmounted,
  ref,
  toRaw,
  useTemplateRef,
  watch,
} from 'vue';
import { toFormFieldValue } from '../form.empty-value';
import { getFormRule } from '../form.rule-registry';
import { useDelayedFlag } from '../form.use-delayed-flag';
import { injectComponentRefMap } from '../form.use-form-context';
import FormRenderFieldCollapsible from './form-render-field-collapsible.vue';
import FormRenderFieldControl from './form-render-field-control.vue';
import FormLabel from './form-render-form-label.vue';
import { injectRenderFormProps, useFormContext } from './form-render.context';
import useDependencies from './form-render.dependencies';
import { getBaseRules } from './form-render.helper';

interface RuntimeFieldSlotProps {
  field: FormRuntimeField<any>;
}

const props = withDefaults(
  defineProps<
    FormFieldProps & {
      commonComponentProps: MaybeComponentProps;
      /**
     * Whether this entry is currently hidden while the form is collapsed.
     * Rendered via `v-show` so the field survives toggling.
     */
      hidden?: boolean;
    }
  >(),
  {
    hidden: false,
    defaultCollapsed: false,
    hideMessage: false,
  },
);

const VALIDATION_LOADING_DELAY_MS = 150;

const { componentMap } = useFormContext();
const formRenderProps = injectRenderFormProps();
const fieldComponentRef = useTemplateRef<HTMLInputElement>('fieldComponentRef');
const formApi = formRenderProps.form;
if (!formApi) {
  throw new Error('Form api is required in <FormField />');
}
const error = formApi.useFieldError(props.fieldName);
const fieldValue = formApi.useFieldValue(props.fieldName);
const isFieldValidating = formApi.useFieldValidating(props.fieldName);
const validationLoading = useDelayedFlag(
  () => isFieldValidating.value,
  VALIDATION_LOADING_DELAY_MS,
);
const compact = computed(() => formRenderProps.compact);
const isInValid = computed(() => Boolean(error.value));
const shouldApplyInvalidStyle = computed(() => {
  return isInValid.value && props.component !== 'TamanFormFieldArray';
});
const collapseOpen = ref(!props.defaultCollapsed);

const FieldComponent = computed(() => {
  const { component } = props;

  const finalComponent = isString(component)
    ? componentMap.value[component]
    ?? globalShareState.getComponents()[component]
    : component;
  if (!finalComponent) {
    // Component not registered
    console.warn(`Component ${component} is not registered`);
  }
  return finalComponent ? markRaw(toRaw(finalComponent)) : finalComponent;
});

const {
  dynamicComponentProps,
  dynamicHelp,
  dynamicHelpResolved,
  dynamicRenderComponentContent,
  dynamicRenderComponentContentResolved,
  dynamicRules,
  dynamicRulesResolved,
  isDisabled,
  isIf,
  isRequired,
  isShow,
} = useDependencies(
  () => props.dependencies,
  () => ({ fieldName: props.fieldName }),
);

const currentRules = computed(() => {
  const currentRule = dynamicRulesResolved.value ? dynamicRules.value : props.rules;
  return currentRule && !isString(currentRule)
    ? toRaw(currentRule)
    : currentRule;
});

const visible = computed(() => {
  return !props.hide && isIf.value && isShow.value;
});

const shouldRequired = computed(() => {
  if (!visible.value) {
    return false;
  }

  if (!currentRules.value) {
    return isRequired.value;
  }

  if (isRequired.value) {
    return true;
  }

  if (isString(currentRules.value)) {
    return ['required', 'selectRequired'].includes(currentRules.value);
  }

  return !currentRules.value.isOptional();
});

const fieldRules = computed(() => {
  if (!visible.value) {
    return null;
  }

  let rules = currentRules.value;
  if (!rules) {
    return isRequired.value ? 'required' : null;
  }

  if (isString(rules)) {
    return rules;
  }

  const isOptional = !shouldRequired.value;
  if (!isOptional) {
    rules = getBaseRules(rules) ?? rules;
  }
  return rules as ZodType;
});

function createNamedRuleValidator(ruleName: string) {
  return ({ value }: { value: any }) => {
    const validator = getFormRule(ruleName);
    if (!validator) {
      console.warn(`Form rule ${ruleName} is not registered`);
      return undefined;
    }

    const { label, fieldName } = props;
    const ruleContext: FormRuleContext = {
      field: {
        label: isString(label) ? label : undefined,
        name: fieldName,
      },
      label: isString(label) ? label : undefined,
      name: fieldName,
    };
    const result = validator(value, [], ruleContext);
    return result === true ? undefined : result;
  };
}

function validateDynamicRules({ value }: { value: any }) {
  const activeRules = fieldRules.value;
  if (!activeRules) {
    return undefined;
  }
  if (isString(activeRules)) {
    return createNamedRuleValidator(activeRules)({ value });
  }

  // Dependency resolvers can replace or disable a rule after the TanStack
  // field mounts. Keep this adapter synchronous while reading the live rule.
  const result = activeRules.safeParse(value);
  return result.success ? undefined : result.error.issues;
}

function createRuleValidator() {
  const activeRules = fieldRules.value;
  if (!activeRules) {
    return props.dependencies ? validateDynamicRules : undefined;
  }

  if (props.dependencies) {
    return validateDynamicRules;
  }

  if (isString(activeRules)) {
    return createNamedRuleValidator(activeRules);
  }

  return activeRules;
}

const fieldValidators = computed(() => {
  const validators: Record<string, unknown> = {};
  const ruleValidator = createRuleValidator();
  if (ruleValidator) {
    const configuredTriggers = props.formFieldProps?.validateOn;
    if (configuredTriggers === undefined) {
      validators.onDynamic = ruleValidator;
    } else {
      const validateOn = new Set(configuredTriggers);
      if (validateOn.has('blur')) {
        validators.onBlur = ruleValidator;
      }
      if (validateOn.has('change')) {
        validators.onChange = ruleValidator;
      }
      if (validateOn.size === 0) {
        validators.onSubmit = ruleValidator;
      }
    }
  }
  return {
    ...validators,
    ...props.formFieldProps?.validators,
  };
});

interface NormalizedIssue {
  message: string;
  path: Array<PropertyKey>;
}

function normalizeIssues(errors: Array<unknown>): Array<NormalizedIssue> {
  const issues: Array<NormalizedIssue> = [];
  const seen = new Set<string>();

  function visit(error: unknown) {
    if (Array.isArray(error)) {
      error.forEach(visit);
      return;
    }

    let message;

    if (isString(error)) {
      message = error;
    } else if (error && typeof error === 'object' && 'message' in error) {
      message = Reflect.get(error, 'message');
    }

    if (!isString(message)) {
      return;
    }

    const rawPath = error && typeof error === 'object' && 'path' in error
      ? Reflect.get(error, 'path')
      : undefined;
    const path = Array.isArray(rawPath) ? [...rawPath] : [];
    const key = `${message}:${JSON.stringify(path)}`;
    if (!seen.has(key)) {
      seen.add(key);
      issues.push({ message, path });
    }
  }

  errors.forEach(visit);
  return issues;
}

const computedProps = computed(() => {
  const { componentProps, commonComponentProps, fieldName } = props;

  const finalComponentProps = isFunction(componentProps)
    ? componentProps({ fieldName })
    : componentProps;

  return {
    ...commonComponentProps,
    ...finalComponentProps,
    ...dynamicComponentProps.value,
  };
});

// Custom help information
const computedHelp = computed(() => {
  const helpContent = dynamicHelpResolved.value ? dynamicHelp.value : props.help;
  if (!helpContent) {
    return undefined;
  }
  return () =>
    isFunction(helpContent) ? helpContent({ fieldName: props.fieldName }) : helpContent;
});

watch(
  () => computedProps.value?.autofocus,
  (value) => {
    if (value === true) {
      nextTick(() => {
        autofocus();
      });
    }
  },
  { immediate: true },
);

const shouldDisabled = computed(() => {
  return Boolean(
    formRenderProps.disabled
    || isDisabled.value
    || props.disabled
    || computedProps.value?.disabled,
  );
});

const customContentRender = computed(() => {
  if (dynamicRenderComponentContentResolved.value) {
    return dynamicRenderComponentContent.value ?? {};
  }
  if (!isFunction(props.renderComponentContent)) {
    return {};
  }
  return props.renderComponentContent({ fieldName: props.fieldName });
});

const renderContentKey = computed(() => {
  return Object.keys(customContentRender.value);
});

const fieldProps = computed(() => {
  return {
    asyncDebounceMs: props.formFieldProps?.asyncDebounceMs,
    validators: fieldValidators.value,
  };
});

function createFieldSlotProps(slotProps: RuntimeFieldSlotProps) {
  const { field } = slotProps;
  function handleChange(value: any) {
    field.handleChange(toFormFieldValue(value));
    if (fieldRules.value) {
      // Once editing resumes, the current change result (if configured)
      // supersedes the stale blur copy. Blur-only fields remain quiet until
      // they are blurred again.
      field.setErrorMap({ onBlur: undefined });
    }
  }
  return {
    ...slotProps,
    componentField: {
      'name': props.fieldName,
      'modelValue': fieldValue.value,
      'onBlur': field.handleBlur,
      'onChange': handleChange,
      'onInput': handleChange,
      'onUpdate:modelValue': handleChange,
    },
  };
}

function resolveModelPropName() {
  return props.modelPropName;
}

function fieldBindEvent(
  componentField: Record<string, any>,
  bindEventField: null | string | undefined,
) {
  const modelValue = componentField.modelValue;
  const handler = componentField['onUpdate:modelValue'];

  if (bindEventField) {
    return {
      [`onUpdate:${bindEventField}`]: handler,
      [bindEventField]: modelValue,
      onChange: undefined,
      onInput: undefined,
    };
  }
  return {
    onChange: undefined,
    onInput: undefined,
  };
}

function createComponentProps(slotProps: RuntimeFieldSlotProps) {
  const normalizedSlotProps = createFieldSlotProps(slotProps);
  const bindEventField = resolveModelPropName();
  const bindEvents = fieldBindEvent(
    normalizedSlotProps.componentField,
    bindEventField,
  );

  const binds = {
    ...computedProps.value,
    // Pohon UI inputs render their visual boundary via `ring`/`outline` on an
    // inner slot, not `border-*` on the root — `color`/`highlight` are the
    // props that theme correctly targets. Ignored (harmless) by components
    // that don't support them.
    ...(
      shouldApplyInvalidStyle.value
        ? { color: 'error', highlight: true }
        : {}
    ),
    // Surface sustained async validation as the component's own `loading`
    // prop. The brief delay prevents fast validators from flashing a spinner.
    loading:
      Boolean(computedProps.value?.loading) || validationLoading.value,
    ...normalizedSlotProps.componentField,
    ...bindEvents,
    disabled: shouldDisabled.value,
    ...(Reflect.has(computedProps.value, 'onChange')
      ? { onChange: computedProps.value.onChange }
      : {}),
    ...(Reflect.has(computedProps.value, 'onInput')
      ? { onInput: computedProps.value.onInput }
      : {}),
  };
  if (bindEventField && bindEventField !== 'modelValue') {
    Reflect.deleteProperty(binds, 'modelValue');
    Reflect.deleteProperty(binds, 'onUpdate:modelValue');
  }

  return binds;
}

function createFieldSlotScope(slotProps: RuntimeFieldSlotProps) {
  return {
    ...createFieldSlotProps(slotProps),
    componentProps: createComponentProps(slotProps),
    disabled: shouldDisabled.value,
    error: error.value,
    isInValid: isInValid.value,
    issues: normalizeIssues(slotProps.field.state.meta.errors),
    modelValue: fieldValue.value,
    name: props.fieldName,
  };
}

function autofocus() {
  if (
    fieldComponentRef.value
    && isFunction(fieldComponentRef.value.focus)
    // Check if there is an element focused
    && document.activeElement !== fieldComponentRef.value
  ) {
    fieldComponentRef.value?.focus?.();
  }
}

function toggleCollapsed() {
  collapseOpen.value = !collapseOpen.value;
}

const componentRefMap = injectComponentRefMap();
watch(fieldComponentRef, (componentRef) => {
  componentRefMap?.set(props.fieldName, componentRef);
});
onUnmounted(() => {
  if (componentRefMap?.has(props.fieldName)) {
    componentRefMap.delete(props.fieldName);
  }
});
</script>

<template>
  <component
    :is="formApi.fieldComponent"
    v-if="!props.hide && isIf"
    v-slot="slotProps"
    v-bind="fieldProps"
    :name="props.fieldName"
  >
    <FormField
      :dirty="slotProps.field.state.meta.isDirty"
      :error="error"
      :name="props.fieldName"
      :touched="slotProps.field.state.meta.isTouched"
      :valid="slotProps.field.state.meta.isValid"
    >
      <FormItem
        v-show="isShow && !props.hidden"
        :class="{
          'form-valid-error': shouldApplyInvalidStyle,
          'form-is-required': shouldRequired,
          'pb-6': !compact && !props.hideMessage,
          'pb-2': compact,
        }"
        class="flex flex-col gap-2 relative"
        v-bind="$attrs"
      >
        <div
          v-if="!props.hideLabel || props.collapsible"
          class="flex items-center"
        >
          <FormLabel
            v-if="!props.hideLabel"
            class="leading-6 flex"
            :class="props.labelClass"
            :help="computedHelp"
            :label="props.label"
            :required="shouldRequired && !props.hideRequiredMark"
          >
            <template v-if="props.label">
              <TamanRenderContent :content="props.label" />
            </template>
          </FormLabel>

          <PButton
            v-if="props.collapsible"
            aria-label="Toggle field"
            class="ml-0.5"
            icon="lucide:chevron-down"
            :aria-expanded="collapseOpen"
            :class="{
              'rotate-180': !collapseOpen,
            }"
            @click.prevent="toggleCollapsed"
          />
        </div>

        <div class="p-px flex-auto w-full">
          <FormRenderFieldCollapsible
            v-model:open="collapseOpen"
            :collapsible="props.collapsible"
          >
            <FormRenderFieldControl
              :control-class="props.controlClass"
              :suffix="props.suffix"
              :wrapper-class="props.wrapperClass"
            >
              <slot v-bind="createFieldSlotScope(slotProps)">
                <component
                  :is="FieldComponent"
                  ref="fieldComponentRef"
                  :class="{
                    'border-error hover:border-error/80 focus:border-error focus:shadow-[0_0_0_2px_rgba(255,38,5,0.06)]':
                      shouldApplyInvalidStyle,
                  }"
                  v-bind="createComponentProps(slotProps)"
                >
                  <template
                    v-for="name in renderContentKey"
                    :key="name"
                    #[name]="renderSlotProps"
                  >
                    <TamanRenderContent
                      :content="customContentRender[name]"
                      v-bind="{
                        ...renderSlotProps,
                        formContext: createFieldSlotProps(slotProps),
                      }"
                    />
                  </template>
                </component>
              </slot>
            </FormRenderFieldControl>
          </FormRenderFieldCollapsible>

          <FormDescription
            v-if="props.description"
            class="text-xs"
          >
            <TamanRenderContent :content="props.description" />
          </FormDescription>

          <div
            v-if="!compact && !props.hideMessage"
            v-auto-animate
          >
            <FormMessage />
          </div>
        </div>
      </FormItem>
    </FormField>
  </component>
</template>
