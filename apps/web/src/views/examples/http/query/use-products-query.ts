import type { MaybeRefOrGetter } from 'vue';
import type { NewProduct, Product, ProductPage } from '../shared/product';
import type { ProductListParams } from '../shared/product-list-params';
import { useTamanToast } from '@taman/app-ui';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/vue-query';
import { computed, toValue } from 'vue';
import { getErrors } from '#/api/errors';
import { dummyjson } from '#/api/http';
import { applyCreatedProduct, applyDeletedProduct, applyUpdatedProduct } from '../shared/apply-product-event';

function listPath(search: string | undefined): string {
  return search ? '/products/search' : '/products';
}

/**
 * The vue-query style: `queryOptions` / `mutationOptions` from the http-query
 * utils, cache keys derived from method + path + query. Compare with
 * `use-products-plain.ts`.
 */
export function useProductsQuery(params: MaybeRefOrGetter<ProductListParams>) {
  const queryClient = useQueryClient();
  const { toaster } = useTamanToast();

  const list = useQuery(computed(() => {
    const { page, pageSize, search } = toValue(params);
    const query: Record<string, unknown> = { limit: pageSize, skip: (page - 1) * pageSize, select: 'id,title,price' };
    if (search) {
      query.q = search;
    }
    return dummyjson.get<ProductPage>(listPath(search)).queryOptions({
      query,
      // Keep showing the previous page while the next one loads.
      placeholderData: keepPreviousData,
    });
  }));

  function onMutationError(mutationError: unknown) {
    toaster.error(getErrors(mutationError));
  }

  // dummyjson's write endpoints are simulated: they answer with a
  // plausible-looking row but never persist it, so invalidating and
  // refetching would silently undo the change. Patch the cached list page
  // for the currently active path instead.
  function patchList(updater: (page: ProductPage) => ProductPage) {
    const path = listPath(toValue(params).search);
    queryClient.setQueriesData<ProductPage>(
      { queryKey: dummyjson.get(path).key() },
      (page) => page && updater(page),
    );
  }

  const create = useMutation(dummyjson.post<Product, NewProduct>('/products/add').mutationOptions({
    onSuccess: (created) => {
      patchList((page) => applyCreatedProduct(page, created));
    },
    onError: onMutationError,
  }));

  const update = useMutation(dummyjson.put<Product, Product>((vars) => `/products/${vars.id}`).mutationOptions({
    body: ({ id: _id, ...rest }) => rest,
    onSuccess: (updated) => {
      patchList((page) => applyUpdatedProduct(page, updated));
    },
    onError: onMutationError,
  }));

  const remove = useMutation(dummyjson.delete<Product, { id: number }>((vars) => `/products/${vars.id}`).mutationOptions({
    body: () => undefined,
    onSuccess: (_deleted, variables) => {
      patchList((page) => applyDeletedProduct(page, variables.id));
    },
    onError: onMutationError,
  }));

  return { list, create, update, remove };
}
