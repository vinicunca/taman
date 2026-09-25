import type { H3Event } from 'nitro';
import type { TamanContext } from '#lib/context.ts';
import { implement, ORPCError } from '@orpc/server';
import { USER_ROLES } from '@taman/rbac';
import { contract, ORG_REQUIRED } from '@vinicunca/taman-api-contract';
import { HTTPError } from 'nitro';
import { findConnectionErrorCode } from '#errors/error.db.ts';
import { resolveContext } from '#lib/context.ts';

export interface RpcInitialContext {
  event: H3Event;
}

/**
 * Every procedure starts here. oRPC turns anything that is not an
 * `ORPCError` into an opaque INTERNAL_SERVER_ERROR, so this is the one place
 * that still sees the raw error: it logs it (CF Observability captures
 * console.error) and gives a database outage the same 503 meaning it has on
 * the REST side (`errors/error.db.ts`).
 */
const implementer = implement(contract).$context<RpcInitialContext>();

export const os = implementer.use(async ({ next }) => {
  try {
    return await next();
  } catch (error) {
    if (error instanceof ORPCError) {
      throw error;
    }

    if (findConnectionErrorCode(error)) {
      throw new ORPCError('SERVICE_UNAVAILABLE', {
        message: 'Unable to reach the database. Is it running?',
        cause: error,
      });
    }

    console.error('[rpc] unhandled', error);
    throw error;
  }
});

/**
 * Session → db → membership, via the same `resolveContext` the REST layer
 * used. Carries over the rule from the old `/api` middleware: everyone but a
 * platform admin needs an active organization.
 */
export const authed = implementer.middleware(async ({ context, next }) => {
  let taman: TamanContext;

  try {
    taman = await resolveContext(context.event);
  } catch (error) {
    if (HTTPError.isError(error) && error.status === 401) {
      throw new ORPCError('UNAUTHORIZED', { cause: error });
    }

    throw error;
  }

  if (
    taman.auth.user.role !== USER_ROLES.ADMIN
    && !taman.auth.session.activeOrganizationId
  ) {
    throw new ORPCError('FORBIDDEN', {
      message: 'Organization required',
      data: { code: ORG_REQUIRED },
    });
  }

  return next({ context: { taman } });
});
