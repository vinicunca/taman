<script lang="ts" setup>
import { computed } from 'vue';

const props = defineProps<{
  issues?: Array<{ message: string; path: Array<PropertyKey> }>;
}>();

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

// Refinements on the whole array carry an empty path, so fall back to matching
// on which half is actually missing.
const typeError = computed(() =>
  typeValue.value
    ? undefined
    : props.issues?.find((issue) => issue.path[0] === 0 || issue.path.length === 0)
      ?.message,
);

const phoneError = computed(() =>
  typeValue.value
    ? props.issues?.find(
      (issue) => issue.path[0] === 1 || issue.path.length === 0,
    )?.message
    : undefined,
);
</script>

<template>
  <div class="flex flex-col gap-1 w-full">
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

    <div class="text-xs color-error flex gap-1">
      <span class="w-20">{{ typeError }}</span>
      <span class="flex-1">{{ phoneError }}</span>
    </div>
  </div>
</template>
