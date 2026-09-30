<script setup lang="ts">
defineProps<{
  page: number;
  totalPages: number;
  total: number;
}>();

const emit = defineEmits<{ 'update:page': [page: number] }>();
</script>

<template>
  <div class="text-sm flex gap-3 items-center justify-between">
    <span class="text-muted">{{ total }} todos</span>
    <div class="flex gap-2 items-center">
      <PButton
        size="sm"
        variant="outline"
        :disabled="page <= 1"
        @click="emit('update:page', page - 1)"
      >
        Previous
      </PButton>
      <span>Page {{ totalPages === 0 ? 0 : page }} of {{ totalPages }}</span>
      <PButton
        size="sm"
        variant="outline"
        :disabled="page >= totalPages"
        @click="emit('update:page', page + 1)"
      >
        Next
      </PButton>
    </div>
  </div>
</template>
