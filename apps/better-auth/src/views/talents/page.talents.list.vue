<script lang="ts" setup>
import type { ColDef } from 'ag-grid-community';
import { AppCard, AppPage } from '@taman/app-ui';
import { useTamanDrawer } from '@taman/common-ui';
import { AgGridVue } from 'ag-grid-vue3';
import { ref } from 'vue';
import { TalentForm, useTalentsQuery } from '#/domains/talents';
import { $t } from '#/locales';

defineOptions({
  name: 'PageTalentsList',
});

const { data: talents } = useTalentsQuery();

const columnDefs = ref<Array<ColDef>>([
  {
    field: 'legalName',
    headerName: $t('talent.fields.legalName'),
    filter: true,
  },
  {
    field: 'stageName',
    headerName: $t('talent.fields.stageName'),
    filter: true,
  },
]);

const talentFormDrawer = useTamanDrawer({
  connectedComponent: TalentForm,
  destroyOnClose: true,
});

function handleCreate() {
  talentFormDrawer.setData({}).open();
}
</script>

<template>
  <AppPage
    auto-content-height
  >
    <AppCard
      class="h-full"
      content-class="h-full flex flex-col gap-4"
    >
      <div class="flex items-center justify-between">
        <p class="text-lg font-700">
          {{ $t('page.talents.list') }}
        </p>

        <PButton
          icon="lucide:plus"
          @click="handleCreate"
        >
          {{ $t('ui.actionTitle.create', [$t('talent.title')]) }}
        </PButton>
      </div>

      <div class="flex-1">
        <AgGridVue
          :row-data="talents ?? []"
          :column-defs="columnDefs"
          class="size-full"
        />
      </div>
    </AppCard>
  </AppPage>
</template>
