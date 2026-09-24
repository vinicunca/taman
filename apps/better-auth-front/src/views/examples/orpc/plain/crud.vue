<script setup lang="ts">
import type { Todo } from '@vinicunca/taman-request/orpc';
import { AppCard, AppPage, tamanConfirm } from '@taman/app-ui';
import { ref } from 'vue';
import TodoForm from '../shared/todo-form.vue';
import TodoTable from '../shared/todo-table.vue';
import { useTodosPlain } from './use-todos-plain';

const { data, isLoading, create, update, remove } = useTodosPlain({ page: 1, pageSize: 10 });

const editing = ref<Todo>();
const submitting = ref(false);
const createForm = ref<InstanceType<typeof TodoForm>>();

async function onCreate(values: { title: string; completed: boolean }) {
  submitting.value = true;
  if (await create(values)) {
    await createForm.value?.reset();
  }
  submitting.value = false;
}

async function onUpdate(values: { title: string; completed: boolean }) {
  if (!editing.value) {
    return;
  }
  submitting.value = true;
  if (await update({ id: editing.value.id, ...values })) {
    editing.value = undefined;
  }
  submitting.value = false;
}

async function onRemove(todo: Todo) {
  try {
    await tamanConfirm({ title: 'Delete todo', content: `Delete "${todo.title}"?` });
  } catch {
    return;
  }
  await remove(todo);
}
</script>

<template>
  <AppPage
    title="oRPC · plain request · CRUD"
    description="Create, read, update and delete through `client.todo.*`. Each mutation reloads the list."
  >
    <div class="gap-4 grid lg:grid-cols-[22rem_1fr]">
      <AppCard :title="editing ? 'Edit todo' : 'New todo'">
        <TodoForm
          v-if="editing"
          :key="editing.id"
          :initial="{ title: editing.title, completed: editing.completed }"
          :submitting="submitting"
          submit-label="Update"
          @submit="onUpdate"
          @cancel="editing = undefined"
        />
        <TodoForm
          v-else
          ref="createForm"
          :submitting="submitting"
          submit-label="Create"
          @submit="onCreate"
        />
      </AppCard>
      <AppCard title="Latest 10">
        <TodoTable
          :todos="data?.items ?? []"
          :loading="isLoading"
          @edit="editing = $event"
          @toggle="update({ id: $event.id, completed: !$event.completed })"
          @remove="onRemove"
        />
      </AppCard>
    </div>
  </AppPage>
</template>
