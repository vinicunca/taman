<script setup lang="ts">
import type { TodoLogEntry } from './use-todo-live';

defineProps<{
  entries: Array<TodoLogEntry>;
  status: 'connecting' | 'open' | 'error';
}>();

const STATUS_LABEL = { connecting: 'Connecting…', open: 'Live', error: 'Disconnected' } as const;
const timeFormat = new Intl.DateTimeFormat(undefined, { timeStyle: 'medium' });

function describe(entry: TodoLogEntry): string {
  const { event } = entry;
  return event.type === 'removed' ? `removed ${event.id.slice(-6)}` : `${event.type} "${event.todo.title}"`;
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
        :class="{ 'bg-success': status === 'open', 'bg-warning': status === 'connecting', 'bg-error': status === 'error' }"
      />
      {{ STATUS_LABEL[status] }}
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
        Waiting for changes — edit a todo in another tab.
      </li>
    </ol>
  </div>
</template>
