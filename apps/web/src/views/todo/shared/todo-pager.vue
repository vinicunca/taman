<script setup lang="ts">
import { $t } from '#/locales';

defineProps<{
  page: number;
  totalPages: number;
  total: number;
}>();

const emit = defineEmits<{ 'update:page': [page: number] }>();
</script>

<template>
  <div class="text-sm flex gap-3 items-center justify-between">
    <span class="text-muted">{{ $t('todo.pager.total', { total }) }}</span>
    <div class="flex gap-2 items-center">
      <PButton
        size="sm"
        variant="outline"
        :disabled="page <= 1"
        @click="emit('update:page', page - 1)"
      >
        {{ $t('todo.action.previous') }}
      </PButton>
      <span>{{ $t('todo.pager.page', { page: totalPages === 0 ? 0 : page, totalPages }) }}</span>
      <PButton
        size="sm"
        variant="outline"
        :disabled="page >= totalPages"
        @click="emit('update:page', page + 1)"
      >
        {{ $t('todo.action.next') }}
      </PButton>
    </div>
  </div>
</template>
