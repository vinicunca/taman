<script setup lang="ts">
import type { Todo } from '@vinicunca/taman-request/orpc';
import { AppCard, AppPage, tamanConfirm } from '@taman/app-ui';
import { ref } from 'vue';
import TodoForm from '../shared/todo-form.vue';
import TodoTable from '../shared/todo-table.vue';
import { useTodosQuery } from './use-todos-query';

const { list, create, update, remove } = useTodosQuery({ page: 1, pageSize: 10 });

const editing = ref<Todo>();
const createForm = ref<InstanceType<typeof TodoForm>>();

function onCreate(values: { title: string; completed: boolean }) {
  create.mutate(values, { onSuccess: () => createForm.value?.reset() });
}

function onUpdate(values: { title: string; completed: boolean }) {
  if (!editing.value) {
    return;
  }
  update.mutate({ id: editing.value.id, ...values }, {
    onSuccess: () => {
      editing.value = undefined;
    },
  });
}

async function onRemove(todo: Todo) {
  try {
    await tamanConfirm({ title: 'Delete todo', content: `Delete "${todo.title}"?` });
  } catch {
    return;
  }
  remove.mutate({ id: todo.id });
}
</script>

<template>
  <AppPage
    title="oRPC · Vue Query · CRUD"
    description="`useQuery(orpc.todo.list.queryOptions(...))` + `useMutation(orpc.todo.*.mutationOptions())`, invalidating `orpc.todo.key()`."
  >
    <div class="gap-4 grid lg:grid-cols-[22rem_1fr]">
      <AppCard :title="editing ? 'Edit todo' : 'New todo'">
        <TodoForm
          v-if="editing"
          :key="editing.id"
          :initial="{ title: editing.title, completed: editing.completed }"
          :submitting="update.isPending.value"
          submit-label="Update"
          @submit="onUpdate"
          @cancel="editing = undefined"
        />
        <TodoForm
          v-else
          ref="createForm"
          :submitting="create.isPending.value"
          submit-label="Create"
          @submit="onCreate"
        />
      </AppCard>
      <AppCard title="Latest 10">
        <TodoTable
          :todos="list.data.value?.items ?? []"
          :loading="list.isFetching.value"
          @edit="editing = $event"
          @toggle="update.mutate({ id: $event.id, completed: !$event.completed })"
          @remove="onRemove"
        />
      </AppCard>
    </div>
  </AppPage>
</template>
