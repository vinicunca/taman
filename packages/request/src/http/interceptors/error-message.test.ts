// @vitest-environment node
import { describe, expect, it, vi } from 'vitest';
import { createHttpClient } from '../client';
import { createFakeFetch, respondAfter } from '../testing';
import { DEFAULT_ERROR_MESSAGES, errorMessageInterceptor } from './error-message';

function setup(options: Omit<Parameters<typeof errorMessageInterceptor>[0], 'notify'> = {}, fetch?: typeof globalThis.fetch) {
  const fake = createFakeFetch({
    '/server-message': () => Response.json({ message: 'Quota exceeded' }, { status: 429 }),
    '/not-found': () => Response.json({}, { status: 404 }),
    '/teapot': () => new Response('', { status: 418 }),
    '/slow': (request) => respondAfter(request, 500),
  });
  const http = createHttpClient({ baseURL: 'http://api.test', fetch: fetch ?? fake.fetch, retry: false });
  const notify = vi.fn();
  http.addResponseInterceptor(errorMessageInterceptor({ notify, ...options }));
  return { http, notify };
}

describe('errorMessageInterceptor', () => {
  it('prefers the server message', async () => {
    const { http, notify } = setup();
    await expect(http.get('/server-message')).rejects.toMatchObject({ status: 429 });
    expect(notify).toHaveBeenCalledWith('Quota exceeded', expect.objectContaining({ status: 429 }));
  });

  it('falls back to the status message, then the default', async () => {
    const { http, notify } = setup();
    await http.get('/not-found').catch(() => {});
    await http.get('/teapot').catch(() => {});
    expect(notify.mock.calls.map(([message]) => message)).toEqual([DEFAULT_ERROR_MESSAGES[404], DEFAULT_ERROR_MESSAGES.default]);
  });

  it('uses overrides and can ignore the server message', async () => {
    const { http, notify } = setup({ messages: { default: 'Oops', 404: 'Missing' }, preferServerMessage: false });
    await http.get('/server-message').catch(() => {});
    await http.get('/not-found').catch(() => {});
    expect(notify.mock.calls.map(([message]) => message)).toEqual(['Oops', 'Missing']);
  });

  it('uses the network and timeout messages', async () => {
    const network = setup({}, async () => { throw new TypeError('fetch failed'); });
    await network.http.get('/x').catch(() => {});
    expect(network.notify).toHaveBeenCalledWith(DEFAULT_ERROR_MESSAGES.network, expect.anything());

    const { http, notify } = setup();
    await http.get('/slow', { timeout: 20 }).catch(() => {});
    expect(notify).toHaveBeenCalledWith(DEFAULT_ERROR_MESSAGES.timeout, expect.anything());
  });

  it('stays silent for aborted requests and always rethrows', async () => {
    const { http, notify } = setup();
    const controller = new AbortController();
    setTimeout(() => controller.abort(), 10);
    await expect(http.get('/slow', { signal: controller.signal })).rejects.toMatchObject({ kind: 'abort' });
    expect(notify).not.toHaveBeenCalled();
  });
});
