import type { QueryClient, QueryKey } from '@tanstack/vue-query';
import type { TamanInputs, TodoEvent, TodoPage } from '@vinicunca/taman-request/orpc';
import type { TamanQueryUtils } from '@vinicunca/taman-request/orpc-query';

type TodoListInput = TamanInputs['todo']['list'];

/** True when a `todo.list` query key is filtered by `search` or `completed` — the updated row may no longer match. */
function isFilteredListKey(queryKey: QueryKey): boolean {
  const input = (queryKey[1] as { input?: TodoListInput } | undefined)?.input;
  return Boolean(input?.search) || input?.completed !== undefined;
}

/**
 * Folds one realtime event into the vue-query cache.
 *
 * - updated → patch the row in place in every cached list page (no refetch,
 *   no flicker) and refresh its detail entry. A *filtered* list (search or
 *   completed) is invalidated instead, since the patched row may no longer
 *   belong in it.
 * - created / removed → page boundaries and totals shift, so invalidate lists.
 */
export function applyTodoEvent(queryClient: QueryClient, utils: TamanQueryUtils, event: TodoEvent): void {
  if (event.type === 'updated') {
    queryClient.setQueriesData<TodoPage>(
      { queryKey: utils.todo.list.key() },
      (page) => page && {
        ...page,
        items: page.items.map((item) => (item.id === event.todo.id ? event.todo : item)),
      },
    );
    queryClient.setQueryData(utils.todo.get.queryKey({ input: { id: event.todo.id } }), event.todo);

    void queryClient.invalidateQueries({
      predicate: (query) => isFilteredListKey(query.queryKey),
      queryKey: utils.todo.list.key(),
    });
    return;
  }

  if (event.type === 'removed') {
    queryClient.removeQueries({ queryKey: utils.todo.get.queryKey({ input: { id: event.id } }) });
  }

  void queryClient.invalidateQueries({ queryKey: utils.todo.list.key() });
}
