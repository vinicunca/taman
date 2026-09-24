<script lang="ts" setup>
import type { VNode } from 'vue';
import type { TamanDescriptionsItemType, TamanDescriptionsProps } from './taman-description.types';
import { computed, useSlots } from 'vue';
import TamanDescriptionRow from './taman-description-row.vue';
import { calcRows, normalizeItems, parseItemsFromSlot, resolveColumn, useScreens } from './use-taman-description';

defineOptions({ name: 'TamanDescription' });

const props = withDefaults(
  defineProps<TamanDescriptionsProps>(),
  {
    bordered: false,
    colon: true,
    layout: 'horizontal',
    size: 'middle',
  },
);

const slots = useSlots();
const screens = useScreens();

// Use items first; otherwise parse from default slot
const resolvedItems = computed<Array<TamanDescriptionsItemType>>(() => {
  if (props.items && props.items.length > 0) {
    return props.items;
  }
  const nodes = (slots.default?.() ?? []) as Array<VNode>;
  return parseItemsFromSlot(nodes);
});

const mergedColumn = computed(() => resolveColumn(props.column, screens.value));
const mergedItems = computed(() =>
  normalizeItems(resolvedItems.value, screens.value),
);
const rows = computed(() => calcRows(mergedItems.value, mergedColumn.value));

const hasHeader = computed(
  () => !!props.title || !!props.extra || !!slots.title || !!slots.extra,
);

const tableClass = computed(() =>
  [
    'w-full table-auto border-collapse text-sm',
    // Non-bordered mode: Remove bottom padding of the last row
    !props.bordered && '[&>tbody>tr:last-child>td]:pb-0',
  ],
);
</script>

<template>
  <div
    class="w-full"
    :class="[props.class]"
  >
    <div
      v-if="hasHeader"
      class="mb-5 flex gap-4 items-center justify-between"
    >
      <div class="text-base color-text font-600">
        <slot name="title">
          {{ title }}
        </slot>
      </div>

      <div class="color-text">
        <slot name="extra">
          {{ extra }}
        </slot>
      </div>
    </div>

    <table :class="tableClass">
      <tbody>
        <TamanDescriptionRow
          v-for="(row, index) in rows"
          :key="index"
          :row="row"
          :vertical="layout === 'vertical'"
          :bordered="bordered"
          :colon="colon"
          :size="size"
          :label-style="labelStyle"
          :content-style="contentStyle"
        />
      </tbody>
    </table>
  </div>
</template>
