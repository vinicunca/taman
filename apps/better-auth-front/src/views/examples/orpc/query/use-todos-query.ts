import type { MaybeRefOrGetter } from 'vue';
import type { TodoListParams } from '../shared/todo-list-params';
import { useTamanToast } from '@taman/app-ui';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/vue-query';
import { isDefinedError } from '@vinicunca/taman-request/orpc';
import { computed, toValue } from 'vue';
import { getErrors } from '#/api/errors';
import { orpc } from '#/api/orpc';

/**
 * The vue-query style: `queryOptions` / `mutationOptions` from the oRPC
 * utils, cache keys derived from the procedure path + input, and one
 * `invalidateQueries({ queryKey: orpc.todo.key() })` after writes.
 * Compare with `use-todos-plain.ts`.
 */
export function useTodosQuery(params: MaybeRefOrGetter<TodoListParams>) {
  const queryClient = useQueryClient();
  const { toaster } = useTamanToast();

  const list = useQuery(computed(() => orpc.todo.list.queryOptions({
    input: toValue(params),
    // Keep showing the previous page while the next one loads.
    placeholderData: keepPreviousData,
  })));

  // Kept generic (rather than an `(error: unknown) => void` callback) so each
  // mutation's real defined-error type survives into `isDefinedError`'s
  // narrowing — erasing it to `unknown` at this boundary makes
  // `isDefinedError` always narrow to `never`. See `use-todos-plain.ts`.
  function onMutationError<TError>(error: TError) {
    if (isDefinedError(error) && error.code === 'NOT_FOUND') {
      toaster.error('That todo no longer exists.');
      return;
    }
    toaster.error(getErrors(error));
  }

  const mutationCallbacks = {
    onSuccess: () => queryClient.invalidateQueries({ queryKey: orpc.todo.key() }),
    onError: onMutationError,
  };

  const create = useMutation(orpc.todo.create.mutationOptions(mutationCallbacks));
  const update = useMutation(orpc.todo.update.mutationOptions(mutationCallbacks));
  const remove = useMutation(orpc.todo.remove.mutationOptions(mutationCallbacks));

  return { list, create, update, remove };
}
