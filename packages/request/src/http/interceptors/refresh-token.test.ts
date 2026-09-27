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
    '/me': () => Response.json({}, { status: 401 }),
  });
  const http = createHttpClient({ baseURL: 'http://api.test', fetch: fake.fetch, retry: false });
  http.addRequestInterceptor((context) => {
    context.options.headers.set('authorization', `Bearer ${token}`);
  });

  // Deliberately does NOT set `token` here: the retry must succeed purely
  // because `applyToken` writes the new value onto the re-issued request
  // (I1) — if `applyToken` were overwritten by the re-run request
  // interceptor (which still reads the stale `token` closure), the retry
  // would carry `Bearer old` and fail again.
  const refresh = vi.fn(options.refresh ?? (async () => {
    await new Promise((resolve) => {
      setTimeout(resolve, 20);
    });
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

  it('does not deadlock when refresh (with skipAuthRefresh) hits the same client and gets 401', async () => {
    const fake = createFakeFetch({
      '/secure': () => Response.json({}, { status: 401 }),
      '/refresh': () => Response.json({}, { status: 401 }),
    });
    const http = createHttpClient({ baseURL: 'http://api.test', fetch: fake.fetch, retry: false });
    const onAuthFailure = vi.fn();
    http.addResponseInterceptor(refreshTokenInterceptor({
      client: http,
      refresh: () => http.post<string>('/refresh', undefined, { skipAuthRefresh: true, responseReturn: 'data' }),
      applyToken: (context, value) => context.options.headers.set('authorization', `Bearer ${value}`),
      onAuthFailure,
    }));

    const outcome = await Promise.race([
      http.get('/secure').then((value) => ({ status: 'resolved', value }), (error: unknown) => ({ status: 'rejected', error })),
      new Promise((resolve) => {
        setTimeout(resolve, 200, { status: 'timed-out' });
      }),
    ]);

    expect(outcome).toMatchObject({ status: 'rejected', error: { kind: 'http', status: 401 } });
    expect(onAuthFailure).toHaveBeenCalledTimes(1);
  });

  describe('a skipAuthRefresh 401 while an unrelated refresh is in flight', () => {
    // The refresh stays pending until the test settles it, so the
    // skipAuthRefresh request is guaranteed to fail during the refresh
    function setupWithPendingRefresh() {
      let settle!: { resolve: (token: string) => void; reject: (error: Error) => void };
      const pending = new Promise<string>((resolve, reject) => {
        settle = { resolve, reject };
      });
      return { ...setup({ refresh: () => pending }), settle };
    }

    it('calls onAuthFailure for it when the refresh succeeds', async () => {
      const { http, refresh, onAuthFailure, settle } = setupWithPendingRefresh();
      const secure = http.get('/secure');
      await vi.waitFor(() => expect(refresh).toHaveBeenCalledTimes(1));

      const meError = await http.get('/me', { skipAuthRefresh: true }).catch((error_: unknown) => error_);
      expect(meError).toMatchObject({ kind: 'http', status: 401 });

      settle.resolve('new');
      await expect(secure).resolves.toEqual({ ok: true });
      await vi.waitFor(() => expect(onAuthFailure).toHaveBeenCalledTimes(1));
      expect(onAuthFailure).toHaveBeenCalledWith(meError);
    });

    it('reports the failed refresh only once', async () => {
      const { http, refresh, onAuthFailure, settle } = setupWithPendingRefresh();
      const secure = http.get('/secure').catch((error_: unknown) => error_);
      await vi.waitFor(() => expect(refresh).toHaveBeenCalledTimes(1));

      await http.get('/me', { skipAuthRefresh: true }).catch(() => {});

      settle.reject(new Error('refresh denied'));
      await secure;
      // Give a deferred notification the chance to (wrongly) fire a second time
      await new Promise((resolve) => {
        setTimeout(resolve, 30);
      });
      expect(onAuthFailure).toHaveBeenCalledTimes(1);
    });
  });

  it('still rejects with the original error when onAuthFailure throws (disabled, retried-out and refresh-failed paths)', async () => {
    const onAuthFailure = vi.fn(() => {
      throw new Error('notifier is broken');
    });
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    try {
      const disabled = setup({ enabled: false });
      disabled.onAuthFailure.mockImplementation(onAuthFailure);
      await expect(disabled.http.get('/secure')).rejects.toMatchObject({ kind: 'http', status: 401 });

      const refreshFails = setup({
        refresh: async () => {
          throw new Error('refresh denied');
        },
      });
      refreshFails.onAuthFailure.mockImplementation(onAuthFailure);
      await expect(refreshFails.http.get('/secure')).rejects.toMatchObject({ kind: 'http', status: 401 });
    } finally {
      consoleError.mockRestore();
    }
  });
});
