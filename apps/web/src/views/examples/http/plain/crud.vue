<script setup lang="ts">
import type { Product } from '../shared/product';
import { ref } from 'vue';
import { AppCard, AppPage, tamanConfirm } from '@taman/app-ui';
import ProductForm from '../shared/product-form.vue';
import ProductTable from '../shared/product-table.vue';
import { useProductsPlain } from './use-products-plain';

const { data, isLoading, create, update, remove } = useProductsPlain({ page: 1, pageSize: 10 });

const editing = ref<Product>();
const submitting = ref(false);
const createForm = ref<InstanceType<typeof ProductForm>>();

async function onCreate(values: { title: string; price: number }) {
  submitting.value = true;
  if (await create(values)) {
    await createForm.value?.reset();
  }
  submitting.value = false;
}

async function onUpdate(values: { title: string; price: number }) {
  if (!editing.value) {
    return;
  }
  submitting.value = true;
  if (await update({ id: editing.value.id, ...values })) {
    editing.value = undefined;
  }
  submitting.value = false;
}

async function onRemove(product: Product) {
  try {
    await tamanConfirm({ title: 'Delete product', content: `Delete "${product.title}"?` });
  } catch {
    return;
  }
  await remove(product);
}
</script>

<template>
  <AppPage
    title="HTTP client · plain request · CRUD"
    description="Create, read, update and delete through `dummyjsonClient` (`/products`). Each mutation applies the returned row locally."
  >
    <div class="gap-4 grid lg:grid-cols-[22rem_1fr]">
      <AppCard :title="editing ? 'Edit product' : 'New product'">
        <ProductForm
          v-if="editing"
          :key="editing.id"
          :initial="{ title: editing.title, price: editing.price }"
          :submitting="submitting"
          submit-label="Update"
          @submit="onUpdate"
          @cancel="editing = undefined"
        />
        <ProductForm
          v-else
          ref="createForm"
          :submitting="submitting"
          submit-label="Create"
          @submit="onCreate"
        />
      </AppCard>
      <AppCard title="Latest 10">
        <p class="text-muted text-sm mb-3">
          dummyjson simulates writes: create/update/delete respond as if they worked, but nothing is
          persisted server-side. Changes below are applied locally and vanish on reload.
        </p>
        <ProductTable
          :products="data?.products ?? []"
          :loading="isLoading"
          @edit="editing = $event"
          @remove="onRemove"
        />
      </AppCard>
    </div>
  </AppPage>
</template>
