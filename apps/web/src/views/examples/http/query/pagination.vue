<script setup lang="ts">
import { watchDebounced } from '@vueuse/core';
import { computed, ref, watch } from 'vue';
import { AppCard, AppPage } from '@taman/app-ui';
import { clampPage, PAGE_SIZES } from '../shared/product-list-params';
import ProductTable from '../shared/product-table.vue';
import { useProductListParams } from '../shared/use-product-list-params';
import { useProductsQuery } from './use-products-query';

const { params, setParams } = useProductListParams();
const { list } = useProductsQuery(params);

const totalPages = computed(() => (list.data.value ? Math.max(1, Math.ceil(list.data.value.total / list.data.value.limit)) : 0));

watch(list.data, (page) => {
  if (page && !list.isPlaceholderData.value && params.value.page !== clampPage(params.value.page, totalPages.value)) {
    setParams({ page: clampPage(params.value.page, totalPages.value) });
  }
});

const draft = ref(params.value.search ?? '');
watch(() => params.value.search, (value) => {
  draft.value = value ?? '';
});
watchDebounced(draft, (value) => {
  const next = value.trim() || undefined;
  // Syncing `draft` from the URL must not re-emit and reset the page.
  if (next !== params.value.search) {
    setParams({ search: next });
  }
}, { debounce: 300 });
</script>

<template>
  <AppPage
    title="HTTP client · Vue Query · pagination"
    description="Each page is its own cache entry keyed by query string; `keepPreviousData` avoids flicker between pages."
  >
    <AppCard>
      <div class="flex flex-col gap-4">
        <div class="flex flex-wrap gap-3 items-center justify-between">
          <PInput
            v-model="draft"
            class="w-64"
            placeholder="Search products…"
            aria-label="Search products"
          />
          <PSelect
            :model-value="params.pageSize"
            :items="PAGE_SIZES.map((size) => ({ label: `${size} / page`, value: size as number }))"
            aria-label="Page size"
            @update:model-value="setParams({ pageSize: Number($event) })"
          />
        </div>
        <ProductTable
          :products="list.data.value?.products ?? []"
          :loading="list.isFetching.value"
          :actions="false"
        />
        <div class="text-sm flex gap-3 items-center justify-between">
          <span class="text-muted">{{ list.data.value?.total ?? 0 }} products</span>
          <div class="flex gap-2 items-center">
            <PButton
              size="sm"
              variant="outline"
              :disabled="params.page <= 1"
              @click="setParams({ page: params.page - 1 })"
            >
              Previous
            </PButton>
            <span>Page {{ totalPages === 0 ? 0 : params.page }} of {{ totalPages }}</span>
            <PButton
              size="sm"
              variant="outline"
              :disabled="list.isPlaceholderData.value || params.page >= totalPages"
              @click="setParams({ page: params.page + 1 })"
            >
              Next
            </PButton>
          </div>
        </div>
      </div>
    </AppCard>
  </AppPage>
</template>
