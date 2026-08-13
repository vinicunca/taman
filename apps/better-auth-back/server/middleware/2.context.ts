import type { TamanContext } from '#lib/context.ts';
import { USER_ROLES } from '@taman/rbac';
import { defineHandler } from 'nitro';
import { resolveContext } from '#lib/context.ts';
import { httpError } from '#lib/http.ts';

/**
 * This middleware is responsible for authenticating the user and
 * also injecting the `director` into the event context.
 */
export default defineHandler(async (event) => {
  if (!isApiRoute(event.url.pathname)) {
    return;
  }

  const tamanContext = await resolveContext(event);
  const { auth } = tamanContext;

  if (
    auth.user.role !== USER_ROLES.ADMIN
    && !auth.session.activeOrganizationId
  ) {
    throw httpError({
      status: 403,
      message: 'Organization required',
      data: { code: 'ORG_REQUIRED' },
    });
  }

  event.context.taman = tamanContext;
});

declare module 'nitro/h3' {
  interface H3EventContext {
    taman: TamanContext;
  }
}

/**
 * All API routes are protected by auth.
 * For `/api/auth` routes, it's already handled by better-auth.
 */
function isApiRoute(pathname: string) {
  return pathname.startsWith('/api')
    && !pathname.startsWith('/api/auth');
}
