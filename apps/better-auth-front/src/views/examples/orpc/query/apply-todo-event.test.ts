import type { Todo, TodoPage } from '@vinicunca/taman-request/orpc';
import { QueryClient } from '@tanstack/vue-query';
import { createTamanClient } from '@vinicunca/taman-request/orpc';
import { createTamanQueryUtils } from '@vinicunca/taman-request/orpc-query';
import { describe, expect, it, vi } from 'vitest';
import { applyTodoEvent } from './apply-todo-event';

const utils = createTamanQueryUtils(createTamanClient({ baseUrl: 'http://api.test', fetch: vi.fn() }));
const now = new Date('2026-09-24T10:00:00.000Z');

function todo(id: string, title: string): Todo {
  return { id, title, completed: false, createdBy: null, createdAt: now, updatedAt: now };
}

function seed(queryClient: QueryClient, input: { page: number; pageSize: number }, items: Array<Todo>) {
  const key = utils.todo.list.queryKey({ input });
  const page: TodoPage = { items, page: input.page, pageSize: input.pageSize, total: 3, totalPages: 2 };
  queryClient.setQueryData(key, page);
  return key;
}

describe('applyTodoEvent', () => {
  it('patches an updated todo in every cached list page without refetching', () => {
    const queryClient = new QueryClient();
    const first = seed(queryClient, { page: 1, pageSize: 2 }, [todo('a', 'A'), todo('b', 'B')]);
    const second = seed(queryClient, { page: 2, pageSize: 2 }, [todo('c', 'C')]);
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries');

    applyTodoEvent(queryClient, utils, { type: 'updated', todo: { ...todo('b', 'B!'), completed: true } });

    expect(queryClient.getQueryData<TodoPage>(first)?.items[1]).toMatchObject({ title: 'B!', completed: true });
    expect(queryClient.getQueryData<TodoPage>(second)?.items[0]?.title).toBe('C');
    expect(invalidate).not.toHaveBeenCalled();
  });

  it('invalidates list queries when rows are created or removed', () => {
    const queryClient = new QueryClient();
    const key = seed(queryClient, { page: 1, pageSize: 2 }, [todo('a', 'A')]);

    applyTodoEvent(queryClient, utils, { type: 'created', todo: todo('z', 'Z') });
    expect(queryClient.getQueryState(key)?.isInvalidated).toBe(true);
  });

  it('drops the detail cache of a removed todo', () => {
    const queryClient = new QueryClient();
    const detailKey = utils.todo.get.queryKey({ input: { id: 'a' } });
    queryClient.setQueryData(detailKey, todo('a', 'A'));

    applyTodoEvent(queryClient, utils, { type: 'removed', id: 'a' });

    expect(queryClient.getQueryData(detailKey)).toBeUndefined();
  });
});
