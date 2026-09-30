<script setup lang="ts">
import type { Product } from '../shared/product';
import { ref } from 'vue';
import { AppCard, AppPage, tamanConfirm } from '@taman/app-ui';
import ProductForm from '../shared/product-form.vue';
import ProductTable from '../shared/product-table.vue';
import { useProductsQuery } from './use-products-query';

const { list, create, update, remove } = useProductsQuery({ page: 1, pageSize: 10 });

const editing = ref<Product>();
const createForm = ref<InstanceType<typeof ProductForm>>();

function onCreate(values: { title: string; price: number }) {
  create.mutate(values, { onSuccess: () => createForm.value?.reset() });
}

function onUpdate(values: { title: string; price: number }) {
  if (!editing.value) {
    return;
  }
  update.mutate({ id: editing.value.id, ...values }, {
    onSuccess: () => {
      editing.value = undefined;
    },
  });
}

async function onRemove(product: Product) {
  try {
    await tamanConfirm({ title: 'Delete product', content: `Delete "${product.title}"?` });
  } catch {
    return;
  }
  remove.mutate({ id: product.id });
}
</script>

<template>
  <AppPage
    title="HTTP client · Vue Query · CRUD"
    description="`useQuery(dummyjson.get('/products').queryOptions(...))` + `useMutation(dummyjson.post/put/delete(...).mutationOptions())`, patching the cached list on success."
  >
    <div class="gap-4 grid lg:grid-cols-[22rem_1fr]">
      <AppCard :title="editing ? 'Edit product' : 'New product'">
        <ProductForm
          v-if="editing"
          :key="editing.id"
          :initial="{ title: editing.title, price: editing.price }"
          :submitting="update.isPending.value"
          submit-label="Update"
          @submit="onUpdate"
          @cancel="editing = undefined"
        />
        <ProductForm
          v-else
          ref="createForm"
          :submitting="create.isPending.value"
          submit-label="Create"
          @submit="onCreate"
        />
      </AppCard>
      <AppCard title="Latest 10">
        <p class="text-muted text-sm mb-3">
          dummyjson simulates writes: create/update/delete respond as if they worked, but nothing is
          persisted server-side. Changes below patch the cache and vanish on refetch.
        </p>
        <ProductTable
          :products="list.data.value?.products ?? []"
          :loading="list.isFetching.value"
          @edit="editing = $event"
          @remove="onRemove"
        />
      </AppCard>
    </div>
  </AppPage>
</template>
