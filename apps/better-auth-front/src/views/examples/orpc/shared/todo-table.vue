<script setup lang="ts">
import type { Todo } from '@vinicunca/taman-request/orpc';

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
        <tr class="text-left border-b border-default">
          <th class="font-medium px-2 py-2">Title</th>
          <th class="font-medium px-2 py-2">Done</th>
          <th class="font-medium px-2 py-2">Created</th>
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
          class="border-b border-default"
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
              :aria-label="`Mark ${todo.title} as ${todo.completed ? 'not done' : 'done'}`"
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
              Edit
            </PButton>
            <PButton
              size="xs"
              color="error"
              variant="ghost"
              @click="emit('remove', todo)"
            >
              Delete
            </PButton>
          </td>
        </tr>
        <tr v-if="!loading && todos.length === 0">
          <td
            class="text-muted px-2 py-6 text-center"
            :colspan="actions ? 4 : 3"
          >
            No todos yet.
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
