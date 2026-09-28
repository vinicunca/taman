<script setup lang="ts">
import type { LogEntry } from './auth-demo';

const props = defineProps<{
  entries: Array<LogEntry>;
}>();

const KIND_LABEL: Record<LogEntry['kind'], string> = {
  request: 'Request',
  unauthorized: 'Unauthorized',
  refresh: 'Refresh',
  retry: 'Retry',
  success: 'Success',
  failure: 'Failure',
  info: 'Info',
};

const timeFormat = new Intl.DateTimeFormat(undefined, { timeStyle: 'medium' });

function describeLatest(entries: Array<LogEntry>): string {
  const latest = entries[0];
  return latest ? `${KIND_LABEL[latest.kind]}: ${latest.message}` : 'No activity yet.';
}
</script>

<template>
  <div class="flex flex-col gap-2">
    <div
      class="text-sm"
      aria-live="polite"
    >
      {{ describeLatest(props.entries) }}
    </div>
    <ol class="text-sm flex flex-col gap-1">
      <li
        v-for="(entry, index) in entries"
        :key="`${entry.at.getTime()}-${index}`"
        class="flex gap-3"
      >
        <time class="text-muted tabular-nums">{{ timeFormat.format(entry.at) }}</time>
        <span class="text-muted">{{ KIND_LABEL[entry.kind] }}</span>
        <span>{{ entry.message }}</span>
      </li>
      <li
        v-if="entries.length === 0"
        class="text-muted"
      >
        No activity yet.
      </li>
    </ol>
  </div>
</template>
