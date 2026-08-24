<script lang="ts" setup>
import type { Recordable } from '@taman/types';

import { useQuery } from '@tanstack/vue-query';

import { useTamanForm } from '#/adapter/form';
import { getMenuList } from '#/api';

const queryKey = ['demo', 'api', 'options'];
const count = 4;

const { dataUpdatedAt, promise: fetchDataFn } = useQuery({
  // Prefetch data during component render
  experimental_prefetchInRender: true,
  // Function that fetches API data
  queryFn: getMenuList,
  queryKey,
  // Refetch on every mount; omit `always` if you do not need a refetch each time
  refetchOnMount: 'always',
  // Cache duration
  staleTime: 1000 * 60 * 5,
});

async function fetchOptions() {
  return await fetchDataFn.value;
}

const schema = [];

for (let i = 0; i < count; i++) {
  schema.push({
    component: 'ApiSelect',
    componentProps: {
      api: fetchOptions,
      class: 'w-full',
      filterOption: (input: string, option: Recordable<any>) => {
        return option.label.toLowerCase().includes(input.toLowerCase());
      },
      labelField: 'name',
      showSearch: true,
      valueField: 'id',
    },
    fieldName: `field${i}`,
    label: `Select ${i}`,
  });
}

const [Form] = useTamanForm({
  schema,
  showDefaultActions: false,
});
</script>
<template>
  <div>
    <div class="mb-2 flex gap-2">
      <div>以下{{ count }}个组件共用一个数据源。</div>
      <div>缓存更新时间：{{ new Date(dataUpdatedAt).toLocaleString() }}</div>
    </div>
    <Form />
  </div>
</template>
