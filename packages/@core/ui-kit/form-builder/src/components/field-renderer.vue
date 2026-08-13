<script lang="ts" setup>
import type { VNode } from 'vue';

import type { FormApi } from '../form-api';
import type { FieldConfig } from '../types';
import { computed, defineComponent, ref, watch } from 'vue';

import { getPath, setPath } from '../paths';
import { resolveFieldComponent, useFormBuilderConfig } from '../plugin';
import { isRequiredRule } from '../schema';
import { useAsyncValidate } from '../use-async-validate';
import { useDependencies } from '../use-dependencies';

const props = defineProps<{
  errorDisplay?: 'inline' | 'tooltip';
  field: FieldConfig;
  formApi: FormApi;
  labelPlacement?: 'horizontal' | 'vertical';
}>();

// Renders its children as-is (fragment, no element). Paired with the dynamic
// wrapper in the template so ONLY fields with `asyncValidate` gain the
// focusout-capturing div; every other field keeps its unwrapped DOM. Module
// scope: a single shared definition, not re-created per field-renderer instance.
const Passthrough = defineComponent({
  inheritAttrs: false,
  setup: (_, { slots }) => () => slots.default?.(),
});

const config = useFormBuilderConfig();

useDependencies({
  api: props.formApi,
  getDependencies: () => props.field.dependencies,
  name: () => props.field.name,
});

const { onBlur: onAsyncBlur } = useAsyncValidate({
  api: props.formApi,
  field: () => props.field,
});

const runtime = computed(() =>
  props.field.name
    ? props.formApi.getFieldRuntime(props.field.name)
    : undefined,
);

const resolved = computed(() =>
  resolveFieldComponent(props.field.component as any, config),
);

const modelValue = computed({
  get: () => (props.field.name ? getPath(props.formApi.values, props.field.name) : undefined),
  set: (value) => {
    if (props.field.name) {
      setPath(props.formApi.values, props.field.name, value);
    }
  },
});

const registryDefaults = computed(() =>
  typeof props.field.component === 'string'
    ? config.defaults[props.field.component] ?? {}
    : {},
);

const staticProps = computed(() => {
  const raw = props.field.props;
  if (!raw) {
    return {};
  }
  return typeof raw === 'function'
    ? raw(props.formApi.values, props.formApi as any)
    : raw;
});

const mergedProps = computed(() => ({
  ...registryDefaults.value,
  ...staticProps.value,
  ...runtime.value?.dynamicProps,
  ...(runtime.value?.disabled ? { disabled: true } : {}),
}));

const isRequired = computed(() => {
  if (runtime.value?.required !== undefined) {
    return runtime.value.required;
  }
  return isRequiredRule(runtime.value?.dynamicRules ?? props.field.rules);
});

const isHidden = computed(() => {
  const hide = props.field.hide;
  const hidden = typeof hide === 'function' ? hide(props.formApi.values) : !!hide;
  return hidden || runtime.value?.show === false;
});

const currentErrorMessage = computed(() =>
  props.field.name ? props.formApi.getFieldError(props.field.name) : undefined,
);

// Standard "validate late, then validate live" pattern: no validation
// noise on the user's first pass through the field, but once an error has
// been shown (sync, async, or server-set — all flow through the same
// PForm error list), keep re-validating on every keystroke so the error
// clears the instant the value becomes valid and reappears immediately if
// it's broken again. This is deliberately NOT driven by PForm's own
// blurredFields tracking: that only advances on a native blur DOM event,
// which some browsers (Safari) never fire when focus moves to a submit
// button by click, and never fires at all for errors we set ourselves
// (async/server). A user-supplied `formFieldProps.eagerValidation` always
// wins — see the v-bind order below.
const hasErrored = ref(false);
watch(currentErrorMessage, (message) => {
  if (message) {
    hasErrored.value = true;
  }
});

const labelText = computed(() =>
  typeof props.field.label === 'string' ? props.field.label : undefined,
);

const labelFn = computed(() =>
  typeof props.field.label === 'function' ? (props.field.label as () => VNode) : undefined,
);

const helpText = computed(() =>
  typeof props.field.help === 'function'
    ? props.field.help(props.formApi.values)
    : props.field.help,
);

const spanStyle = computed(() => {
  const style: Record<string, string> = {};
  if (props.field.span === 'full') {
    style.gridColumn = '1 / -1';
  } else if (typeof props.field.span === 'number') {
    style.gridColumn = `span ${props.field.span} / span ${props.field.span}`;
  }
  if (props.field.newRow) {
    style.gridColumnStart = '1';
  }
  return style;
});
</script>

<template>
  <PFormField
    v-if="runtime?.if !== false"
    v-show="!isHidden"
    :name="field.name"
    :label="labelText"
    :description="field.description"
    :help="helpText"
    :required="isRequired"
    :orientation="labelPlacement === 'horizontal' ? 'horizontal' : 'vertical'"
    :class="[field.class, field.labelClass]"
    :style="spanStyle"
    :eager-validation="hasErrored"
    v-bind="field.formFieldProps"
  >
    <template
      v-if="labelFn"
      #label
    >
      <component :is="labelFn" />
    </template>
    <template #default="{ error }">
      <component
        :is="field.asyncValidate ? 'div' : Passthrough"
        v-bind="
          field.asyncValidate
            ? { 'data-async-validate': '', 'onFocusout': onAsyncBlur }
            : undefined
        "
      >
        <slot
          :error="error"
          :field="field"
          :value="modelValue"
        >
          <div
            v-if="errorDisplay === 'tooltip' && field.name"
            class="flex gap-1 items-center"
          >
            <component
              :is="resolved"
              v-bind="mergedProps"
              :ref="(el) => field.name && formApi.registerComponentRef(field.name, el)"
              v-model="modelValue"
              :name="field.name"
              class="flex-1"
            >
              <template
                v-for="(slotFn, slotName) in field.slots"
                :key="slotName"
                #[slotName]="slotProps"
              >
                <component :is="() => slotFn(slotProps)" />
              </template>
            </component>

            <PTooltip
              v-if="error"
              :text="typeof error === 'string' ? error : ''"
            >
              <span
                aria-hidden="true"
                class="text-error"
              >!</span>
            </PTooltip>
          </div>

          <component
            :is="resolved"
            v-else-if="field.name"
            v-bind="mergedProps"
            :ref="(el) => field.name && formApi.registerComponentRef(field.name, el)"
            v-model="modelValue"
            class="w-full"
            :name="field.name"
          >
            <template
              v-for="(slotFn, slotName) in field.slots"
              :key="slotName"
              #[slotName]="slotProps"
            >
              <component :is="() => slotFn(slotProps)" />
            </template>
          </component>

          <component
            :is="resolved"
            v-else
            v-bind="mergedProps"
            class="w-full"
          >
            <template
              v-for="(slotFn, slotName) in field.slots"
              :key="slotName"
              #[slotName]="slotProps"
            >
              <component :is="() => slotFn(slotProps)" />
            </template>
          </component>
        </slot>
      </component>
    </template>
    <template
      v-if="errorDisplay === 'tooltip'"
      #error
    >
      <span class="sr-only" />
    </template>
  </PFormField>
</template>
