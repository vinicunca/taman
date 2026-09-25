// @vitest-environment node
import type { HttpResponse } from './types';
import { describe, expect, it, vi } from 'vitest';
import { createHttpClient, isHttpResponse } from './client';
import { HttpError, isHttpError } from './errors';
import { createFakeFetch, respondAfter } from './testing';

const envelope = { code: 0, data: { id: 1 }, message: 'ok' };

function setup() {
  const fake = createFakeFetch({
    '/env': () => Response.json(envelope),
    '/echo': (request) => Response.json({ search: new URL(request.url).search }),
    '/boom': () => Response.json({ error: 'Kaboom' }, { status: 500 }),
    '/slow': (request) => respondAfter(request, 500),
    '/unparsable': () => Response.json({ ok: true }),
  });
  const http = createHttpClient({ baseURL: 'http://api.test', fetch: fake.fetch, retry: false, headers: { 'x-client': '1' } });
  return { http, calls: fake.calls };
}

async function rejection(promise: Promise<unknown>): Promise<HttpError> {
  const error = await promise.then(() => undefined, (error_: unknown) => error_);
  if (!isHttpError(error)) {
    throw new Error(`expected an HttpError, got ${String(error)}`);
  }
  return error;
}

describe('createHttpClient', () => {
  it('returns the parsed body by default', async () => {
    const { http } = setup();
    await expect(http.get('/env')).resolves.toEqual(envelope);
  });

  it('returns the full response for responseReturn: raw', async () => {
    const { http } = setup();
    const raw = await http.get<HttpResponse>('/env', { responseReturn: 'raw' });
    expect(isHttpResponse(raw)).toBe(true);
    expect(raw.status).toBe(200);
    expect(raw.data).toEqual(envelope);
    expect(raw.response).toBeInstanceOf(Response);
  });

  it('treats responseReturn: data like body when no envelope interceptor is installed', async () => {
    const { http } = setup();
    await expect(http.get('/env', { responseReturn: 'data' })).resolves.toEqual(envelope);
  });

  it('sends the method, a JSON body and merged headers', async () => {
    const { http, calls } = setup();
    await http.post('/echo', { a: 1 }, { headers: { 'x-req': '2' } });
    const call = calls.at(-1)!;
    expect(call.method).toBe('POST');
    expect(call.body).toBe('{"a":1}');
    expect(call.headers.get('x-client')).toBe('1');
    expect(call.headers.get('x-req')).toBe('2');
    expect(call.headers.get('content-type')).toContain('application/json');
  });

  it('only sends credentials when configured', async () => {
    const { http, calls } = setup();
    await http.get('/echo');
    await http.get('/echo', { credentials: 'include' });
    expect(calls[0]!.credentials).not.toBe('include');
    expect(calls[1]!.credentials).toBe('include');
  });

  it('does not let an explicit undefined request option override a client default', async () => {
    const fake = createFakeFetch({ '/echo': () => Response.json({ ok: true }), '/slow': (request) => respondAfter(request, 500) });
    const http = createHttpClient({ baseURL: 'http://api.test', fetch: fake.fetch, retry: false, credentials: 'include', timeout: 20 });

    await http.get('/echo', { credentials: undefined });
    expect(fake.calls.at(-1)!.credentials).toBe('include');

    const error = await rejection(http.get('/slow', { timeout: undefined }));
    expect(error.kind).toBe('timeout');
  });

  it('hands query objects to ofetch by default (repeated arrays)', async () => {
    const { http } = setup();
    await expect(http.get('/echo', { query: { ids: [1, 2], s: 'a b' } })).resolves.toEqual({ search: '?ids=1&ids=2&s=a+b' });
  });

  it('uses qs-style serialization when arrayFormat is set', async () => {
    const { http } = setup();
    const result = await http.get<{ search: string }>('/echo', { query: { ids: [1, 2], user: { name: 'Ana' } }, arrayFormat: 'brackets' });
    expect(decodeURIComponent(result.search)).toBe('?ids[]=1&ids[]=2&user[name]=Ana');
  });

  it('uses a custom querySerializer and appends string/URLSearchParams queries as-is', async () => {
    const { http } = setup();
    await expect(http.get('/echo', { query: { a: 1 }, querySerializer: () => 'custom=1' })).resolves.toEqual({ search: '?custom=1' });
    await expect(http.get('/echo', { query: 'x=1' })).resolves.toEqual({ search: '?x=1' });
    await expect(http.get('/echo', { query: new URLSearchParams([['y', '2']]) })).resolves.toEqual({ search: '?y=2' });
  });

  it('runs request interceptors in order and lets them mutate headers', async () => {
    const { http, calls } = setup();
    const order: Array<string> = [];
    http.addRequestInterceptor((context) => {
      order.push('first');
      context.options.headers.set('authorization', 'Bearer a');
    });
    http.addRequestInterceptor(async (context) => {
      order.push('second');
      context.options.headers.set('authorization', `${context.options.headers.get('authorization')}!`);
    });
    await http.get('/echo');
    expect(order).toEqual(['first', 'second']);
    expect(calls.at(-1)!.headers.get('authorization')).toBe('Bearer a!');
  });

  it('chains fulfilled handlers in order and removes an interceptor', async () => {
    const { http } = setup();
    http.addResponseInterceptor({
      fulfilled: (response) => ({ ...response, data: { step: 1 } }),
    });
    const remove = http.addResponseInterceptor({
      fulfilled: (response) => ({ ...response, data: { step: (response.data as { step: number }).step + 1 } }),
    });
    await expect(http.get('/env')).resolves.toEqual({ step: 2 });
    remove();
    await expect(http.get('/env')).resolves.toEqual({ step: 1 });
  });

  it('lets a rejected handler recover with a value', async () => {
    const { http } = setup();
    http.addResponseInterceptor({ rejected: () => 'fallback' });
    await expect(http.get('/boom')).resolves.toBe('fallback');
  });

  it('continues through later fulfilled handlers when a rejected handler returns an HttpResponse', async () => {
    const { http } = setup();
    http.addResponseInterceptor({ rejected: () => http.request('/env', { responseReturn: 'raw' }) });
    http.addResponseInterceptor({ fulfilled: (response) => ({ ...response, data: 'seen by later handler' }) });
    await expect(http.get('/boom')).resolves.toBe('seen by later handler');
  });

  it('rejects with kind http and the server message', async () => {
    const { http } = setup();
    const error = await rejection(http.get('/boom'));
    expect(error).toBeInstanceOf(HttpError);
    expect(error).toMatchObject({ kind: 'http', status: 500, message: 'Kaboom', data: { error: 'Kaboom' } });
    expect(error.request).toEqual({ url: '/boom', method: 'GET' });
  });

  it('rejects with kind timeout', async () => {
    const { http } = setup();
    expect((await rejection(http.get('/slow', { timeout: 20 }))).kind).toBe('timeout');
  });

  it('aborts on the caller signal even when a timeout is configured', async () => {
    const { http } = setup();
    const controller = new AbortController();
    setTimeout(() => controller.abort(), 20);
    const started = Date.now();
    const error = await rejection(http.get('/slow', { signal: controller.signal, timeout: 10_000 }));
    expect(error.kind).toBe('abort');
    expect(Date.now() - started).toBeLessThan(400);
  });

  it('classifies any abort reason as kind abort', async () => {
    const { http } = setup();
    const controller = new AbortController();
    setTimeout(() => controller.abort('navigated'), 10);
    const error = await rejection(http.get('/slow', { signal: controller.signal }));
    expect(error.kind).toBe('abort');
  });

  it('combines signals manually when AbortSignal.any is unavailable', async () => {
    const { http } = setup();
    const original = AbortSignal.any;
    // @ts-expect-error deliberately removing a global for this test only
    delete AbortSignal.any;
    try {
      const controller = new AbortController();
      setTimeout(() => controller.abort(), 20);
      const started = Date.now();
      const error = await rejection(http.get('/slow', { signal: controller.signal, timeout: 10_000 }));
      expect(error.kind).toBe('abort');
      expect(Date.now() - started).toBeLessThan(400);
    } finally {
      AbortSignal.any = original;
    }
  });

  it('classifies an unparsable response as kind http, not network', async () => {
    const { http } = setup();
    const error = await rejection(http.get('/unparsable', {
      parseResponse: () => {
        throw new Error('not JSON');
      },
    }));
    expect(error.kind).toBe('http');
    expect(error.status).toBeUndefined();
    expect(error.message).toBe('GET /unparsable returned a response that could not be parsed');
    expect(error.cause).toBeInstanceOf(Error);
  });

  it('propagates a bug in a fulfilled handler unchanged and skips the remaining handlers', async () => {
    const { http } = setup();
    const remaining = vi.fn();
    http.addResponseInterceptor({
      fulfilled: () => {
        throw new TypeError('boom');
      },
    });
    http.addResponseInterceptor({ rejected: remaining });

    const error = await http.get('/env').then(() => undefined, (error_: unknown) => error_);
    expect(error).toBeInstanceOf(TypeError);
    expect(isHttpError(error)).toBe(false);
    expect(remaining).not.toHaveBeenCalled();
  });

  it('rejects with kind network when fetch itself fails', async () => {
    const http = createHttpClient({
      baseURL: 'http://api.test',
      retry: false,
      fetch: async () => {
        throw new TypeError('fetch failed');
      },
    });
    expect((await rejection(http.get('/x'))).kind).toBe('network');
  });

  it('exposes the ofetch instance as raw', () => {
    const { http } = setup();
    expect(typeof http.raw.raw).toBe('function');
  });
});
