// @vitest-environment node
import type { TamanFetch } from './orpc';
import { implement, ORPCError } from '@orpc/server';
import { RPCHandler } from '@orpc/server/fetch';
import { contract } from '@vinicunca/taman-api-contract';
import { describe, expect, it, vi } from 'vitest';
import { createTamanClient, LIVE_RETRY } from './orpc';
import { createTamanQueryUtils } from './orpc-query';

const ID = '01920000-0000-7000-8000-000000000001';
const createdAt = new Date('2026-09-24T10:00:00.000Z');

const handler = new RPCHandler({
  todo: {
    get: implement(contract).todo.get.handler(({ input, errors }) => {
      if (input.id !== ID) {
        throw errors.NOT_FOUND();
      }
      return { id: ID, title: 'Hello', completed: false, createdBy: null, createdAt, updatedAt: createdAt };
    }),
  },
});

function inProcessFetch() {
  const calls: Array<Request> = [];
  const fetch: TamanFetch = async (request, init) => {
    const merged = new Request(request, init);
    calls.push(merged);
    const { response } = await handler.handle(merged, { prefix: '/api/rpc', context: {} });
    return response ?? new Response(null, { status: 404 });
  };
  return { calls, fetch };
}

describe('createTamanClient', () => {
  it('calls /api/rpc on the base url with credentials and custom headers', async () => {
    const { calls, fetch } = inProcessFetch();
    const client = createTamanClient({ baseUrl: 'http://api.test', fetch, headers: { 'x-app': 'demo' } });

    const todo = await client.todo.get({ id: ID });

    expect(calls[0]?.url).toBe('http://api.test/api/rpc/todo/get');
    expect(calls[0]?.credentials).toBe('include');
    expect(calls[0]?.headers.get('x-app')).toBe('demo');
    expect(todo.createdAt).toBeInstanceOf(Date);
    expect(todo.createdAt.toISOString()).toBe(createdAt.toISOString());
  });

  it('tolerates a trailing slash on the base url', async () => {
    const { calls, fetch } = inProcessFetch();
    await createTamanClient({ baseUrl: 'http://api.test/', fetch }).todo.get({ id: ID });
    expect(calls[0]?.url).toBe('http://api.test/api/rpc/todo/get');
  });

  it('surfaces contract errors as ORPCError', async () => {
    const { fetch } = inProcessFetch();
    const client = createTamanClient({ baseUrl: 'http://api.test', fetch });
    await expect(client.todo.get({ id: '01920000-0000-7000-8000-0000000000ff' }))
      .rejects
      .toMatchObject({ code: 'NOT_FOUND' });
  });
});

describe('lIVE_RETRY', () => {
  it('retries transport failures but not server-sent ORPCErrors', async () => {
    const shouldRetry = LIVE_RETRY.shouldRetry as (options: { error: unknown }) => boolean;
    expect(LIVE_RETRY.retry).toBe(Number.POSITIVE_INFINITY);
    expect(shouldRetry({ error: new TypeError('Failed to fetch') })).toBe(true);
    expect(shouldRetry({ error: new ORPCError('UNAUTHORIZED') })).toBe(false);
  });
});

describe('createTamanQueryUtils', () => {
  it('roots every key path at "taman"', () => {
    const utils = createTamanQueryUtils(createTamanClient({ baseUrl: 'http://api.test', fetch: vi.fn() }));
    expect(utils.todo.key()[0]).toEqual(['taman', 'todo']);
    expect(utils.todo.get.queryKey({ input: { id: ID } })[0]).toEqual(['taman', 'todo', 'get']);
  });
});
