<script lang="ts" setup>
import type { FormApi } from '../form-api';
import type { FieldConfig, PohonFormRef } from '../types';

import { breakpointsTailwind, useBreakpoints } from '@vueuse/core';
import { computed, onBeforeUnmount, onMounted, useTemplateRef, watch } from 'vue';

import { useExpandable } from '../expandable';
import { createSubmitOnChange } from '../presets/search';
import { composeZodSchema } from '../schema';
import FieldRenderer from './field-renderer.vue';
import FieldRepeater from './field-repeater.vue';
import FormActions from './form-actions.vue';

// `FormApi<any>`: the renderer is indifferent to the caller's values shape,
// and a narrowed `FormApi<T>` is not assignable to `FormApi<FormValues>`
// (handleSubmit/handleReset are function-typed properties, so they are checked
// contravariantly).
const props = defineProps<{ formApi: FormApi<any> & { useStore: (selector?: any) => any } }>();

const state = props.formApi.useStore((s: any) => s);

const fields = computed<Array<FieldConfig>>(() => state.value.fields ?? []);

const schema = computed(() =>
  composeZodSchema(fields.value, {
    dynamicRule: (name) => props.formApi.getFieldRuntime(name).dynamicRules,
    isExcluded: (name) => props.formApi.getFieldRuntime(name).if === false,
  }),
);

const breakpoints = useBreakpoints(breakpointsTailwind);

const activeCols = computed(() => {
  const cols = state.value.layout?.cols ?? {};
  if (breakpoints.greaterOrEqual('lg').value && cols.lg) {
    return cols.lg;
  }
  if (breakpoints.greaterOrEqual('md').value && cols.md) {
    return cols.md;
  }
  return cols.base ?? 1;
});

const gridStyle = computed(() => ({
  display: 'grid',
  gap: state.value.layout?.compact ? '0.5rem' : '1rem',
  gridTemplateColumns: `repeat(${activeCols.value}, minmax(0, 1fr))`,
}));

const isSearch = computed(() => state.value.preset === 'search');
const collapsed = computed(() => state.value.collapsed === true);

const { keepItemIndex, recalculate, wrapperRef } = useExpandable({
  collapsedRows: () => state.value.collapsedRows ?? 1,
  enabled: () => isSearch.value,
});

// Maps each fields-array index to its index among RENDERED fields, or -1
// when dependency-if excludes it from the DOM. Collapse geometry counts the
// grid's actual children, so the hidden set must be computed over visible
// fields only — an if-excluded field ahead must not shift the boundary.
const visibleIndexByField = computed(() => {
  const indices: Array<number> = [];
  let visible = 0;
  for (const field of fields.value) {
    const excluded
      = !field.repeat
        && !!field.name
        && props.formApi.getFieldRuntime(field.name).if === false;
    indices.push(excluded ? -1 : visible++);
  }
  return indices;
});

function isFieldCollapsedAway(index: number): boolean {
  if (!isSearch.value || !collapsed.value) {
    return false;
  }
  const visibleIndex = visibleIndexByField.value[index] ?? -1;
  return visibleIndex !== -1 && visibleIndex > keepItemIndex.value;
}

function collapsedStyle(index: number): { display: string } | undefined {
  return isFieldCollapsedAway(index) ? { display: 'none' } : undefined;
}

function toggleCollapsed() {
  props.formApi.setState({ collapsed: !collapsed.value });
}

// `preset` is fixed at creation (applySearchPreset runs in useTamanForm), so
// gating registration here means non-search forms never pay for a deep
// values watcher. `submitOnChange` stays checked in the callback because it
// CAN be toggled at runtime via setState.
if (props.formApi.state?.preset === 'search') {
  const notifyChange = createSubmitOnChange(props.formApi);
  watch(
    () => props.formApi.values,
    () => {
      if (state.value.submitOnChange) {
        notifyChange();
      }
    },
    { deep: true },
  );
  onBeforeUnmount(() => notifyChange.cancel());
}

const formRef = useTemplateRef<PohonFormRef>('formRef');

onMounted(() => {
  if (formRef.value) {
    props.formApi.mount(formRef.value);
  }
  void recalculate();
});

async function onSubmit() {
  await props.formApi.submitFromNativeEvent();
}
</script>

<template>
  <PForm
    ref="formRef"
    :state="formApi.values"
    :schema="schema"
    :disabled="state.disabled"
    :validate-on="state.validateOn"
    @submit="onSubmit"
  >
    <div
      ref="wrapperRef"
      :style="gridStyle"
    >
      <template
        v-for="(field, index) in fields"
        :key="field.name ?? `display-${index}`"
      >
        <FieldRepeater
          v-if="field.repeat"
          :error-display="state.errorDisplay"
          :field="field"
          :form-api="formApi"
          :label-placement="state.layout?.labelPlacement"
          :style="collapsedStyle(index)"
        />
        <FieldRenderer
          v-else
          :error-display="state.errorDisplay"
          :field="field"
          :form-api="formApi"
          :label-placement="state.layout?.labelPlacement"
          :style="collapsedStyle(index)"
        >
          <template
            v-if="field.name && $slots[field.name]"
            #default="slotProps"
          >
            <slot
              :name="field.name"
              v-bind="slotProps"
            />
          </template>
        </FieldRenderer>
      </template>
      <FormActions
        v-if="state.showDefaultActions"
        :collapsed="collapsed"
        :collapsible="isSearch"
        :form-api="formApi"
        :messages="state.messages"
        :show-reset-button="state.showResetButton"
        :style="isSearch && collapsed ? undefined : { gridColumn: '1 / -1' }"
        @toggle-collapsed="toggleCollapsed"
      />
    </div>
  </PForm>
</template>
