<script setup lang="ts">
import type { SelectOption } from '@taman/types';
import { useSlots } from 'vue';

defineOptions({
  name: 'PreferenceSelectItem',
});

withDefaults(
  defineProps<{
    disabled?: boolean;
    items?: Array<SelectOption>;
    placeholder?: string;
    tip?: string;
  }>(),
  {
    disabled: false,
    placeholder: '',
    tip: '',
    items: () => [],
  },
);

const inputValue = defineModel<number>();

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
        v-if="slots.tip || tip"
        side="bottom"
      >
        <template #trigger>
          <CircleHelp class="ml-1 size-3 cursor-help" />
        </template>
        <slot name="tip">
          <template v-if="tip">
            <p
              v-for="(line, index) in tip.split('\n')"
              :key="index"
            >
              {{ line }}
            </p>
          </template>
        </slot>
      </VbenTooltip>
    </span>

    <NumberField
      v-model="inputValue"
      v-bind="$attrs"
      class="w-41.25"
    >
      <NumberFieldContent>
        <NumberFieldDecrement />
        <NumberFieldInput />
        <NumberFieldIncrement />
      </NumberFieldContent>
    </NumberField>
  </div>
</template>
