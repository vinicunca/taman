<script setup lang="ts">
import { AppCard, AppPage } from '@taman/app-ui';
import TodoEventLog from '../shared/todo-event-log.vue';
import TodoTable from '../shared/todo-table.vue';
import { useTodoLive } from '../shared/use-todo-live';
import { useTodosPlain } from './use-todos-plain';

const { data, isLoading, reload } = useTodosPlain({ page: 1, pageSize: 10 });
// Plain style: every event just triggers a reload of the list.
const { entries, status } = useTodoLive(() => {
  void reload();
});
</script>

<template>
  <AppPage
    title="oRPC · plain request · realtime"
    description="`for await (const event of await client.todo.live())` — open another tab and change a todo."
  >
    <div class="gap-4 grid lg:grid-cols-2">
      <AppCard title="Event stream">
        <TodoEventLog
          :entries="entries"
          :status="status"
        />
      </AppCard>
      <AppCard title="Latest 10">
        <TodoTable
          :todos="data?.items ?? []"
          :loading="isLoading"
          :actions="false"
        />
      </AppCard>
    </div>
  </AppPage>
</template>
