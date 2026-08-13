import type { AuthMiddlewareOptions } from '@taman/types';

/** Minimal matched-record shape for auth meta resolution (no vue-router import). */
export interface MatchedRouteRecord {
  name?: null | string | symbol;
  meta: Record<string, unknown>;
}

/**
 * Layout shells whose `auth` meta must not leak to child routes via merge.
 * Any layout-shell route that declares its own `meta.auth` (e.g. `Root`'s
 * `auth: false`) MUST be added here, or its value silently applies to every
 * child that doesn't declare its own `auth` — the exact bug this walk exists
 * to prevent.
 */
export const AUTH_LAYOUT_ROUTE_NAMES = new Set(['Root']);

/**
 * Resolve auth meta from matched route records (leaf → root).
 *
 * Do not use merged `to.meta.auth` — Root's `auth: false` would apply to
 * every child mounted under the CoreLayout shell.
 */
export function resolveAuthMetaFromMatched(
  matched: Array<MatchedRouteRecord>,
): AuthMiddlewareOptions | undefined {
  for (let i = matched.length - 1; i >= 0; i--) {
    const record = matched[i];
    if (record?.name != null && AUTH_LAYOUT_ROUTE_NAMES.has(String(record.name))) {
      continue;
    }
    if (record?.meta && Object.hasOwn(record.meta, 'auth')) {
      return record?.meta.auth as AuthMiddlewareOptions | undefined;
    }
  }
  return undefined;
}

/**
 * Result of gating a navigation by its route's `meta.auth`.
 *
 * `AuthAllowDecisionType` covers outcomes that don't redirect: `allow`
 * covers routes that don't participate in role-based access generation
 * (guest pages, `auth: false`, mid-onboarding); `generateAccess` is the one
 * case that does — a protected route visited by an authenticated, fully
 * onboarded user.
 *
 * `AuthRedirectDecisionType` covers the three redirect outcomes, split from
 * each other because they're different query-string operations in the
 * guard: `redirectToLogin` attaches a `?redirect=` so the login page can
 * send the user back; `redirectAuthenticated` consumes one if present.
 * `redirectToOnboarding` never carries one — wherever the user was headed
 * isn't reachable without an org yet, so onboarding always lands on the
 * app's home path afterward instead of resuming it.
 */
type AuthAllowDecisionType = 'allow' | 'generateAccess';
type AuthRedirectDecisionType = 'redirectAuthenticated' | 'redirectToLogin' | 'redirectToOnboarding';

export type AuthDecision
  = | { type: AuthAllowDecisionType }
    | { type: AuthRedirectDecisionType; target: string };

/**
 * Pure decision function: given a route's auth meta, whether the visitor
 * is authenticated, and whether they still need onboarding (non-admin,
 * no active organization), decide whether to allow the navigation and
 * whether it should participate in role-based access generation, or where
 * to redirect. Takes no imports beyond types — callers supply `defaults`
 * so this stays testable with plain strings.
 */
export function resolveAuthDecision(
  { authMeta, isAuthenticated, needsOnboarding = false, defaults }:
  {
    authMeta: AuthMiddlewareOptions | undefined;
    isAuthenticated: boolean;
    needsOnboarding?: boolean;
    defaults: { guestTarget: string; userTarget: string; onboardingTarget: string };
  },
): AuthDecision {
  if (authMeta === false) {
    return { type: 'allow' };
  }

  const only = authMeta?.only ?? 'user';

  if (only === 'guest') {
    if (isAuthenticated) {
      return {
        type: 'redirectAuthenticated',
        target: authMeta?.redirectUserTo ?? defaults.userTarget,
      };
    }

    return { type: 'allow' };
  }

  if (only === 'onboarding') {
    if (!isAuthenticated) {
      return {
        type: 'redirectToLogin',
        target: authMeta?.redirectGuestTo ?? defaults.guestTarget,
      };
    }

    if (needsOnboarding) {
      return { type: 'allow' };
    }

    return {
      type: 'redirectAuthenticated',
      target: authMeta?.redirectUserTo ?? defaults.userTarget,
    };
  }

  if (!isAuthenticated) {
    return {
      type: 'redirectToLogin',
      target: authMeta?.redirectGuestTo ?? defaults.guestTarget,
    };
  }

  if (needsOnboarding) {
    return {
      type: 'redirectToOnboarding',
      target: defaults.onboardingTarget,
    };
  }

  return { type: 'generateAccess' };
}
