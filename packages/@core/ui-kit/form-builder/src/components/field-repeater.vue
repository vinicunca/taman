<script lang="ts" setup>
import { computed, ref, watch } from 'vue';

import type { FormApi } from '../form-api';
import type { FieldConfig } from '../types';

import { getPath, setPath } from '../paths';
import FieldRenderer from './field-renderer.vue';

const props = defineProps<{
  errorDisplay?: 'inline' | 'tooltip';
  field: FieldConfig;
  formApi: FormApi;
  labelPlacement?: 'horizontal' | 'vertical';
}>();

let uidCounter = 0;
const uids = ref<number[]>([]);

const items = computed<any[]>(() => {
  const value = props.field.name
    ? getPath(props.formApi.values, props.field.name)
    : undefined;
  return Array.isArray(value) ? value : [];
});

// Rows are keyed by a stable uid (never the array index) so Vue keeps DOM
// identity — and thus per-row input state/focus — attached to the same item
// across add/remove/move mutations. New items grow the uid list; shrinking
// truncates from the end (actual removal already spliced the right slot).
watch(
  () => items.value.length,
  (length) => {
    while (uids.value.length < length) {
      uids.value.push(++uidCounter);
    }
    uids.value.length = length;
  },
  { immediate: true },
);

function ensureArray(): any[] {
  if (!props.field.name) {
    return [];
  }
  let value = getPath(props.formApi.values, props.field.name);
  if (!Array.isArray(value)) {
    value = [];
    setPath(props.formApi.values, props.field.name, value);
  }
  return value;
}

async function revalidate() {
  if (props.field.name) {
    await props.formApi.validate([props.field.name]);
  }
}

async function add() {
  const max = props.field.repeat?.max;
  const array = ensureArray();
  if (max !== undefined && array.length >= max) {
    return;
  }
  array.push({});
  await revalidate();
}

async function remove(index: number) {
  const min = props.field.repeat?.min;
  const array = ensureArray();
  if (min !== undefined && array.length <= min) {
    return;
  }
  array.splice(index, 1);
  uids.value.splice(index, 1);
  await revalidate();
}

async function move(index: number, delta: number) {
  const array = ensureArray();
  const target = index + delta;
  if (target < 0 || target >= array.length) {
    return;
  }
  [array[index], array[target]] = [array[target], array[index]];
  [uids.value[index], uids.value[target]] = [uids.value[target], uids.value[index]];
  await revalidate();
}

function indexedField(sub: FieldConfig, index: number): FieldConfig {
  return {
    ...sub,
    name: sub.name ? `${props.field.name}.${index}.${sub.name}` : undefined,
  } as FieldConfig;
}
</script>

<template>
  <div class="flex flex-col gap-3">
    <div
      v-for="(uid, index) in uids"
      :key="uid"
      data-repeater-row
      class="flex items-start gap-2"
    >
      <div class="grid flex-1 gap-3">
        <FieldRenderer
          v-for="(sub, subIndex) in field.repeat!.fields"
          :key="sub.name ?? subIndex"
          :error-display="errorDisplay"
          :field="indexedField(sub, index)"
          :form-api="formApi"
          :label-placement="labelPlacement"
        />
      </div>
      <div class="flex items-center gap-1 pt-6">
        <PButton
          v-if="field.repeat!.sortable"
          data-repeater-up
          size="xs"
          type="button"
          variant="ghost"
          :disabled="index === 0"
          @click="move(index, -1)"
        >
          ↑
        </PButton>
        <PButton
          v-if="field.repeat!.sortable"
          data-repeater-down
          size="xs"
          type="button"
          variant="ghost"
          :disabled="index === uids.length - 1"
          @click="move(index, 1)"
        >
          ↓
        </PButton>
        <PButton
          data-repeater-remove
          size="xs"
          type="button"
          variant="ghost"
          :disabled="field.repeat!.min !== undefined && uids.length <= field.repeat!.min"
          @click="remove(index)"
        >
          ✕
        </PButton>
      </div>
    </div>
    <PButton
      size="sm"
      type="button"
      variant="outline"
      :disabled="field.repeat!.max !== undefined && uids.length >= field.repeat!.max"
      @click="add"
    >
      {{ field.repeat!.addLabel ?? 'Add' }}
    </PButton>
  </div>
</template>
