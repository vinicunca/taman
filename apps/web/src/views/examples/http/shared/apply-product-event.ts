import type { Product, ProductPage } from './product';

/**
 * Folds a mutation's response into one cached `ProductPage`. Shared by
 * `use-products-plain.ts` (a single page held in a ref) and
 * `use-products-query.ts` (every cached page matched by
 * `queryClient.setQueriesData`) — dummyjson's write endpoints are simulated
 * and never persist, so both apply the response locally instead of
 * reloading/invalidating.
 */

/**
 * A real insert would shift every later page's rows by one; dummyjson can't
 * do that since it doesn't persist. Only the first page (`skip === 0`) gets
 * the new row prepended (and trimmed back to its own `limit`) — every other
 * cached page just gets its `total` bumped, so it doesn't show a row that
 * migrated in from nowhere.
 */
export function applyCreatedProduct(page: ProductPage, product: Product): ProductPage {
  if (page.skip !== 0) {
    return { ...page, total: page.total + 1 };
  }
  return {
    ...page,
    products: [product, ...page.products].slice(0, page.limit),
    total: page.total + 1,
  };
}

/** id-keyed: replaces the row wherever it appears, a no-op on every other page. */
export function applyUpdatedProduct(page: ProductPage, product: Product): ProductPage {
  return {
    ...page,
    products: page.products.map((item) => (item.id === product.id ? product : item)),
  };
}

/** Removes the row where present and decrements `total` on every page, since a real delete shifts all of them. */
export function applyDeletedProduct(page: ProductPage, id: number): ProductPage {
  return {
    ...page,
    products: page.products.filter((item) => item.id !== id),
    total: page.total - 1,
  };
}
