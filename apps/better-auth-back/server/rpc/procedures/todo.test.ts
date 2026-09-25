// @vitest-environment node
import type { H3Event } from 'nitro';
import type { TamanContext } from '#lib/context.ts';
import { call } from '@orpc/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { FakeTodoRepo } from '#domains/todo/todo.repo.fake.ts';
import { resolveContext } from '#lib/context.ts';
import { router } from '../router.ts';

vi.mock('#lib/context.ts', () => ({ resolveContext: vi.fn() }));
vi.mock('#domains/todo/todo.repo.ts', async (importOriginal) => {
  const original = await importOriginal<typeof import('#domains/todo/todo.repo.ts')>();
  const { FakeTodoRepo: Fake } = await import('#domains/todo/todo.repo.fake.ts');
  return { ...original, TodoRepo: Fake };
});

function ctxFor(organizationId: string): TamanContext {
  return {
    db: {} as TamanContext['db'],
    auth: {
      user: { id: '01920000-0000-7000-8000-00000000000a', role: 'user' },
      session: { userId: '01920000-0000-7000-8000-00000000000a', activeOrganizationId: organizationId },
    } as unknown as TamanContext['auth'],
    member: { role: 'member', organizationId },
  };
}

/** Each call gets its own fake event; resolveContext maps it to an org. */
function eventFor(organizationId: string) {
  const event = { organizationId } as unknown as H3Event;
  return { event };
}

describe('todo procedures', () => {
  beforeEach(() => {
    FakeTodoRepo.reset();
    vi.mocked(resolveContext).mockImplementation(async (event) =>
      ctxFor((event as unknown as { organizationId: string }).organizationId));
  });

  it('creates, reads, updates and removes a todo', async () => {
    const context = eventFor('org-1');
    const created = await call(router.todo.create, { title: 'Write plan' }, { context });

    await expect(call(router.todo.get, { id: created.id }, { context })).resolves.toMatchObject({ title: 'Write plan' });
    await expect(call(router.todo.update, { id: created.id, completed: true }, { context })).resolves.toMatchObject({ completed: true });
    await expect(call(router.todo.remove, { id: created.id }, { context })).resolves.toEqual({ id: created.id });
  });

  it('raises the contract-defined NOT_FOUND for a missing row', async () => {
    const error = await call(
      router.todo.get,
      { id: '01920000-0000-7000-8000-0000000000ff' },
      { context: eventFor('org-1') },
    ).catch((error_: unknown) => error_);

    expect(error).toMatchObject({ code: 'NOT_FOUND', defined: true });
  });

  it('rejects invalid input with BAD_REQUEST before the handler runs', async () => {
    await expect(call(router.todo.create, { title: '   ' }, { context: eventFor('org-1') }))
      .rejects
      .toMatchObject({ code: 'BAD_REQUEST' });
  });

  it('streams only the subscriber\'s own organization events', async () => {
    const controllerA = new AbortController();
    const controllerB = new AbortController();
    const streamA = await call(router.todo.live, undefined, { context: eventFor('org-a'), signal: controllerA.signal });
    const streamB = await call(router.todo.live, undefined, { context: eventFor('org-b'), signal: controllerB.signal });

    const nextA = streamA.next();
    const nextB = Promise.race([
      streamB.next().then(() => 'received'),
      new Promise((resolve) => {
        setTimeout(resolve, 150, 'nothing');
      }),
    ]);
    // The generator subscribes lazily on the first next(); let both subscriptions register.
    await new Promise((resolve) => {
      setTimeout(resolve, 20);
    });

    const created = await call(router.todo.create, { title: 'Only A' }, { context: eventFor('org-a') });

    await expect(nextA).resolves.toMatchObject({ done: false, value: { type: 'created', todo: { id: created.id } } });
    await expect(nextB).resolves.toBe('nothing');

    controllerA.abort();
    controllerB.abort();
  });
});
