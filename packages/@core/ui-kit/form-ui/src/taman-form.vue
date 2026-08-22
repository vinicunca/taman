<script setup lang="ts">
import type { TamanFormProps } from './form.types';

import { useForwardPropsEmits } from '@taman-core/composables';
import { ref, watchEffect } from 'vue';

import FormActions from './components/form-actions.vue';
import { FormRenderForm } from './form-render';
import {
  COMPONENT_BIND_EVENT_MAP,
  COMPONENT_MAP,
  DEFAULT_FORM_COMMON_CONFIG,
} from './form.config';
import { provideFormProps, useFormInitial } from './form.use-form-context';

const props = withDefaults(
  defineProps<TamanFormProps>(),
  {
    actionWrapperClass: '',
    collapsed: false,
    collapsedRows: 1,
    commonConfig: () => ({}),
    handleReset: undefined,
    handleSubmit: undefined,
    layout: 'horizontal',
    resetButtonOptions: () => ({}),
    showCollapseButton: false,
    showDefaultActions: true,
    submitButtonOptions: () => ({}),
    wrapperClass: 'grid-cols-1',
  },
);

const forward = useForwardPropsEmits(props);

const currentCollapsed = ref(false);

const { delegatedSlots, form } = useFormInitial(props);

provideFormProps([props, form]);

function handleUpdateCollapsed(value: boolean) {
  currentCollapsed.value = value;
  // Trigger the callback for the expand/collapse state change.
  props.handleCollapsedChange?.(value);
}

watchEffect(() => {
  currentCollapsed.value = props.collapsed;
});
</script>

<template>
  <FormRenderForm
    v-bind="forward"
    :collapsed="currentCollapsed"
    :component-bind-event-map="COMPONENT_BIND_EVENT_MAP"
    :component-map="COMPONENT_MAP"
    :form="form"
    :global-common-config="DEFAULT_FORM_COMMON_CONFIG"
  >
    <template
      v-for="slotName in delegatedSlots"
      :key="slotName"
      #[slotName]="slotProps"
    >
      <slot
        :name="slotName"
        v-bind="slotProps"
      />
    </template>

    <template #default="slotProps">
      <slot v-bind="slotProps">
        <FormActions
          v-if="showDefaultActions"
          :model-value="currentCollapsed"
          @update:model-value="handleUpdateCollapsed"
        />
      </slot>
    </template>
  </FormRenderForm>
</template>
