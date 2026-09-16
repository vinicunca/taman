<script lang="ts" setup>
import type { TamanInputCurrencyProps } from './taman-input-currency.types';

import { NumberFormatter, NumberParser } from '@internationalized/number';
import { useForwardProps } from '@taman-core/composables';
import { reactiveOmit } from '@vueuse/core';
import PInput from 'pohon-ui/components/Input.vue';
import { nextTick, ref } from 'vue';

defineOptions({
  inheritAttrs: false,
});

const props = defineProps<TamanInputCurrencyProps>();

const formatOptions: Intl.NumberFormatOptions = {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
};

const formatter = new NumberFormatter('en-US', formatOptions);
const parser = new NumberParser('en-US', formatOptions);

const inputProps = useForwardProps(
  reactiveOmit(props, 'formatOptions', 'modelValue'),
);

const modelValue = defineModel<number | null>('modelValue', { default: null });
const displayValue = ref('');

function handleInput(event: Event) {
  const input = event.target as HTMLInputElement;
  const parsed = parser.parse(input.value);

  if (Number.isNaN(parsed)) {
    displayValue.value = input.value;
    return;
  }

  modelValue.value = parsed;
  displayValue.value = formatter.format(parsed);

  nextTick(() => {
    input.setSelectionRange(displayValue.value.length, displayValue.value.length);
  });
}
</script>

<template>
  <PInput
    :model-value="displayValue"
    v-bind="inputProps"
    @input="handleInput"
  />
</template>
