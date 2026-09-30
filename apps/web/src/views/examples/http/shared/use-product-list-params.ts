import type { ProductListParams } from './product-list-params';
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { parseProductListQuery, toProductListQuery } from './product-list-params';

/**
 * List params live in the URL so a page is shareable and survives refresh.
 * Changing the search term or the page size resets to page 1.
 */
export function useProductListParams() {
  const route = useRoute();
  const router = useRouter();

  const params = computed(() => parseProductListQuery(route.query));

  function setParams(patch: Partial<ProductListParams>) {
    const resetsPage = 'search' in patch || 'pageSize' in patch;
    const next = { ...params.value, ...(resetsPage ? { page: 1 } : {}), ...patch };
    void router.replace({ query: toProductListQuery(next) });
  }

  return { params, setParams };
}
