<script setup lang="ts">
import type { Product } from './product';

withDefaults(defineProps<{
  products: Array<Product>;
  loading?: boolean;
  actions?: boolean;
}>(), {
  loading: false,
  actions: true,
});

const emit = defineEmits<{
  edit: [product: Product];
  remove: [product: Product];
}>();

const priceFormat = new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' });
</script>

<template>
  <div
    class="overflow-x-auto"
    :class="{ 'opacity-60': loading }"
    :aria-busy="loading"
  >
    <table class="text-sm w-full">
      <thead>
        <tr class="border-default text-left border-b">
          <th class="font-medium px-2 py-2">
            Title
          </th>
          <th class="font-medium px-2 py-2">
            Price
          </th>
          <th
            v-if="actions"
            class="px-2 py-2"
          />
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="product in products"
          :key="product.id"
          class="border-default border-b"
        >
          <td class="px-2 py-2">
            {{ product.title }}
          </td>
          <td class="px-2 py-2">
            {{ priceFormat.format(product.price) }}
          </td>
          <td
            v-if="actions"
            class="px-2 py-2 text-right whitespace-nowrap"
          >
            <PButton
              size="xs"
              variant="ghost"
              @click="emit('edit', product)"
            >
              Edit
            </PButton>
            <PButton
              size="xs"
              color="error"
              variant="ghost"
              @click="emit('remove', product)"
            >
              Delete
            </PButton>
          </td>
        </tr>
        <tr v-if="!loading && products.length === 0">
          <td
            class="text-muted px-2 py-6 text-center"
            :colspan="actions ? 3 : 2"
          >
            No products yet.
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
