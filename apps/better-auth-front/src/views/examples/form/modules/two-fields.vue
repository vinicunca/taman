<script lang="ts" setup>
import { computed } from 'vue';

const modelValue = defineModel<
  [string | undefined, string | undefined]
>({
  default: () => [undefined, undefined],
});

const typeValue = computed({
  get: () => modelValue.value[0],
  set: (value) => {
    modelValue.value = [value, modelValue.value[1]];
  },
});

const phoneValue = computed({
  get: () => modelValue.value[1],
  set: (value) => {
    modelValue.value = [modelValue.value[0], value];
  },
});
</script>

<template>
  <div class="flex gap-1 w-full">
    <PSelect
      v-model="typeValue"
      class="w-20"
      placeholder="Type"
      :class="{ 'valid-success': !!typeValue }"
      :items="[
        { label: 'Personal', value: 'personal' },
        { label: 'Work', value: 'work' },
        { label: 'Private', value: 'private' },
      ]"
    />
    <PInput
      v-model="phoneValue"
      placeholder="Enter 11-digit phone number"
      class="flex-1"
      :class="{ 'valid-success': phoneValue?.match(/^1[3-9]\d{9}$/) }"
      :maxlength="11"
      type="tel"
    />
  </div>
</template>
