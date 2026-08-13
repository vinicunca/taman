import type { H3Event } from 'nitro';
import type { DirectorAuth } from '#auth/better-auth.instance.ts';
import { useBetterAuth } from '#auth/better-auth.instance.ts';
import { httpError } from '#lib/http.ts';

export async function getAuthAccess(event: H3Event) {
  const { headers } = event.req;

  const tamanAuth = useBetterAuth(event);

  const auth = await isLoggedIn(tamanAuth, headers);

  return auth;
}

async function isLoggedIn(auth: DirectorAuth, headers: Headers) {
  const session = await auth.api.getSession({ headers });

  if (!session) {
    throw httpError({
      status: 401,
      message: 'Unauthorized',
    });
  }

  return session;
}
