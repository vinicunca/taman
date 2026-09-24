import type { LocationQuery, LocationQueryValue } from 'vue-router';

export const PAGE_SIZES = [10, 20, 50] as const;
const DEFAULT_PAGE_SIZE = PAGE_SIZES[0];

export interface TodoListParams {
  page: number;
  pageSize: number;
  search?: string;
  completed?: boolean;
}

function first(value: LocationQueryValue | Array<LocationQueryValue> | undefined): string | undefined {
  const single = Array.isArray(value) ? value[0] : value;
  return single ?? undefined;
}

/**
 * URL → params. Anything a user could type into the address bar degrades to
 * a default instead of reaching the server as a BAD_REQUEST.
 */
export function parseTodoListQuery(query: LocationQuery): TodoListParams {
  const page = Math.trunc(Number(first(query.page)));
  const pageSize = Number(first(query.pageSize));
  const search = first(query.search)?.trim();
  const completed = first(query.completed);

  return {
    page: Number.isFinite(page) && page >= 1 ? page : 1,
    pageSize: (PAGE_SIZES as ReadonlyArray<number>).includes(pageSize) ? pageSize : DEFAULT_PAGE_SIZE,
    search: search || undefined,
    completed: completed === 'true' ? true : completed === 'false' ? false : undefined,
  };
}

/** Params → URL, omitting defaults. */
export function toTodoListQuery(params: TodoListParams): Record<string, string> {
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
  if (params.completed !== undefined) {
    query.completed = String(params.completed);
  }

  return query;
}

/** After deletes the current page can fall past the end; snap back to the last one. */
export function clampPage(page: number, totalPages: number): number {
  if (totalPages === 0) {
    return 1;
  }
  return Math.min(page, totalPages);
}
