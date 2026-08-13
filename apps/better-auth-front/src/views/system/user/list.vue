<script lang="ts" setup>
import type { ColDef } from 'ag-grid-community';
import { AppCard, AppPage } from '@taman/app-ui';
import { AgGridVue } from 'ag-grid-vue3';
import { ref } from 'vue';
import { useListUsersQuery } from '#/auth/use-auth.query';

const { data: dataUsers } = useListUsersQuery();

const columnDefs = ref<Array<ColDef>>([
  {
    field: 'name',
    headerName: 'Name',
    filter: true,
  },
]);
</script>

<template>
  <AppPage
    auto-content-height
  >
    <AppCard
      class="h-full"
      content-class="h-full"
    >
      <AgGridVue
        :row-data="dataUsers?.users ?? []"
        :column-defs="columnDefs"
        class="size-full"
      />
    </AppCard>
  </AppPage>
</template>
