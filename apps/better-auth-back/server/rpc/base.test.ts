// @vitest-environment node
import type { H3Event } from 'nitro';
import type { TamanContext } from '#lib/context.ts';
import { call, ORPCError } from '@orpc/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { resolveContext } from '#lib/context.ts';
import { httpError } from '#lib/http.ts';
import { authed, os } from './base.ts';

vi.mock('#lib/context.ts', () => ({ resolveContext: vi.fn() }));

const event = {} as H3Event;

function ctx(role: string, activeOrganizationId: string | null): TamanContext {
  return {
    db: {} as TamanContext['db'],
    auth: {
      user: { id: 'user-1', role },
      session: { userId: 'user-1', activeOrganizationId },
    } as unknown as TamanContext['auth'],
    member: activeOrganizationId ? { role: 'member', organizationId: activeOrganizationId } : null,
  };
}

/** A procedure that echoes the injected user id through `menu.all`'s output shape. */
const probe = os.menu.all.use(authed).handler(({ context }) => [
  { name: context.taman.auth.user.id, path: '/' },
]);

describe('authed', () => {
  beforeEach(() => {
    vi.mocked(resolveContext).mockReset();
  });

  it('injects the resolved context', async () => {
    vi.mocked(resolveContext).mockResolvedValue(ctx('user', 'org-1'));
    await expect(call(probe, undefined, { context: { event } })).resolves.toEqual([{ name: 'user-1', path: '/' }]);
  });

  it('maps a missing session to UNAUTHORIZED', async () => {
    vi.mocked(resolveContext).mockRejectedValue(httpError({ status: 401, message: 'Unauthorized' }));
    await expect(call(probe, undefined, { context: { event } })).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
  });

  it('requires an active organization for non-admins', async () => {
    vi.mocked(resolveContext).mockResolvedValue(ctx('user', null));
    await expect(call(probe, undefined, { context: { event } })).rejects.toMatchObject({
      code: 'FORBIDDEN',
      data: { code: 'ORG_REQUIRED' },
    });
  });

  it('lets platform admins through without an organization', async () => {
    vi.mocked(resolveContext).mockResolvedValue(ctx('admin', null));
    await expect(call(probe, undefined, { context: { event } })).resolves.toHaveLength(1);
  });
});

describe('os base middleware', () => {
  it('maps a nested database connection failure to SERVICE_UNAVAILABLE', async () => {
    const refused = Object.assign(new Error('connect ECONNREFUSED'), { code: 'ECONNREFUSED' });
    const failing = os.menu.all.handler(() => {
      throw new Error('query failed', { cause: refused });
    });

    const error = await call(failing, undefined, { context: { event } }).catch((error_: unknown) => error_);

    expect(error).toBeInstanceOf(ORPCError);
    expect(error).toMatchObject({ code: 'SERVICE_UNAVAILABLE' });
  });

  it('logs unexpected errors and rethrows them', async () => {
    const log = vi.spyOn(console, 'error').mockImplementation(() => {});
    const failing = os.menu.all.handler(() => {
      throw new Error('boom');
    });

    await expect(call(failing, undefined, { context: { event } })).rejects.toThrow();
    expect(log).toHaveBeenCalledWith('[rpc] unhandled', expect.any(Error));
    log.mockRestore();
  });
});
