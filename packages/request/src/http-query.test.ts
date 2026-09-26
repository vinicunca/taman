// @vitest-environment node
import type { HttpError } from './http/errors';
import { QueryClient, QueryObserver } from '@tanstack/query-core';
import { describe, expect, expectTypeOf, it } from 'vitest';
import { createHttpQueryUtils } from './http-query';
import { createHttpClient } from './http/client';
import { isHttpError } from './http/errors';
import { createFakeFetch, respondAfter } from './http/testing';

function setup() {
  const network = { aborted: false };
  const fake = createFakeFetch({
    '/items': (request) => Response.json({ search: new URL(request.url).search }),
    '/items/5': () => new Response(null, { status: 204 }),
    '/slow': (request) => {
      request.signal.addEventListener('abort', () => {
        network.aborted = true;
      });
      return respondAfter(request, 500);
    },
  });
  const http = createHttpClient({ baseURL: 'http://api.test', fetch: fake.fetch, retry: false, credentials: 'include' });
  return { api: createHttpQueryUtils(http, { key: ['ext'] }), calls: fake.calls, client: new QueryClient(), network };
}

describe('createHttpQueryUtils', () => {
  it('builds keys rooted at the given key', () => {
    const { api } = setup();
    expect(api.key()).toEqual(['ext']);
    expect(api.key('/items')).toEqual(['ext', 'GET', '/items']);
    expect(api.get('/items').key()).toEqual(['ext', 'GET', '/items']);
    expect(createHttpQueryUtils(createHttpClient()).key()).toEqual([]);
  });

  it('puts the query into the key, passes TanStack options through and fetches with the query', async () => {
    const { api, client } = setup();
    const options = api.get<{ search: string }>('/items').queryOptions({ query: { page: 2 }, staleTime: 1000 });
    expect(options.queryKey).toEqual(['ext', 'GET', '/items', { query: { page: 2 } }]);
    expect(options).toMatchObject({ staleTime: 1000 });
    expect(options).not.toHaveProperty('query');
    await expect(client.fetchQuery(options)).resolves.toEqual({ search: '?page=2' });
  });

  it('normalizes URLSearchParams queries in the key', () => {
    const { api } = setup();
    expect(api.get('/items').queryOptions({ query: new URLSearchParams('a=1') }).queryKey)
      .toEqual(['ext', 'GET', '/items', { query: 'a=1' }]);
  });

  it('does not forward an explicit undefined request option, so the client default still applies', async () => {
    const { api, client, calls } = setup();
    await client.fetchQuery(api.get('/items').queryOptions({ credentials: undefined }));
    expect(calls.at(-1)!.credentials).toBe('include');
  });

  it('types the query error as HttpError', () => {
    const { api, client } = setup();
    const options = api.get<{ search: string }>('/items').queryOptions();
    const observer = new QueryObserver(client, options);
    expectTypeOf(observer.getCurrentResult().error).toEqualTypeOf<HttpError | null>();
    observer.destroy();
  });

  it('aborts the network request when the query is cancelled', async () => {
    const { api, client, network } = setup();
    const pending = client.fetchQuery(api.get('/slow').queryOptions()).catch((error: unknown) => error);
    await new Promise((resolve) => {
      setTimeout(resolve, 20);
    });
    await client.cancelQueries({ queryKey: api.key() });
    const error = await pending;
    expect(isHttpError(error)).toBe(false);
    expect((error as { constructor: { name: string } }).constructor.name).toBe('CancelledError');
    expect(network.aborted).toBe(true);
  });

  it('maps mutation variables to the path and body', async () => {
    const { api, calls } = setup();
    const create = api.post<unknown, { title: string }>('/items').mutationOptions();
    const remove = api.delete<unknown, { id: number }>((variables) => `/items/${variables.id}`)
      .mutationOptions({ body: () => undefined });

    expect(create.mutationKey).toEqual(['ext', 'POST', '/items']);
    expect(remove.mutationKey).toEqual(['ext', 'DELETE']);

    await create.mutationFn!({ title: 'x' }, {} as never);
    await remove.mutationFn!({ id: 5 }, {} as never);
    expect(calls.map((call) => [call.method, call.path, call.body])).toEqual([
      ['POST', '/items', '{"title":"x"}'],
      ['DELETE', '/items/5', ''],
    ]);
  });
});
