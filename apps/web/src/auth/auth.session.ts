import type { AppSession } from './auth.client';

import { queryOptions } from '@tanstack/vue-query';

import { queryClient } from '#/query-client';

import { authClient } from './auth.client';
import { AUTH_QUERY_KEY } from './auth.constant';

/**
 * Single source of truth for the current Better Auth session on the client:
 * the `[AUTH_QUERY_KEY, 'session']` TanStack Query cache entry.
 *
 * Non-component code (router guard, session store) uses the imperative helpers
 * (`ensureSession` / `refreshSession` / `clearAuthCache`); components read
 * reactively via `useSessionStore()`. Session identity itself stays in the Better
 * Auth httpOnly cookie — this module only caches the session *data*.
 */
export const SESSION_QUERY_KEY = [AUTH_QUERY_KEY, 'session'] as const;

export const sessionQueryOptions = queryOptions({
  queryKey: SESSION_QUERY_KEY,
  queryFn: async (): Promise<AppSession | null> => {
    // Never reject: a failed fetch means "signed out", keeping the guard
    // boolean-simple and the query out of error state.
    try {
      const { data } = await authClient.getSession();
      return (data as AppSession | null) ?? null;
    } catch {
      return null;
    }
  },
  // Route changes within a minute cost zero fetches; window refocus
  // still revalidates in the background (session-expiry detection).
  staleTime: 60_000,
  // A failed session fetch is "signed out" — don't retry-hammer the endpoint.
  retry: false,
});

/**
 * Awaitable session gate for the router guard. Resolves immediately from
 * cache when an entry exists (fetches otherwise, deduped); a stale entry
 * additionally triggers a background revalidation, so long-lived tabs
 * pick up session expiry on navigation.
 */
export function ensureSession(): Promise<AppSession | null> {
  return queryClient.ensureQueryData({
    ...sessionQueryOptions,
    revalidateIfStale: true,
  });
}

/**
 * Force a fresh session fetch — after login, or anywhere staleness is
 * unacceptable. `staleTime: 0` makes fetchQuery bypass the fresh-cache
 * short-circuit (the guard may have cached an anonymous session seconds
 * earlier). The queryFn also re-syncs the user store.
 */
export function refreshSession(): Promise<AppSession | null> {
  return queryClient.fetchQuery({
    ...sessionQueryOptions,
    staleTime: 0,
  });
}

/**
 * Logout: drop every user-scoped cache entry and clear the store projection.
 */
export function clearAuthCache(): void {
  queryClient.removeQueries({ queryKey: [AUTH_QUERY_KEY] });
}
