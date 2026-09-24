// @vitest-environment node
import type { H3Event } from 'nitro';
import type { TamanContext } from '#lib/context.ts';
import { createTamanClient, isDefinedError, safe } from '@vinicunca/taman-request/orpc';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { FakeTodoRepo } from '#domains/todo/todo.repo.fake.ts';
import { resolveContext } from '#lib/context.ts';
import { RPC_PREFIX, rpcHandler } from './handler.ts';

vi.mock('#lib/context.ts', () => ({ resolveContext: vi.fn() }));
vi.mock('#domains/todo/todo.repo.ts', async (importOriginal) => {
  const original = await importOriginal<typeof import('#domains/todo/todo.repo.ts')>();
  const { FakeTodoRepo: Fake } = await import('#domains/todo/todo.repo.fake.ts');
  return { ...original, TodoRepo: Fake };
});

const ctx: TamanContext = {
  db: {} as TamanContext['db'],
  auth: {
    user: { id: '01920000-0000-7000-8000-00000000000a', role: 'user' },
    session: { userId: '01920000-0000-7000-8000-00000000000a', activeOrganizationId: 'org-1' },
  } as unknown as TamanContext['auth'],
  member: { role: 'owner', organizationId: 'org-1' },
};

const client = createTamanClient({
  baseUrl: 'http://api.test',
  fetch: async (request, init) => {
    const { response } = await rpcHandler.handle(new Request(request, init), {
      prefix: RPC_PREFIX,
      context: { event: {} as H3Event },
    });
    return response ?? new Response(null, { status: 404 });
  },
});

describe('server ⇄ published client round trip', () => {
  beforeEach(() => {
    FakeTodoRepo.reset();
    vi.mocked(resolveContext).mockResolvedValue(ctx);
  });

  it('keeps Dates as Dates and pages through the real router', async () => {
    await client.todo.create({ title: 'One' });
    await client.todo.create({ title: 'Two' });

    const page = await client.todo.list({ pageSize: 1 });

    expect(page).toMatchObject({ page: 1, pageSize: 1, total: 2, totalPages: 2 });
    expect(page.items[0]?.createdAt).toBeInstanceOf(Date);
  });

  it('exposes the contract-defined NOT_FOUND as a typed error', async () => {
    const [error] = await safe(client.todo.get({ id: '01920000-0000-7000-8000-0000000000ff' }));
    expect(isDefinedError(error) && error.code).toBe('NOT_FOUND');
  });
});
