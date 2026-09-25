// @vitest-environment node
import type { H3Event } from 'nitro';
import { call } from '@orpc/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { resolveContext } from '#lib/context.ts';
import { httpError } from '#lib/http.ts';
import { router } from './router.ts';

vi.mock('#lib/context.ts', () => ({ resolveContext: vi.fn() }));

const event = {} as H3Event;
const ID = '01920000-0000-7000-8000-000000000001';

/**
 * One case per procedure on the router, each with a valid input so a
 * rejection can only be the `authed` guard — never a validation error. A
 * future procedure that forgets `.use(authed)` will resolve instead of
 * rejecting here, which fails this suite.
 */
const cases: Array<{ invoke: () => Promise<unknown>; name: string }> = [
  { invoke: () => call(router.menu.all, undefined, { context: { event } }), name: 'menu.all' },
  { invoke: () => call(router.todo.list, {}, { context: { event } }), name: 'todo.list' },
  { invoke: () => call(router.todo.get, { id: ID }, { context: { event } }), name: 'todo.get' },
  { invoke: () => call(router.todo.create, { title: 'Write plan' }, { context: { event } }), name: 'todo.create' },
  { invoke: () => call(router.todo.update, { id: ID, title: 'Write plan' }, { context: { event } }), name: 'todo.update' },
  { invoke: () => call(router.todo.remove, { id: ID }, { context: { event } }), name: 'todo.remove' },
  {
    invoke: async () => {
      // The generator body (and the `authed` middleware wrapping it) only
      // runs once the iterator is actually pulled — `call()` alone resolves
      // without executing either.
      const stream = await call(router.todo.live, undefined, { context: { event } });
      return stream.next();
    },
    name: 'todo.live',
  },
];

describe('router auth guard', () => {
  beforeEach(() => {
    vi.mocked(resolveContext).mockRejectedValue(httpError({ status: 401, message: 'Unauthorized' }));
  });

  it.each(cases)('$name rejects with UNAUTHORIZED when the session cannot be resolved', async ({ invoke }) => {
    await expect(invoke()).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
  });
});
