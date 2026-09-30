<script setup lang="ts">
import { AppCard, AppPage } from '@taman/app-ui';
import { useQueryClient } from '@tanstack/vue-query';
import { watch } from 'vue';
import { orpc } from '#/api/orpc';
import TodoEventLog from '../shared/todo-event-log.vue';
import { clampPage } from '../shared/todo-list-params';
import TodoPager from '../shared/todo-pager.vue';
import TodoTable from '../shared/todo-table.vue';
import { useTodoListParams } from '../shared/use-todo-list-params';
import { useTodoLive } from '../shared/use-todo-live';
import { applyTodoEvent } from './apply-todo-event';
import { useTodosQuery } from './use-todos-query';

const queryClient = useQueryClient();
const { params, setParams } = useTodoListParams();
const { list } = useTodosQuery(params);
// Query style: events are folded into the cache, so the table updates itself.
const { entries, status } = useTodoLive((event) => applyTodoEvent(queryClient, orpc, event));

watch(list.data, (page) => {
  if (page && !list.isPlaceholderData.value && page.page !== clampPage(page.page, page.totalPages)) {
    setParams({ page: clampPage(page.page, page.totalPages) });
  }
});
</script>

<template>
  <AppPage
    title="oRPC · Vue Query · realtime"
    description="Stream events patch the vue-query cache — keep this tab open and edit todos from the CRUD page in another tab."
  >
    <div class="gap-4 grid lg:grid-cols-[1fr_20rem]">
      <AppCard title="Todos">
        <div class="flex flex-col gap-4">
          <TodoTable
            :todos="list.data.value?.items ?? []"
            :loading="list.isFetching.value"
            :actions="false"
          />
          <TodoPager
            :page="params.page"
            :total-pages="list.data.value?.totalPages ?? 0"
            :total="list.data.value?.total ?? 0"
            @update:page="setParams({ page: $event })"
          />
        </div>
      </AppCard>
      <AppCard title="Event stream">
        <TodoEventLog
          :entries="entries"
          :status="status"
        />
      </AppCard>
    </div>
  </AppPage>
</template>
