import type { TodoListParams } from './todo-list-params';
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { parseTodoListQuery, toTodoListQuery } from './todo-list-params';

/**
 * List params live in the URL so a page is shareable and survives refresh.
 * Changing a filter or the page size resets to page 1.
 */
export function useTodoListParams() {
  const route = useRoute();
  const router = useRouter();

  const params = computed(() => parseTodoListQuery(route.query));

  function setParams(patch: Partial<TodoListParams>) {
    const resetsPage = 'search' in patch || 'completed' in patch || 'pageSize' in patch;
    const next = { ...params.value, ...(resetsPage ? { page: 1 } : {}), ...patch };
    void router.replace({ query: toTodoListQuery(next) });
  }

  return { params, setParams };
}
