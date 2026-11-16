<script setup lang="ts">
import type { TamanToggleGroupItem } from '@vinicunca/taman-ui';
import { TamanToggleGroup } from '@vinicunca/taman-ui';

defineOptions({
  name: 'PreferenceToggleItem',
});

const props = withDefaults(
  defineProps<{
    disabled?: boolean;
    items?: Array<TamanToggleGroupItem>;
  }>(),
  {
    disabled: false,
    items: () => [],
  },
);

const modelValue = defineModel<string>();
</script>

<template>
  <div
    :class="{
      'pointer-events-none opacity-50': props.disabled,
    }"
    class="px-2 py-1 rounded-lg flex w-full items-center justify-between hover:bg-background-elevated"
  >
    <span class="text-sm font-500">
      <slot />
    </span>

    <TamanToggleGroup
      v-model="modelValue"
      size="sm"
      :items="props.items"
      :disabled="props.disabled"
    />
  </div>
</template>
