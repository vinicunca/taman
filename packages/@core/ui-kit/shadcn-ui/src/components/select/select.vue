<script lang="ts" setup>
import { CircleX } from '@taman-core/icons';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../ui';

interface Props {
  allowClear?: boolean;
  class?: any;
  options?: Array<{ label: string; value: string }>;
  placeholder?: string;
}

const props = withDefaults(defineProps<Props>(), {
  allowClear: false,
});

const modelValue = defineModel<string>();

function handleClear() {
  modelValue.value = undefined;
}
</script>

<template>
  <Select v-model="modelValue">
    <SelectTrigger
      :class="props.class"
      class="flex w-full items-center"
    >
      <SelectValue
        class="text-left flex-auto"
        :placeholder="placeholder"
      />
      <CircleX
        v-if="allowClear && modelValue"
        data-clear-button
        class="mr-1 opacity-50 size-4 cursor-pointer hover:opacity-100"
        @pointerdown.stop
        @click.stop.prevent="handleClear"
      />
    </SelectTrigger>
    <SelectContent>
      <template
        v-for="item in options"
        :key="item.value"
      >
        <SelectItem :value="item.value">
          {{ item.label }}
        </SelectItem>
      </template>
    </SelectContent>
  </Select>
</template>

<style scoped>
button[role='combobox'][data-placeholder] {
  color: hsl(var(--muted-foreground));
}

button {
  --ring: var(--primary);
}
</style>
