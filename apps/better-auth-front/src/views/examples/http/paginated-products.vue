<script setup lang="ts">
import { AppCard, AppPage } from '@taman/app-ui';
import { keepPreviousData, useQuery } from '@tanstack/vue-query';
import { computed, ref } from 'vue';
import { dummyjson } from '#/api/http';

interface ProductPage {
  products: Array<{ id: number; title: string; price: number }>;
  total: number;
  skip: number;
  limit: number;
}

const LIMIT = 10;
const page = ref(1);

const { data, error, isError, isPending, isPlaceholderData } = useQuery(computed(() =>
  dummyjson.get<ProductPage>('/products').queryOptions({
    query: { limit: LIMIT, skip: (page.value - 1) * LIMIT, select: 'id,title,price' },
    // Keep showing the previous page while the next one loads.
    placeholderData: keepPreviousData,
  }),
));

const totalPages = computed(() => Math.max(1, Math.ceil((data.value?.total ?? 0) / LIMIT)));

function prevPage() {
  page.value = Math.max(page.value - 1, 1);
}

function nextPage() {
  if (!isPlaceholderData.value && page.value < totalPages.value) {
    page.value += 1;
  }
}
</script>

<template>
  <AppPage
    title="HTTP client · vue-query pagination"
    description="`dummyjson.get<ProductPage>('/products').queryOptions({ query, placeholderData })` against the public dummyjson.com API."
  >
    <AppCard>
      <div class="flex flex-col gap-4">
        <div class="flex gap-3 items-center">
          <PButton
            size="sm"
            variant="outline"
            :disabled="page <= 1"
            @click="prevPage"
          >
            Previous
          </PButton>
          <span>Page {{ page }} of {{ totalPages }}</span>
          <PButton
            size="sm"
            variant="outline"
            :disabled="isPlaceholderData || page >= totalPages"
            @click="nextPage"
          >
            Next
          </PButton>
        </div>
        <p v-if="isPending">
          Loading…
        </p>
        <p
          v-else-if="isError"
          class="text-error"
        >
          {{ error?.message }}
        </p>
        <ul
          v-else-if="data"
          class="text-sm flex flex-col gap-1"
        >
          <li
            v-for="product in data.products"
            :key="product.id"
          >
            {{ product.title }} — {{ product.price }}
          </li>
        </ul>
      </div>
    </AppCard>
  </AppPage>
</template>
