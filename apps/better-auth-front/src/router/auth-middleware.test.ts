import { describe, expect, it } from 'vitest';

import { resolveAuthDecision, resolveAuthMetaFromMatched } from './auth-middleware';

const DEFAULTS = { guestTarget: '/auth/login', userTarget: '/home' };

describe('resolveAuthMetaFromMatched', () => {
  it('ignores Root auth:false so dashboard children stay protected-by-default', () => {
    expect(resolveAuthMetaFromMatched([
      { name: 'Root', meta: { auth: false } },
      { name: 'Dashboard', meta: { title: 'Dashboard' } },
      { name: 'Analytics', meta: { affixTab: true } },
    ])).toBeUndefined();
  });

  it('uses the nearest non-layout record that explicitly declares auth', () => {
    expect(resolveAuthMetaFromMatched([
      { name: 'Root', meta: { auth: false } },
      { name: 'Authentication', meta: { title: 'Auth' } },
      { name: 'Login', meta: { auth: { only: 'guest' } } },
    ])).toEqual({ only: 'guest' });
  });

  it('returns undefined for catch-all 404 so unknown paths stay protected-by-default', () => {
    expect(resolveAuthMetaFromMatched([
      { name: 'Root', meta: { auth: false } },
      { name: 'FallbackNotFound', meta: { title: '404' } },
    ])).toBeUndefined();
  });

  it('logged-out visitor to /dashboard (pre-generation) → redirect to login', () => {
    const authMeta = resolveAuthMetaFromMatched([
      { name: 'Root', meta: { auth: false } },
      { name: 'FallbackNotFound', meta: { title: '404' } },
    ]);
    expect(resolveAuthDecision({ authMeta, isAuthenticated: false, defaults: DEFAULTS })).toEqual({
      type: 'redirectToLogin',
      target: '/auth/login',
    });
  });
});

describe('resolveAuthDecision', () => {
  it('false + guest → allow, skips access generation', () => {
    expect(resolveAuthDecision({ authMeta: false, isAuthenticated: false, defaults: DEFAULTS })).toEqual({
      type: 'allow',
    });
  });

  it('false + authenticated → allow, skips access generation', () => {
    expect(resolveAuthDecision({ authMeta: false, isAuthenticated: true, defaults: DEFAULTS })).toEqual({
      type: 'allow',
    });
  });

  it('{ only: \'guest\' } + guest → allow, skips access generation', () => {
    expect(
      resolveAuthDecision({ authMeta: { only: 'guest' }, isAuthenticated: false, defaults: DEFAULTS }),
    ).toEqual({ type: 'allow' });
  });

  it('{ only: \'guest\' } + authenticated, no override → redirectAuthenticated to userTarget', () => {
    expect(
      resolveAuthDecision({ authMeta: { only: 'guest' }, isAuthenticated: true, defaults: DEFAULTS }),
    ).toEqual({ type: 'redirectAuthenticated', target: '/home' });
  });

  it('{ only: \'guest\', redirectUserTo } + authenticated → redirectAuthenticated to the override', () => {
    expect(
      resolveAuthDecision(
        { authMeta: { only: 'guest', redirectUserTo: '/custom' }, isAuthenticated: true, defaults: DEFAULTS },
      ),
    ).toEqual({ type: 'redirectAuthenticated', target: '/custom' });
  });

  it('undefined + guest → redirectToLogin to guestTarget', () => {
    expect(resolveAuthDecision({ authMeta: undefined, isAuthenticated: false, defaults: DEFAULTS })).toEqual({
      type: 'redirectToLogin',
      target: '/auth/login',
    });
  });

  it('undefined + authenticated → allow, participates in access generation', () => {
    expect(resolveAuthDecision({ authMeta: undefined, isAuthenticated: true, defaults: DEFAULTS })).toEqual({
      type: 'generateAccess',
    });
  });

  it('{} (no only) + guest → redirectToLogin, same as undefined', () => {
    expect(resolveAuthDecision({ authMeta: {}, isAuthenticated: false, defaults: DEFAULTS })).toEqual({
      type: 'redirectToLogin',
      target: '/auth/login',
    });
  });

  it('{ only: \'user\', redirectGuestTo } + guest → redirectToLogin to the override', () => {
    expect(
      resolveAuthDecision(
        { authMeta: { only: 'user', redirectGuestTo: '/custom-login' }, isAuthenticated: false, defaults: DEFAULTS },
      ),
    ).toEqual({ type: 'redirectToLogin', target: '/custom-login' });
  });
});
