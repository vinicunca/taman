<script setup lang="ts">
import type { Todo } from '@taman/api-contract';
import { $t } from '#/locales';
import { ref } from 'vue';
import { AppCard, AppPage, tamanConfirm } from '@taman/app-ui';
import TodoForm from './shared/todo-form.vue';
import TodoTable from './shared/todo-table.vue';
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
    await tamanConfirm({ title: $t('todo.remove.title'), content: $t('todo.remove.confirm', { title: todo.title }) });
  } catch {
    return;
  }
  remove.mutate({ id: todo.id });
}
</script>

<template>
  <AppPage
    :title="$t('todo.manage')"
    :description="$t('todo.page.manageDescription')"
  >
    <div class="gap-4 grid lg:grid-cols-[22rem_1fr]">
      <AppCard :title="editing ? $t('todo.card.edit') : $t('todo.card.new')">
        <TodoForm
          v-if="editing"
          :key="editing.id"
          :initial="{ title: editing.title, completed: editing.completed }"
          :submitting="update.isPending.value"
          :submit-label="$t('todo.action.update')"
          @submit="onUpdate"
          @cancel="editing = undefined"
        />
        <TodoForm
          v-else
          ref="createForm"
          :submitting="create.isPending.value"
          :submit-label="$t('todo.action.create')"
          @submit="onCreate"
        />
      </AppCard>
      <AppCard :title="$t('todo.card.latest')">
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
