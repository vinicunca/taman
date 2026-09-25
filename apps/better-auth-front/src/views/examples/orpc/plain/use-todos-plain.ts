import type { TamanInputs, Todo, TodoPage } from '@vinicunca/taman-request/orpc';
import type { MaybeRefOrGetter } from 'vue';
import type { TodoListParams } from '../shared/todo-list-params';
import { useTamanToast } from '@taman/app-ui';
import { isDefinedError, safe } from '@vinicunca/taman-request/orpc';
import { ref, shallowRef, toValue, watch } from 'vue';
import { getErrors } from '#/api/errors';
import { client } from '#/api/orpc';

/**
 * The plain-request style: call the typed client, hold results in refs, and
 * reload the list after each mutation. Compare with `use-todos-query.ts`.
 */
export function useTodosPlain(params: MaybeRefOrGetter<TodoListParams>) {
  const { toaster } = useTamanToast();
  const data = shallowRef<TodoPage>();
  const error = shallowRef<unknown>();
  const isLoading = ref(false);
  let latestRequest = 0;

  async function reload() {
    const request = ++latestRequest;
    isLoading.value = true;

    const [listError, page] = await safe(client.todo.list(toValue(params)));

    // A slower earlier response must not overwrite a newer one.
    if (request !== latestRequest) {
      return;
    }

    isLoading.value = false;
    error.value = listError ?? undefined;
    if (page) {
      data.value = page;
    }
    if (listError) {
      toaster.error(getErrors(listError));
    }
  }

  // Kept generic (rather than a `() => Promise<unknown>` thunk) so the real
  // procedure's defined-error type survives into `isDefinedError`'s narrowing —
  // erasing it to `unknown` at this boundary makes `isDefinedError` always
  // narrow to `never`.
  async function run<TError>(actionError: TError): Promise<boolean> {
    if (isDefinedError(actionError) && actionError.code === 'NOT_FOUND') {
      toaster.error('That todo no longer exists.');
    } else if (actionError) {
      toaster.error(getErrors(actionError));
    }

    await reload();
    return !actionError;
  }

  watch(() => toValue(params), reload, { immediate: true, deep: true });

  return {
    data,
    error,
    isLoading,
    reload,
    create: async (values: TamanInputs['todo']['create']) => {
      const [actionError] = await safe(client.todo.create(values));
      return run(actionError);
    },
    update: async (input: TamanInputs['todo']['update']) => {
      const [actionError] = await safe(client.todo.update(input));
      return run(actionError);
    },
    remove: async (todo: Todo) => {
      const [actionError] = await safe(client.todo.remove({ id: todo.id }));
      return run(actionError);
    },
  };
}
