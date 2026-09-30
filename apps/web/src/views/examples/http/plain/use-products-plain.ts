import type { MaybeRefOrGetter } from 'vue';
import type { NewProduct, Product, ProductPage } from '../shared/product';
import type { ProductListParams } from '../shared/product-list-params';
import { getErrors } from '#/api/errors';
import { dummyjsonClient } from '#/api/http';
import { ref, shallowRef, toValue, watch } from 'vue';
import { useTamanToast } from '@taman/app-ui';
import { applyCreatedProduct, applyDeletedProduct, applyUpdatedProduct } from '../shared/apply-product-event';

/**
 * The plain-request style: call `dummyjsonClient` directly, hold results in
 * refs, and reload the list on params changes. Compare with
 * `use-products-query.ts`.
 */
export function useProductsPlain(params: MaybeRefOrGetter<ProductListParams>) {
  const { toaster } = useTamanToast();
  const data = shallowRef<ProductPage>();
  const error = shallowRef<unknown>();
  const isLoading = ref(false);
  let latestRequest = 0;

  async function reload() {
    const request = ++latestRequest;
    isLoading.value = true;

    const { page, pageSize, search } = toValue(params);
    const query = { limit: pageSize, skip: (page - 1) * pageSize, select: 'id,title,price' };

    try {
      const result = search
        ? await dummyjsonClient.get<ProductPage>('/products/search', { query: { ...query, q: search } })
        : await dummyjsonClient.get<ProductPage>('/products', { query });

      // A slower earlier response must not overwrite a newer one.
      if (request !== latestRequest) {
        return;
      }
      isLoading.value = false;
      error.value = undefined;
      data.value = result;
    } catch (fetchError) {
      if (request !== latestRequest) {
        return;
      }
      isLoading.value = false;
      error.value = fetchError;
      toaster.error(getErrors(fetchError));
    }
  }

  watch(() => toValue(params), reload, { immediate: true, deep: true });

  async function run(action: () => Promise<void>): Promise<boolean> {
    try {
      await action();
      return true;
    } catch (actionError) {
      toaster.error(getErrors(actionError));
      return false;
    }
  }

  // dummyjson's write endpoints are simulated: they answer with a
  // plausible-looking row but never persist it, so a reload after a mutation
  // would silently undo it. Apply each response to `data` locally instead —
  // it sticks around until the next real reload.
  return {
    data,
    error,
    isLoading,
    reload,
    create: (values: NewProduct) => run(async () => {
      const created = await dummyjsonClient.post<Product>('/products/add', values);
      if (data.value) {
        data.value = applyCreatedProduct(data.value, created);
      }
    }),
    update: (product: Product) => run(async () => {
      const { id, ...rest } = product;
      const updated = await dummyjsonClient.put<Product>(`/products/${id}`, rest);
      if (data.value) {
        data.value = applyUpdatedProduct(data.value, updated);
      }
    }),
    remove: (product: Product) => run(async () => {
      await dummyjsonClient.delete<Product>(`/products/${product.id}`);
      if (data.value) {
        data.value = applyDeletedProduct(data.value, product.id);
      }
    }),
  };
}
