<script setup lang="ts">
import type { SelectOption } from '@taman/types';

defineOptions({
  name: 'PreferenceToggleItem',
});

withDefaults(defineProps<{ disabled?: boolean; items?: Array<SelectOption> }>(), {
  disabled: false,
  items: () => [],
});

const modelValue = defineModel<string>();
</script>

<template>
  <div
    :class="{
      'pointer-events-none opacity-50': disabled,
    }"
    class="p-2 rounded-md flex w-full items-center justify-between hover:bg-background-accented"
    disabled
  >
    <span class="text-sm">
      <slot />
    </span>
    <ToggleGroup
      v-model="modelValue"
      class="gap-2"
      size="sm"
      type="single"
      variant="outline"
    >
      <template
        v-for="item in items"
        :key="item.value"
      >
        <ToggleGroupItem
          :value="item.value"
          class="rounded-sm h-7 data-[state=on]:text-primary-foreground data-[state=on]:bg-primary"
        >
          {{ item.label }}
        </ToggleGroupItem>
      </template>
    </ToggleGroup>
  </div>
</template>
