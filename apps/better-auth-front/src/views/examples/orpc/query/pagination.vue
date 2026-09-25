<script setup lang="ts">
import { AppCard, AppPage } from '@taman/app-ui';
import { watch } from 'vue';
import TodoFilters from '../shared/todo-filters.vue';
import { clampPage, PAGE_SIZES } from '../shared/todo-list-params';
import TodoPager from '../shared/todo-pager.vue';
import TodoTable from '../shared/todo-table.vue';
import { useTodoListParams } from '../shared/use-todo-list-params';
import { useTodosQuery } from './use-todos-query';

const { params, setParams } = useTodoListParams();
const { list } = useTodosQuery(params);

watch(list.data, (page) => {
  if (page && !list.isPlaceholderData.value && page.page !== clampPage(page.page, page.totalPages)) {
    setParams({ page: clampPage(page.page, page.totalPages) });
  }
});
</script>

<template>
  <AppPage
    title="oRPC · Vue Query · pagination"
    description="Each page is its own cache entry keyed by input; `keepPreviousData` avoids flicker between pages."
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
  </AppPage>
</template>
