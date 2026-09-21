<script setup lang="ts">
import type { SelectOption } from '@taman/types';

import { VbenCheckButtonGroup, VbenTooltip } from '@vben-core/shadcn-ui';
import { CircleHelp } from '@vben/icons';
import { useSlots } from 'vue';

defineOptions({
  name: 'PreferenceCheckboxItem',
});

withDefaults(
  defineProps<{
    disabled?: boolean;
    items?: Array<SelectOption>;
    multiple?: boolean;
    onBtnClick?: (value: string) => void;
    placeholder?: string;
  }>(),
  {
    disabled: false,
    placeholder: '',
    items: () => [],
    onBtnClick: () => {},
    multiple: false,
  },
);

const inputValue = defineModel<Array<string> | undefined>({ default: undefined });

const slots = useSlots();
</script>

<template>
  <div
    :class="{
      'hover:bg-background-accented': !slots.tip,
      'pointer-events-none opacity-50': disabled,
    }"
    class="my-1 px-2 py-1 rounded-md flex w-full items-center justify-between"
  >
    <span class="text-sm flex items-center">
      <slot />

      <VbenTooltip
        v-if="slots.tip"
        side="bottom"
      >
        <template #trigger>
          <CircleHelp class="ml-1 size-3 cursor-help" />
        </template>
        <slot name="tip" />
      </VbenTooltip>
    </span>
    <VbenCheckButtonGroup
      v-model="inputValue"
      class="h-8 w-41.25"
      :options="items"
      :disabled="disabled"
      :multiple="multiple"
      @btn-click="onBtnClick"
    />
  </div>
</template>
