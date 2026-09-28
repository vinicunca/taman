// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { createAuthDemo } from './auth-demo';

interface Call { method: string; path: string; body: unknown }

const USER = {
  id: 1,
  username: 'emilys',
  email: 'emilys@x.dummyjson.com',
  firstName: 'Emily',
  lastName: 'Johnson',
  gender: 'female',
  image: 'https://dummyjson.com/icon/emilys/128',
};

/** In-test fake fetch: login/me/refresh, with a working refresh token and a broken one. */
function createFakeFetch() {
  const calls: Array<Call> = [];
  let access = 'access-1';
  let refresh = 'refresh-1';

  const fetch: typeof globalThis.fetch = async (input, init) => {
    const request = new Request(input as RequestInfo, init);
    const url = new URL(request.url);
    const body = request.method === 'GET' ? undefined : await request.clone().json().catch(() => undefined);
    calls.push({ method: request.method, path: url.pathname, body });

    if (url.pathname === '/auth/login' && request.method === 'POST') {
      access = 'access-1';
      refresh = 'refresh-1';
      return Response.json({ accessToken: access, refreshToken: refresh, ...USER });
    }

    if (url.pathname === '/auth/me' && request.method === 'GET') {
      if (request.headers.get('authorization') === `Bearer ${access}`) {
        return Response.json(USER);
      }
      return Response.json({ message: 'Invalid/Expired Token!' }, { status: 401 });
    }

    if (url.pathname === '/auth/refresh' && request.method === 'POST') {
      const givenRefresh = (body as { refreshToken?: string } | undefined)?.refreshToken;
      if (givenRefresh === refresh) {
        access = 'access-2';
        refresh = 'refresh-2';
        return Response.json({ accessToken: access, refreshToken: refresh });
      }
      return Response.json({ message: 'Invalid refresh token' }, { status: 401 });
    }

    return new Response('not found', { status: 404 });
  };

  return {
    fetch,
    calls,
    countCalls: (path: string) => calls.filter((call) => call.path === path).length,
  };
}

describe('createAuthDemo', () => {
  it('login stores the access token, refresh token and user', async () => {
    const fake = createFakeFetch();
    const demo = createAuthDemo({ fetch: fake.fetch, baseURL: 'http://auth.test' });

    await demo.login();

    expect(demo.session.accessToken).toBe('access-1');
    expect(demo.session.refreshToken).toBe('refresh-1');
    expect(demo.session.user?.username).toBe('emilys');
  });

  it('refreshes once on a 401, retries with the new token, and logs unauthorized, refresh, retry, success in order', async () => {
    const fake = createFakeFetch();
    const demo = createAuthDemo({ fetch: fake.fetch, baseURL: 'http://auth.test' });
    await demo.login();

    demo.expireAccessToken();
    await demo.fetchMe();

    expect(demo.session.accessToken).toBe('access-2');
    expect(demo.session.user?.username).toBe('emilys');
    expect(fake.countCalls('/auth/refresh')).toBe(1);

    // Chronological order; only the four kinds this flow cares about (login's
    // own 'success' entry sorts before all of these and is not part of it).
    const relevantKinds = demo.log.value
      .slice()
      .reverse()
      .map((entry) => entry.kind)
      .filter((kind) => (['unauthorized', 'refresh', 'retry', 'success'] as Array<string>).includes(kind));
    expect(relevantKinds.slice(-4)).toEqual(['unauthorized', 'refresh', 'retry', 'success']);
  });

  it('clears the session and logs a failure when the refresh token is also invalid', async () => {
    const fake = createFakeFetch();
    const demo = createAuthDemo({ fetch: fake.fetch, baseURL: 'http://auth.test' });
    await demo.login();

    demo.breakRefreshToken();
    demo.expireAccessToken();

    await expect(demo.fetchMe()).rejects.toThrow();

    expect(demo.session.accessToken).toBeUndefined();
    expect(demo.session.refreshToken).toBeUndefined();
    expect(demo.session.user).toBeUndefined();
    expect(demo.log.value.some((entry) => entry.kind === 'failure')).toBe(true);
  });

  it('shares a single refresh across concurrent requests', async () => {
    const fake = createFakeFetch();
    const demo = createAuthDemo({ fetch: fake.fetch, baseURL: 'http://auth.test' });
    await demo.login();
    demo.expireAccessToken();

    const outcomes = await Promise.allSettled([demo.fetchMe(), demo.fetchMe()]);

    expect(outcomes.map((outcome) => outcome.status)).toEqual(['fulfilled', 'fulfilled']);
    expect(fake.countCalls('/auth/refresh')).toBe(1);
  });
});
