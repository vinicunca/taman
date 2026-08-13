<script setup lang="ts">
import type { ZodType } from 'zod';

import type {
  FormActions,
  FormFieldProps,
  MaybeComponentProps,
} from '../types';

import { cn, isFunction, isPlainObject, isString } from '@taman-core/shared/utils';
import { ChevronsDown, CircleAlert } from '@taman-core/icons';
import {
  Button,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
  VbenCollapsible,
  VbenRenderContent,
  VbenTooltip,
} from '@vben-core/shadcn-ui';
import { toTypedSchema } from '@vee-validate/zod';
import { useFieldError, useFormValues } from 'vee-validate';
import {
  computed,
  nextTick,
  onUnmounted,
  ref,
  useTemplateRef,
  watch,
} from 'vue';

import { injectComponentRefMap } from '../use-form-context';
import { injectRenderFormProps, useFormContext } from './context';
import useDependencies from './dependencies';
import FormLabel from './form-label.vue';
import { isEventObjectLike } from './helper';

interface Props extends FormFieldProps {}

const {
  colon,
  commonComponentProps,
  component,
  componentProps,
  dependencies,
  description,
  disabled,
  disabledOnChangeListener,
  disabledOnInputListener,
  emptyStateValue,
  fieldName,
  formFieldProps,
  hide,
  label,
  labelClass,
  labelWidth,
  modelPropName,
  renderComponentContent,
  rules,
  help,
  collapsible,
  defaultCollapsed = false,
} = defineProps<
  Props & {
    commonComponentProps: MaybeComponentProps;
  }
>();

const { componentBindEventMap, componentMap, isVertical } = useFormContext();
const formRenderProps = injectRenderFormProps();
const values = useFormValues();
const errors = useFieldError(fieldName);
const fieldComponentRef = useTemplateRef<HTMLInputElement>('fieldComponentRef');
const formApi = formRenderProps.form;
const compact = computed(() => formRenderProps.compact);
const isInValid = computed(() => errors.value?.length > 0);
const collapseOpen = ref(!defaultCollapsed);

function getFormApi(): FormActions {
  if (!formApi) {
    throw new Error('Form api is required in <FormField />');
  }

  return formApi;
}

const FieldComponent = computed(() => {
  const finalComponent = isString(component)
    ? componentMap.value[component]
    : component;
  if (!finalComponent) {
    // Component not registered
    console.warn(`Component ${component} is not registered`);
  }
  return finalComponent;
});

const {
  dynamicComponentProps,
  dynamicRules,
  isDisabled,
  isIf,
  isRequired,
  isShow,
} = useDependencies(() => dependencies);

const labelStyle = computed(() => {
  return labelClass?.includes('w-') || isVertical.value
    ? {}
    : {
        width: `${labelWidth}px`,
      };
});

const currentRules = computed(() => {
  return dynamicRules.value || rules;
});

const visible = computed(() => {
  return !hide && isIf.value && isShow.value;
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

  let isOptional = currentRules?.value?.isOptional?.();

  // Fields with a default value are not required; handle separately
  const typeName = currentRules?.value?._def?.typeName;
  if (typeName === 'ZodDefault') {
    const innerType = currentRules?.value?._def.innerType;
    if (innerType) {
      isOptional = innerType.isOptional?.();
    }
  }

  return !isOptional;
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
    const unwrappedRules = (rules as any)?.unwrap?.();
    if (unwrappedRules) {
      rules = unwrappedRules;
    }
  }
  return toTypedSchema(rules as ZodType);
});

const computedProps = computed(() => {
  const finalComponentProps = isFunction(componentProps)
    ? componentProps(values.value, getFormApi())
    : componentProps;

  return {
    ...commonComponentProps,
    ...finalComponentProps,
    ...dynamicComponentProps.value,
  };
});

// Custom help content
const computedHelp = computed(() => {
  const helpContent = help;
  if (!helpContent) {
    return undefined;
  }
  return () =>
    isFunction(helpContent)
      ? helpContent(values.value, getFormApi())
      : helpContent;
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
  return isDisabled.value || disabled || computedProps.value?.disabled;
});

const customContentRender = computed(() => {
  if (!isFunction(renderComponentContent)) {
    return {};
  }
  return renderComponentContent(values.value, getFormApi());
});

const renderContentKey = computed(() => {
  return Object.keys(customContentRender.value);
});

const fieldProps = computed(() => {
  const rules = fieldRules.value;
  return {
    keepValue: true,
    label: isString(label) ? label : '',
    ...(rules ? { rules } : {}),
    ...(formFieldProps as Record<string, any>),
  };
});

function fieldBindEvent(slotProps: Record<string, any>) {
  const modelValue = slotProps.componentField.modelValue;
  const handler = slotProps.componentField['onUpdate:modelValue'];

  const bindEventField
    = modelPropName
      || (isString(component) ? componentBindEventMap.value?.[component] : null);

  let value = modelValue;
  // Some Ant Design components pass an event object
  if (modelValue && isPlainObject(modelValue) && bindEventField) {
    value = isEventObjectLike(modelValue)
      ? modelValue?.target?.[bindEventField]
      : (modelValue?.[bindEventField] ?? modelValue);
  }

  if (bindEventField) {
    return {
      [`onUpdate:${bindEventField}`]: handler,
      [bindEventField]: value === undefined ? emptyStateValue : value,
      onChange: disabledOnChangeListener
        ? undefined
        : (e: Record<string, any>) => {
            const shouldUnwrap = isEventObjectLike(e);
            const onChange = slotProps?.componentField?.onChange;
            if (!shouldUnwrap) {
              return onChange?.(e);
            }

            return onChange?.(e?.target?.[bindEventField] ?? e);
          },
      ...(disabledOnInputListener ? { onInput: undefined } : {}),
    };
  }
  return {
    ...(disabledOnInputListener ? { onInput: undefined } : {}),
    ...(disabledOnChangeListener ? { onChange: undefined } : {}),
  };
}

function createComponentProps(slotProps: Record<string, any>) {
  const bindEvents = fieldBindEvent(slotProps);

  const binds = {
    ...slotProps.componentField,
    ...computedProps.value,
    ...bindEvents,
    ...(Reflect.has(computedProps.value, 'onChange')
      ? { onChange: computedProps.value.onChange }
      : {}),
    ...(Reflect.has(computedProps.value, 'onInput')
      ? { onInput: computedProps.value.onInput }
      : {}),
  };

  return binds;
}

function autofocus() {
  if (
    fieldComponentRef.value
    && isFunction(fieldComponentRef.value.focus)
    // Check whether any element is currently focused
    && document.activeElement !== fieldComponentRef.value
  ) {
    fieldComponentRef.value?.focus?.();
  }
}

const shouldCollapsible = computed(() => {
  return collapsible; /* && isVertical.value; */
});

function toggleCollapsed() {
  collapseOpen.value = !collapseOpen.value;
}

const componentRefMap = injectComponentRefMap();
watch(fieldComponentRef, (componentRef) => {
  componentRefMap?.set(fieldName, componentRef);
});
onUnmounted(() => {
  if (componentRefMap?.has(fieldName)) {
    componentRefMap.delete(fieldName);
  }
});
</script>

<template>
  <FormField
    v-if="!hide && isIf"
    v-slot="slotProps"
    v-bind="fieldProps"
    :name="fieldName"
  >
    <FormItem
      v-show="isShow"
      :class="{
        'form-valid-error': isInValid,
        'form-is-required': shouldRequired,
        'flex-col': isVertical,
        'flex-row items-center': !isVertical,
        'pb-4': !compact,
        'pb-2': compact,
      }"
      class="flex relative"
      v-bind="$attrs"
    >
      <FormLabel
        v-if="!hideLabel"
        :class="
          cn(
            'flex leading-6',
            {
              'mr-2 shrink-0 justify-end': !isVertical,
              'mb-1 flex-row': isVertical,
              'self-start': shouldCollapsible && !isVertical,
            },
            labelClass,
          )
        "
        :help="computedHelp"
        :colon="colon"
        :label="label"
        :required="shouldRequired && !hideRequiredMark"
        :style="labelStyle"
      >
        <template v-if="label">
          <VbenRenderContent :content="label" />
        </template>
        <template #extra>
          <Button
            v-if="shouldCollapsible"
            class="ml-0.5"
            variant="icon"
            size="icon"
            @click.prevent="toggleCollapsed"
          >
            <ChevronsDown
              :size="16"
              class="transition-transform"
              :class="{
                'rotate-180': !collapseOpen,
              }"
            />
          </Button>
        </template>
      </FormLabel>
      <div class="p-px flex-auto overflow-hidden">
        <VbenCollapsible
          v-model:open="collapseOpen"
          :show-trigger="false"
        >
          <template #collapsibleContent>
            <div :class="cn('relative flex w-full items-center', wrapperClass)">
              <FormControl :class="cn(controlClass)">
                <slot
                  v-bind="{
                    ...slotProps,
                    ...createComponentProps(slotProps),
                    disabled: shouldDisabled,
                    isInValid,
                  }"
                >
                  <component
                    :is="FieldComponent"
                    ref="fieldComponentRef"
                    :class="{
                      'border-destructive hover:border-destructive/80 focus:border-destructive focus:shadow-[0_0_0_2px_rgba(255,38,5,0.06)]':
                        isInValid,
                    }"
                    v-bind="createComponentProps(slotProps)"
                    :disabled="shouldDisabled"
                  >
                    <template
                      v-for="name in renderContentKey"
                      :key="name"
                      #[name]="renderSlotProps"
                    >
                      <VbenRenderContent
                        :content="customContentRender[name]"
                        v-bind="{ ...renderSlotProps, formContext: slotProps }"
                      />
                    </template>
                    <!-- <slot></slot> -->
                  </component>
                  <VbenTooltip
                    v-if="compact && isInValid"
                    :delay-duration="300"
                    side="left"
                  >
                    <template #trigger>
                      <slot name="trigger">
                        <CircleAlert
                          :class="
                            cn(
                              'inline-flex size-5 cursor-pointer color-text/80 hover:color-text',
                            )
                          "
                        />
                      </slot>
                    </template>
                    <FormMessage />
                  </VbenTooltip>
                </slot>
              </FormControl>
              <!-- Custom suffix -->
              <div
                v-if="suffix"
                class="ml-1"
              >
                <VbenRenderContent :content="suffix" />
              </div>
            </div>
          </template>
        </VbenCollapsible>

        <FormDescription
          v-if="description"
          class="text-xs"
        >
          <VbenRenderContent :content="description" />
        </FormDescription>

        <Transition
          v-if="!compact"
          name="slide-up"
        >
          <FormMessage class="absolute" />
        </Transition>
      </div>
    </FormItem>
  </FormField>
</template>
