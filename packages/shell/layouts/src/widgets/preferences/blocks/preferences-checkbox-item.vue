<script setup lang="ts">
import type { TamanToggleGroupItem, TamanToggleGroupValue } from '@vinicunca/taman-ui';

import { TamanIcon, TamanToggleGroup } from '@vinicunca/taman-ui';
import PTooltip from 'pohon-ui/components/Tooltip.vue';

defineOptions({
  name: 'PreferenceCheckboxItem',
});

const props = withDefaults(
  defineProps<{
    disabled?: boolean;
    items?: Array<TamanToggleGroupItem>;
    multiple?: boolean;
    tip?: string;
    onItemClick?: (value: TamanToggleGroupValue | undefined) => void;
    placeholder?: string;
  }>(),
  {
    disabled: false,
    items: () => [],
    onItemClick: () => {},
    multiple: false,
  },
);

const inputValue = defineModel<Array<string>>();
</script>

<template>
  <div
    :class="{
      'hover:bg-background-elevated': !props.tip,
      'pointer-events-none opacity-50': props.disabled,
    }"
    class="p-2 rounded-lg flex w-full items-center justify-between"
  >
    <span class="text-sm font-500 inline-flex gap-2 items-center">
      <slot />

      <PTooltip
        v-if="props.tip"
        :text="props.tip"
        :ui="{
          content: 'pohon:h-auto',
          text: 'pohon:whitespace-normal',
        }"
      >
        <TamanIcon
          icon="lucide:circle-help"
          class="color-text-muted"
        />
      </PTooltip>
    </span>

    <TamanToggleGroup
      v-model="inputValue"
      size="sm"
      :items="items"
      :disabled="disabled"
      :type="multiple ? 'multiple' : 'single'"
      @item-click="onItemClick"
    />
  </div>
</template>
