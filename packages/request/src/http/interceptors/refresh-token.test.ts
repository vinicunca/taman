// @vitest-environment node
import { describe, expect, it, vi } from 'vitest';
import { createHttpClient } from '../client';
import { createFakeFetch } from '../testing';
import { errorMessageInterceptor } from './error-message';
import { refreshTokenInterceptor } from './refresh-token';

function setup(options: { refresh?: () => Promise<string>; enabled?: boolean } = {}) {
  let token = 'old';
  const fake = createFakeFetch({
    '/secure': (request) => (request.headers.get('authorization') === 'Bearer new'
      ? Response.json({ ok: true })
      : Response.json({ message: 'expired' }, { status: 401 })),
    '/always-401': () => Response.json({}, { status: 401 }),
    '/forbidden': () => Response.json({}, { status: 403 }),
  });
  const http = createHttpClient({ baseURL: 'http://api.test', fetch: fake.fetch, retry: false });
  http.addRequestInterceptor((context) => {
    context.options.headers.set('authorization', `Bearer ${token}`);
  });

  const refresh = vi.fn(options.refresh ?? (async () => {
    await new Promise((resolve) => {
      setTimeout(resolve, 20);
    });
    token = 'new';
    return 'new';
  }));
  const onAuthFailure = vi.fn();
  const notify = vi.fn();

  http.addResponseInterceptor(refreshTokenInterceptor({
    client: http,
    refresh,
    applyToken: (context, value) => context.options.headers.set('authorization', `Bearer ${value}`),
    onAuthFailure,
    enabled: options.enabled,
  }));
  http.addResponseInterceptor(errorMessageInterceptor({ notify }));

  return {
    http,
    calls: fake.calls,
    refresh,
    onAuthFailure,
    notify,
    setToken: (value: string) => {
      token = value;
    },
  };
}

describe('refreshTokenInterceptor', () => {
  it('refreshes once for concurrent 401s and retries each request once with the new token', async () => {
    const { http, calls, refresh } = setup();
    const results = await Promise.all([http.get('/secure'), http.get('/secure'), http.get('/secure')]);
    expect(results).toEqual([{ ok: true }, { ok: true }, { ok: true }]);
    expect(refresh).toHaveBeenCalledTimes(1);
    expect(calls.map((call) => call.headers.get('authorization'))).toEqual([
      'Bearer old',
      'Bearer old',
      'Bearer old',
      'Bearer new',
      'Bearer new',
      'Bearer new',
    ]);
  });

  it('calls onAuthFailure once and rejects every waiting request when refresh fails', async () => {
    const { http, onAuthFailure } = setup({
      refresh: async () => {
        throw new Error('refresh denied');
      },
    });
    const outcomes = await Promise.allSettled([http.get('/secure'), http.get('/secure')]);
    expect(outcomes.map((outcome) => outcome.status)).toEqual(['rejected', 'rejected']);
    expect(onAuthFailure).toHaveBeenCalledTimes(1);
  });

  it('does not loop on an endpoint that keeps answering 401, and notifies once', async () => {
    const { http, calls, onAuthFailure, notify, setToken } = setup();
    setToken('new');
    const error = await http.get('/always-401').catch((error_: unknown) => error_);
    expect(error).toMatchObject({ kind: 'http', status: 401 });
    expect(calls).toHaveLength(2);
    expect(onAuthFailure).toHaveBeenCalledTimes(1);
    expect(notify).toHaveBeenCalledTimes(1);
  });

  it('goes straight to onAuthFailure when refresh is disabled', async () => {
    const { http, refresh, onAuthFailure } = setup({ enabled: false });
    await expect(http.get('/secure')).rejects.toMatchObject({ status: 401 });
    expect(refresh).not.toHaveBeenCalled();
    expect(onAuthFailure).toHaveBeenCalledTimes(1);
  });

  it('leaves other errors alone', async () => {
    const { http, refresh, onAuthFailure } = setup();
    await expect(http.get('/forbidden')).rejects.toMatchObject({ status: 403 });
    expect(refresh).not.toHaveBeenCalled();
    expect(onAuthFailure).not.toHaveBeenCalled();
  });
});
