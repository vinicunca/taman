<script setup lang="ts">
import { AppCard, AppPage } from '@taman/app-ui';
import { watch } from 'vue';
import TodoFilters from '../shared/todo-filters.vue';
import { clampPage, PAGE_SIZES } from '../shared/todo-list-params';
import TodoPager from '../shared/todo-pager.vue';
import TodoTable from '../shared/todo-table.vue';
import { useTodoListParams } from '../shared/use-todo-list-params';
import { useTodosPlain } from './use-todos-plain';

const { params, setParams } = useTodoListParams();
const { data, isLoading } = useTodosPlain(params);

watch(data, (page) => {
  if (page && page.page !== clampPage(page.page, page.totalPages)) {
    setParams({ page: clampPage(page.page, page.totalPages) });
  }
});
</script>

<template>
  <AppPage
    title="oRPC · plain request · pagination"
    description="Offset pagination with `client.todo.list({ page, pageSize, search, completed })`. Params live in the URL."
  >
    <AppCard>
      <div class="flex flex-col gap-4">
        <div class="flex flex-wrap gap-3 items-center justify-between">
          <TodoFilters
            :search="params.search"
            :completed="params.completed"
            @update:search="setParams({ search: $event })"
            @update:completed="setParams({ completed: $event })"
          />
          <PSelect
            :model-value="params.pageSize"
            :items="PAGE_SIZES.map((size) => ({ label: `${size} / page`, value: size }))"
            aria-label="Page size"
            @update:model-value="setParams({ pageSize: Number($event) })"
          />
        </div>
        <TodoTable
          :todos="data?.items ?? []"
          :loading="isLoading"
          :actions="false"
        />
        <TodoPager
          :page="params.page"
          :total-pages="data?.totalPages ?? 0"
          :total="data?.total ?? 0"
          @update:page="setParams({ page: $event })"
        />
      </div>
    </AppCard>
  </AppPage>
</template>
