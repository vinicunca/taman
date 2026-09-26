// @vitest-environment node
import type { ContractClient, RpcFetch } from './orpc';
import { oc } from '@orpc/contract';
import { implement, ORPCError } from '@orpc/server';
import { RPCHandler } from '@orpc/server/fetch';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { createRpcClient, LIVE_RETRY } from './orpc';
import { createRpcQueryUtils } from './orpc-query';

const contract = {
  todo: {
    get: oc
      .errors({ NOT_FOUND: {} })
      .input(z.object({ id: z.string() }))
      .output(z.object({ id: z.string(), createdAt: z.date() })),
  },
};
type Client = ContractClient<typeof contract>;

const createdAt = new Date('2026-09-25T10:00:00.000Z');
const handler = new RPCHandler({
  todo: {
    get: implement(contract).todo.get.handler(({ input, errors }) => {
      if (input.id !== '1') {
        throw errors.NOT_FOUND();
      }
      return { id: '1', createdAt };
    }),
  },
});

function inProcessFetch() {
  const calls: Array<Request> = [];
  const fetch: RpcFetch = async (request, init) => {
    const merged = new Request(request, init);
    calls.push(merged);
    const { response } = await handler.handle(merged, { prefix: '/rpc', context: {} });
    return response ?? new Response(null, { status: 404 });
  };
  return { calls, fetch };
}

describe('createRpcClient', () => {
  it('calls the given url and keeps Dates as Dates', async () => {
    const { calls, fetch } = inProcessFetch();
    const client = createRpcClient<Client>({ url: 'http://api.test/rpc', fetch, headers: { 'x-app': 'demo' } });

    const todo = await client.todo.get({ id: '1' });

    expect(calls[0]?.url).toBe('http://api.test/rpc/todo/get');
    expect(calls[0]?.headers.get('x-app')).toBe('demo');
    expect(todo.createdAt).toBeInstanceOf(Date);
  });

  it('only sends credentials when configured', async () => {
    const plain = inProcessFetch();
    await createRpcClient<Client>({ url: 'http://api.test/rpc', fetch: plain.fetch }).todo.get({ id: '1' });
    expect(plain.calls[0]?.credentials).not.toBe('include');

    const withCookies = inProcessFetch();
    await createRpcClient<Client>({ url: 'http://api.test/rpc', fetch: withCookies.fetch, credentials: 'include' }).todo.get({ id: '1' });
    expect(withCookies.calls[0]?.credentials).toBe('include');
  });

  it('surfaces contract errors as ORPCError', async () => {
    const { fetch } = inProcessFetch();
    await expect(createRpcClient<Client>({ url: 'http://api.test/rpc', fetch }).todo.get({ id: 'nope' }))
      .rejects
      .toMatchObject({ code: 'NOT_FOUND' });
  });
});

describe('live retry policy', () => {
  const shouldRetry = LIVE_RETRY.shouldRetry as (options: { error: unknown }) => boolean;

  it('retries forever on transport failures and 5xx, stops on 4xx', () => {
    expect(LIVE_RETRY.retry).toBe(Number.POSITIVE_INFINITY);
    expect(shouldRetry({ error: new TypeError('Failed to fetch') })).toBe(true);
    expect(shouldRetry({ error: new ORPCError('SERVICE_UNAVAILABLE', { status: 503 }) })).toBe(true);
    expect(shouldRetry({ error: new ORPCError('UNAUTHORIZED') })).toBe(false);
  });
});

describe('createRpcQueryUtils', () => {
  const client = createRpcClient<Client>({ url: 'http://api.test/rpc', fetch: inProcessFetch().fetch });

  it('roots keys at the given path', () => {
    const utils = createRpcQueryUtils(client, { path: ['taman'] });
    expect(utils.todo.key()[0]).toEqual(['taman', 'todo']);
  });

  it('leaves keys unprefixed by default', () => {
    expect(createRpcQueryUtils(client).todo.key()[0]).toEqual(['todo']);
  });
});
