<script setup lang="ts">
import type { TodoLogEntry } from './use-todo-live';
import { $t } from '#/locales';

defineProps<{
  entries: Array<TodoLogEntry>;
  status: 'closed' | 'connecting' | 'error' | 'open';
}>();

const STATUS_KEY = { closed: 'todo.stream.disconnected', connecting: 'todo.stream.connecting', error: 'todo.stream.disconnected', open: 'todo.stream.live' } as const;
const timeFormat = new Intl.DateTimeFormat(undefined, { timeStyle: 'medium' });

function describe(entry: TodoLogEntry): string {
  const { event } = entry;
  return event.type === 'removed'
    ? $t('todo.stream.removed', { id: event.id.slice(-6) })
    : $t(`todo.stream.${event.type}`, { title: event.todo.title });
}
</script>

<template>
  <div class="flex flex-col gap-2">
    <div
      class="text-sm flex gap-2 items-center"
      aria-live="polite"
    >
      <span
        class="rounded-full size-2"
        :class="{ 'bg-success': status === 'open', 'bg-warning': status === 'connecting', 'bg-error': status === 'error' || status === 'closed' }"
      />
      {{ $t(STATUS_KEY[status]) }}
    </div>
    <ol class="text-sm flex flex-col gap-1">
      <li
        v-for="entry in entries"
        :key="`${entry.at.getTime()}-${describe(entry)}`"
        class="flex gap-3"
      >
        <time class="text-muted tabular-nums">{{ timeFormat.format(entry.at) }}</time>
        <span>{{ describe(entry) }}</span>
      </li>
      <li
        v-if="entries.length === 0"
        class="text-muted"
      >
        {{ $t('todo.stream.waiting') }}
      </li>
    </ol>
  </div>
</template>
