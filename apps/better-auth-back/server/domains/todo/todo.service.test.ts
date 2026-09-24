// @vitest-environment node
import type { TodoEvent } from '@vinicunca/taman-api-contract';
import type { TamanContext } from '#lib/context.ts';
import type { TodoPublisher } from '#realtime/publisher.ts';
import { ORPCError } from '@orpc/server';
import { MemoryPublisher } from '@orpc/experimental-publisher/memory';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { FakeTodoRepo } from './todo.repo.fake.ts';
import { TodoService } from './todo.service.ts';

const USER_ID = '01920000-0000-7000-8000-00000000000a';

function makeCtx(overrides: Partial<TamanContext> = {}): TamanContext {
  return {
    db: {} as TamanContext['db'],
    auth: {
      user: { id: USER_ID, role: 'user' },
      session: { userId: USER_ID, activeOrganizationId: 'org-1' },
    } as unknown as TamanContext['auth'],
    member: { role: 'member', organizationId: 'org-1' },
    ...overrides,
  };
}

async function collect(publisher: TodoPublisher, channel: string) {
  const events: Array<TodoEvent> = [];
  await publisher.subscribe(channel, (event) => {
    events.push(event);
  });
  return events;
}

describe('TodoService', () => {
  let repo: FakeTodoRepo;
  let publisher: TodoPublisher;

  beforeEach(() => {
    FakeTodoRepo.reset();
    repo = new FakeTodoRepo();
    // `MemoryPublisher<T>` has no default for `T` and its constructor takes no
    // T-bearing argument, so TS can't infer it from the `publisher: TodoPublisher`
    // assignment target here — an explicit type argument is required.
    publisher = new MemoryPublisher<Record<string, TodoEvent>>();
  });

  it('creates a todo owned by the caller and publishes it on the org channel', async () => {
    const events = await collect(publisher, 'todo:org-1');
    const service = new TodoService(makeCtx(), { publisher, repo });

    const todo = await service.create({ title: 'Buy milk' });

    expect(todo).toMatchObject({ title: 'Buy milk', completed: false, createdBy: USER_ID });
    expect(todo.createdAt).toBeInstanceOf(Date);
    expect(events).toEqual([{ type: 'created', todo }]);
  });

  it('pages results and computes totals', async () => {
    const service = new TodoService(makeCtx(), { publisher, repo });
    for (let index = 0; index < 5; index++) {
      await service.create({ title: `Todo ${index}` });
    }

    const page = await service.list({ page: 2, pageSize: 2 });

    expect(page).toMatchObject({ page: 2, pageSize: 2, total: 5, totalPages: 3 });
    expect(page.items).toHaveLength(2);
    expect(repo.lastListQuery).toMatchObject({ organizationId: 'org-1', limit: 2, offset: 2 });
  });

  it('treats an empty search as no filter', async () => {
    const service = new TodoService(makeCtx(), { publisher, repo });
    await service.list({ page: 1, pageSize: 20, search: '' });
    expect(repo.lastListQuery?.search).toBeUndefined();
  });

  it('returns null and publishes nothing for a missing row', async () => {
    const events = await collect(publisher, 'todo:org-1');
    const service = new TodoService(makeCtx(), { publisher, repo });
    const missing = '01920000-0000-7000-8000-0000000000ff';

    expect(await service.get(missing)).toBeNull();
    expect(await service.update({ id: missing, completed: true })).toBeNull();
    expect(await service.remove(missing)).toBeNull();
    expect(events).toEqual([]);
  });

  it('never reads rows from another organization', async () => {
    const own = new TodoService(makeCtx(), { publisher, repo });
    const other = new TodoService(
      makeCtx({ member: { role: 'member', organizationId: 'org-2' } }),
      { publisher, repo },
    );
    const todo = await own.create({ title: 'Private' });

    expect(await other.get(todo.id)).toBeNull();
    expect((await other.list({ page: 1, pageSize: 20 })).total).toBe(0);
  });

  it('fails with ORG_REQUIRED when the caller has no membership', async () => {
    const service = new TodoService(makeCtx({ member: null }), { publisher, repo });

    const error = await service.list({ page: 1, pageSize: 20 }).catch((error_: unknown) => error_);

    expect(error).toBeInstanceOf(ORPCError);
    expect(error).toMatchObject({ code: 'FORBIDDEN' });
  });

  it('keeps a committed mutation successful when publishing fails', async () => {
    const failing = { publish: vi.fn().mockRejectedValue(new Error('DO down')) } as unknown as TodoPublisher;
    const log = vi.spyOn(console, 'error').mockImplementation(() => {});
    const service = new TodoService(makeCtx(), { publisher: failing, repo });

    await expect(service.create({ title: 'Still saved' })).resolves.toMatchObject({ title: 'Still saved' });
    expect(log).toHaveBeenCalled();
    log.mockRestore();
  });
});
