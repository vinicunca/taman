import type { LocationQuery, LocationQueryValue } from 'vue-router';

// Reused as-is from the oRPC todo example: after a delete, snap a
// past-the-end page back to the last one — the same behavior applies here.
export { clampPage } from '#/views/todo/shared/todo-list-params';

export const PAGE_SIZES = [10, 20, 50] as const;
const DEFAULT_PAGE_SIZE = PAGE_SIZES[0];
const SEARCH_MAX_LENGTH = 100;

export interface ProductListParams {
  page: number;
  pageSize: number;
  search?: string;
}

function first(value: LocationQueryValue | Array<LocationQueryValue> | undefined): string | undefined {
  const single = Array.isArray(value) ? value[0] : value;
  return single ?? undefined;
}

/**
 * URL → params. Anything a user could type into the address bar degrades to
 * a safe default instead of reaching dummyjson as a nonsensical query.
 */
export function parseProductListQuery(query: LocationQuery): ProductListParams {
  const page = Math.trunc(Number(first(query.page)));
  const pageSize = Number(first(query.pageSize));
  const search = first(query.search)?.trim();

  return {
    // Anything that isn't a safe integer (e.g. `1e20`, `Infinity`, `NaN`)
    // would still pass a naive `>= 1` check, so treat it the same as any
    // other unparsable page.
    page: Number.isSafeInteger(page) && page >= 1 ? page : 1,
    pageSize: (PAGE_SIZES as ReadonlyArray<number>).includes(pageSize) ? pageSize : DEFAULT_PAGE_SIZE,
    // Cap an over-long hand-edited search instead of sending it as-is.
    search: search ? search.slice(0, SEARCH_MAX_LENGTH) : undefined,
  };
}

/** Params → URL, omitting defaults. */
export function toProductListQuery(params: ProductListParams): Record<string, string> {
  const query: Record<string, string> = {};

  if (params.page !== 1) {
    query.page = String(params.page);
  }
  if (params.pageSize !== DEFAULT_PAGE_SIZE) {
    query.pageSize = String(params.pageSize);
  }
  if (params.search) {
    query.search = params.search;
  }

  return query;
}
