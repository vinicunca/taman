import type { QueryClient } from '@tanstack/vue-query';
import type { TodoEvent, TodoPage } from '@vinicunca/taman-request/orpc';
import type { TamanQueryUtils } from '@vinicunca/taman-request/orpc-query';

/**
 * Folds one realtime event into the vue-query cache.
 *
 * - updated → patch the row in place in every cached list page (no refetch,
 *   no flicker) and refresh its detail entry.
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
    return;
  }

  if (event.type === 'removed') {
    queryClient.removeQueries({ queryKey: utils.todo.get.queryKey({ input: { id: event.id } }) });
  }

  void queryClient.invalidateQueries({ queryKey: utils.todo.list.key() });
}
