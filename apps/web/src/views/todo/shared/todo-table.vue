<script setup lang="ts">
import type { Todo } from '@taman/api-contract';
import { $t } from '#/locales';

withDefaults(defineProps<{
  todos: Array<Todo>;
  loading?: boolean;
  actions?: boolean;
}>(), {
  loading: false,
  actions: true,
});

const emit = defineEmits<{
  edit: [todo: Todo];
  toggle: [todo: Todo];
  remove: [todo: Todo];
}>();

const dateFormat = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' });
</script>

<template>
  <div
    class="overflow-x-auto"
    :class="{ 'opacity-60': loading }"
    :aria-busy="loading"
  >
    <table class="text-sm w-full">
      <thead>
        <tr class="border-default text-left border-b">
          <th class="font-medium px-2 py-2">
            {{ $t('todo.table.title') }}
          </th>
          <th class="font-medium px-2 py-2">
            {{ $t('todo.table.done') }}
          </th>
          <th class="font-medium px-2 py-2">
            {{ $t('todo.table.created') }}
          </th>
          <th
            v-if="actions"
            class="px-2 py-2"
          />
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="todo in todos"
          :key="todo.id"
          class="border-default border-b"
        >
          <td
            class="px-2 py-2"
            :class="{ 'line-through text-muted': todo.completed }"
          >
            {{ todo.title }}
          </td>
          <td class="px-2 py-2">
            <PCheckbox
              :model-value="todo.completed"
              :disabled="!actions"
              :aria-label="$t(todo.completed ? 'todo.table.markOpen' : 'todo.table.markDone', { title: todo.title })"
              @update:model-value="emit('toggle', todo)"
            />
          </td>
          <td class="text-muted px-2 py-2 whitespace-nowrap">
            {{ dateFormat.format(todo.createdAt) }}
          </td>
          <td
            v-if="actions"
            class="px-2 py-2 text-right whitespace-nowrap"
          >
            <PButton
              size="xs"
              variant="ghost"
              @click="emit('edit', todo)"
            >
              {{ $t('todo.action.edit') }}
            </PButton>
            <PButton
              size="xs"
              color="error"
              variant="ghost"
              @click="emit('remove', todo)"
            >
              {{ $t('todo.action.delete') }}
            </PButton>
          </td>
        </tr>
        <tr v-if="!loading && todos.length === 0">
          <td
            class="text-muted px-2 py-6 text-center"
            :colspan="actions ? 4 : 3"
          >
            {{ $t('todo.table.empty') }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
