<script setup lang="ts">
import { watchDebounced } from '@vueuse/core';
import { ref, watch } from 'vue';

const props = defineProps<{
  search?: string;
  completed?: boolean;
}>();

const emit = defineEmits<{
  'update:search': [value: string | undefined];
  'update:completed': [value: boolean | undefined];
}>();

const draft = ref(props.search ?? '');
watch(() => props.search, (value) => {
  draft.value = value ?? '';
});
watchDebounced(draft, (value) => {
  const next = value.trim() || undefined;
  // Syncing `draft` from the URL must not re-emit and reset the page.
  if (next !== props.search) {
    emit('update:search', next);
  }
}, { debounce: 300 });

const STATUS_OPTIONS: Array<{ label: string; value: boolean | undefined }> = [
  { label: 'All', value: undefined },
  { label: 'Open', value: false },
  { label: 'Done', value: true },
];
</script>

<template>
  <div class="flex flex-wrap gap-3 items-center">
    <PInput
      v-model="draft"
      class="w-64"
      placeholder="Search titles…"
      aria-label="Search todos"
    />
    <div
      class="flex gap-1"
      role="group"
      aria-label="Filter by status"
    >
      <PButton
        v-for="option in STATUS_OPTIONS"
        :key="option.label"
        size="sm"
        :variant="completed === option.value ? 'solid' : 'outline'"
        :aria-pressed="completed === option.value"
        @click="emit('update:completed', option.value)"
      >
        {{ option.label }}
      </PButton>
    </div>
  </div>
</template>
