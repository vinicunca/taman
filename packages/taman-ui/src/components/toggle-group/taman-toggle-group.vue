<script lang="ts" setup>
import type { ToggleGroupProps, ToggleGroupSlots } from 'pohon-ui';
import type {
  TamanToggleGroupItem,
  TamanToggleGroupModel,
  TamanToggleGroupProps,
  TamanToggleGroupValue,
} from './taman-toggle-group.types';
import { useForwardProps } from '@vinicunca/taman-core/composables';
import { reactiveOmit } from '@vueuse/core';
import PToggleGroup from 'pohon-ui/components/ToggleGroup.vue';
import { get } from 'pohon-ui/utils';
import { computed, ref } from 'vue';

import { toggleGroupSelection, toToggleGroupSelection } from './toggle-group-selection';

defineOptions({ name: 'TamanToggleGroup' });

const props = withDefaults(
  defineProps<TamanToggleGroupProps>(),
  {
    activeColor: 'primary',
    activeVariant: 'solid',
    allowClear: false,
    attached: true,
    color: 'neutral',
    items: () => [],
    // Vue casts absent boolean props to `false`; keep PToggleGroup's defaults.
    loop: true,
    maxCount: 0,
    rovingFocus: true,
    showIcon: true,
    type: 'single',
    valueKey: 'value',
    variant: 'outline',
  },
);

const emits = defineEmits<{
  itemClick: [value: TamanToggleGroupValue | undefined];
}>();

const slots = defineSlots<ToggleGroupSlots<TamanToggleGroupItem>>();

const modelValue = defineModel<TamanToggleGroupModel>();

const toggleGroupProps = useForwardProps(
  reactiveOmit(props, 'allowClear', 'beforeChange', 'items', 'maxCount', 'showIcon'),
);

const multiple = computed(() => props.type === 'multiple');

const selection = computed(
  () => toToggleGroupSelection({ value: modelValue.value, multiple: multiple.value }),
);
const loadingValues = ref<Array<TamanToggleGroupValue>>([]);

/**
 * The value handed to the toggle group, which never changes it on its own.
 * Akar decides once, at setup, whether the group is controlled, and treats
 * `undefined` as uncontrolled — so an empty single selection is `null`.
 * Otherwise a refused change (`beforeChange`, `allowClear`) would still
 * show the clicked item as pressed.
 *
 * The cast is for booleans: PToggleGroup types `modelValue` from akar, which
 * leaves them out, though its items accept them and akar handles them.
 */
const groupValue = computed(() => (multiple.value
  ? selection.value
  : selection.value[0] ?? null) as ToggleGroupProps['modelValue']);

/** The items, with the check icon and the `beforeChange` loading state. */
const groupItems = computed<Array<TamanToggleGroupItem>>(() => props.items.map((item, index) => {
  const value = getValue(item, index);

  return {
    ...item,
    disabled: item.disabled || isDisabled(value),
    loading: item.loading || isLoading(value),
    leadingIcon: item.leadingIcon ?? getCheckIcon(value),
  };
}));

/** Resolves an item's value the way PToggleGroup does. */
function getValue(item: TamanToggleGroupItem, index: number): TamanToggleGroupValue {
  return get(item, props.valueKey as string) ?? String(index);
}

function isChecked(value: TamanToggleGroupValue) {
  return selection.value.includes(value);
}

function isLoading(value: TamanToggleGroupValue) {
  return loadingValues.value.includes(value);
}

function isDisabled(value: TamanToggleGroupValue) {
  return isLoading(value)
    || (!multiple.value && loadingValues.value.length > 0);
}

function getCheckIcon(value: TamanToggleGroupValue) {
  if (!props.showIcon) {
    return undefined;
  }

  return isChecked(value)
    ? 'lucide:circle-check-big'
    : 'lucide:circle';
}

/**
 * Recovers the clicked item from the value the toggle group proposes:
 * in single mode `undefined` means the checked item was clicked again,
 * in multiple mode it is the one value added or removed.
 */
function getClickedValue(next: unknown): TamanToggleGroupValue | undefined {
  if (!multiple.value) {
    return next === undefined || next === null
      ? selection.value[0]
      : next as TamanToggleGroupValue;
  }

  const nextSelection = Array.isArray(next)
    ? next as Array<TamanToggleGroupValue>
    : [];

  return nextSelection.find((value) => !selection.value.includes(value))
    ?? selection.value.find((value) => !nextSelection.includes(value));
}

function onUpdate(next: unknown) {
  const value = getClickedValue(next);
  if (value !== undefined) {
    onItemClick(value);
  }
}

async function onItemClick(value: TamanToggleGroupValue) {
  if (props.beforeChange) {
    loadingValues.value.push(value);
    try {
      const canChange = await props.beforeChange(value, !isChecked(value));
      if (canChange === false) {
        return;
      }
    } finally {
      loadingValues.value.splice(loadingValues.value.indexOf(value), 1);
    }
  }

  const next = toggleGroupSelection({
    selection: selection.value,
    value,
    allowClear: props.allowClear,
    maxCount: props.maxCount,
    multiple: multiple.value,
  });
  modelValue.value = multiple.value
    ? next
    : next[0];

  emits('itemClick', !multiple.value && next.length === 0
    ? undefined
    : value);
}
</script>

<template>
  <PToggleGroup
    v-bind="toggleGroupProps"
    :items="groupItems"
    :model-value="groupValue"
    @update:model-value="onUpdate"
  >
    <template
      v-for="(_, slotName) in slots"
      #[slotName]="slotData"
    >
      <slot
        :name="slotName"
        v-bind="slotData"
      />
    </template>
  </PToggleGroup>
</template>
