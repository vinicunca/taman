<script setup lang="ts">
import type { ExtendedFormApi, TamanFormProps, TamanFormSlots } from './form.types';

import { useForwardPriorityValues } from '@taman-core/composables';
import { get, isEqual } from '@taman-core/shared/utils';
import { useDebounceFn } from '@vueuse/core';
import { nextTick, onMounted, readonly, watch } from 'vue';

import FormActions from './components/form-actions.vue';
import { FormRenderForm } from './form-render';
import {
  COMPONENT_BIND_EVENT_MAP,
  COMPONENT_MAP,
  DEFAULT_FORM_COMMON_CONFIG,
} from './form.config';
import {
  provideComponentRefMap,
  provideFormProps,
  useFormInitial,
} from './form.use-form-context';

// Because extends will cause hot update to freeze, so repeat it.
interface Props extends TamanFormProps {
  formApi?: ExtendedFormApi<any, any, any, any>;
}

const props = defineProps<Props>();
defineSlots<
  Record<string, ((props: Record<string, any>) => any) | undefined>
  & TamanFormSlots<any, any, any>
>();

const formApi = props.formApi;
if (!formApi) {
  throw new Error('Form api is required in <TamanUseForm />');
}

const state = formApi.useStore();

const forward = useForwardPriorityValues(props, state);

const componentRefMap = new Map<string, unknown>();

const { delegatedSlots, form } = useFormInitial(forward);
const values = form.useValues();

provideFormProps([forward, form]);
provideComponentRefMap(componentRefMap);

formApi.mount(form, componentRefMap);

function handleUpdateCollapsed(value: boolean) {
  props.formApi?.setState({ collapsed: value });
  // Trigger the callback for the expand/collapse state change.
  forward.value.handleCollapsedChange?.(value);
}

function handleKeyDownEnter(event: KeyboardEvent) {
  if (!state?.value.submitOnEnter || !forward.value.formApi?.isMounted) {
    return;
  }
  // If it is a textarea, do not prevent the default behavior, otherwise it will cause the line break to fail.
  // Skip the carriage return submission processing for textarea.
  if (event.target instanceof HTMLTextAreaElement) {
    return;
  }
  event.preventDefault();

  forward.value.formApi?.validateAndSubmit();
}

const handleValuesChangeDebounced = useDebounceFn(async () => {
  state?.value.submitOnChange && forward.value.formApi?.validateAndSubmit();
}, state?.value?.changeDebouncedTime ?? 300);

let valuesChangeReady = false;

onMounted(async () => {
  // Only start listening after mounting, form.values will have an initialization process.
  await nextTick();
  valuesChangeReady = true;
});

watch(values, (currentValues, previousValues) => {
  if (!valuesChangeReady) {
    return;
  }
  const handleValuesChange = forward.value.handleValuesChange;
  const submitOnChange = state?.value.submitOnChange;
  if (!handleValuesChange && !submitOnChange) {
    return;
  }
  const fields = state?.value.schema?.map((item) => item.fieldName) ?? [];
  if (handleValuesChange && fields.length > 0) {
    const changedFields = fields.filter((field) => {
      return !isEqual(
        get(currentValues, field),
        get(previousValues ?? {}, field),
      );
    });
    if (changedFields.length > 0) {
      handleValuesChange(readonly(currentValues), changedFields, () =>
        formApi.formatValues(currentValues));
    }
  }
  if (submitOnChange) {
    handleValuesChangeDebounced();
  }
});
</script>

<template>
  <FormRenderForm
    v-bind="forward"
    :collapsed="state?.collapsed"
    :component-bind-event-map="COMPONENT_BIND_EVENT_MAP"
    :component-map="COMPONENT_MAP"
    :form="form"
    :global-common-config="DEFAULT_FORM_COMMON_CONFIG"
    @keydown.enter="handleKeyDownEnter"
  >
    <template
      v-for="slotName in delegatedSlots"
      :key="slotName"
      #[slotName]="slotProps"
    >
      <slot
        :name="slotName"
        v-bind="slotProps"
        :form-api="formApi"
        :values="form.values"
      />
    </template>

    <template #default="slotProps">
      <slot
        v-if="$slots.default"
        v-bind="slotProps"
        :form-api="formApi"
        :values="form.values"
      />

      <FormActions
        v-else-if="forward.showDefaultActions"
        :model-value="state?.collapsed"
        @update:model-value="handleUpdateCollapsed"
      >
        <template #reset-before="resetSlotProps">
          <slot
            name="reset-before"
            v-bind="resetSlotProps"
            :form-api="formApi"
            :values="form.values"
          />
        </template>

        <template #submit-before="submitSlotProps">
          <slot
            name="submit-before"
            v-bind="submitSlotProps"
            :form-api="formApi"
            :values="form.values"
          />
        </template>

        <template #expand-before="expandBeforeSlotProps">
          <slot
            name="expand-before"
            v-bind="expandBeforeSlotProps"
            :form-api="formApi"
            :values="form.values"
          />
        </template>

        <template #expand-after="expandAfterSlotProps">
          <slot
            name="expand-after"
            v-bind="expandAfterSlotProps"
            :form-api="formApi"
            :values="form.values"
          />
        </template>
      </FormActions>
    </template>
  </FormRenderForm>
</template>
