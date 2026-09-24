<script setup lang="ts">
import { $t } from '@taman/locales';
import { watch } from 'vue';

defineOptions({
  name: 'PreferenceFontSize',
});

const modelValue = defineModel<number>({
  default: 16,
});

const min = 15;
const max = 22;
const step = 1;

// Clamp input between min and max
watch(
  modelValue,
  (newValue) => {
    if (newValue < min) {
      modelValue.value = min;
    } else if (newValue > max) {
      modelValue.value = max;
    }
  },
  { immediate: true },
);
</script>

<template>
  <div class="flex flex-col gap-4 w-full">
    <div class="flex gap-2 items-center">
      <NumberField
        v-model="modelValue"
        :max="max"
        :min="min"
        :step="step"
        class="w-full"
      >
        <NumberFieldContent>
          <NumberFieldDecrement />
          <NumberFieldInput />
          <NumberFieldIncrement />
        </NumberFieldContent>
      </NumberField>
      <span class="text-muted-foreground text-xs whitespace-nowrap">px</span>
    </div>
    <div class="text-muted-foreground text-xs">
      {{ $t('preferences.theme.fontSizeTip') }}
    </div>
  </div>
</template>
