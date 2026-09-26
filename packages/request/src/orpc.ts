import type { NestedClient } from '@orpc/client';
import type { ClientRetryPluginContext } from '@orpc/client/plugins';
import type { AnyContractRouter, ContractRouterClient } from '@orpc/contract';
import { createORPCClient, ORPCError } from '@orpc/client';
import { RPCLink } from '@orpc/client/fetch';
import { ClientRetryPlugin } from '@orpc/client/plugins';

export type RpcFetch = (request: Request, init?: RequestInit) => Promise<Response>;
export type RpcClientContext = ClientRetryPluginContext;

/** Client type for a contract-first API: `ContractClient<typeof contract>`. */
export type ContractClient<TContract extends AnyContractRouter> = ContractRouterClient<TContract, RpcClientContext>;

type HeaderRecord = Record<string, string>;

export interface RpcClientOptions {
  /** Full RPC endpoint, e.g. `https://api.example.com/api/rpc`. */
  url: string;
  /** Override `fetch` (tests, SSR, Worker-to-Worker calls). */
  fetch?: RpcFetch;
  /** Extra headers per request, e.g. `Authorization: Bearer …`. */
  headers?: HeaderRecord | (() => HeaderRecord | Promise<HeaderRecord>);
  /** No default. Pass `'include'` for cross-origin cookie auth. */
  credentials?: RequestCredentials;
}

/**
 * Pass as `context` when consuming a stream: reconnects forever after network
 * drops and resumes from the last event id. A 5xx (proxy hiccup, Worker
 * restart) is retried too; a 4xx such as UNAUTHORIZED stops the stream.
 */
export const LIVE_RETRY: RpcClientContext = {
  retry: Number.POSITIVE_INFINITY,
  shouldRetry: ({ error }) => !(error instanceof ORPCError) || error.status >= 500,
};

export function createRpcClient<TClient extends NestedClient<RpcClientContext>>(options: RpcClientOptions): TClient {
  const baseFetch: RpcFetch = options.fetch ?? ((request, init) => globalThis.fetch(request, init));
  const { credentials } = options;

  const link = new RPCLink<RpcClientContext>({
    url: options.url,
    headers: async () => (typeof options.headers === 'function' ? await options.headers() : options.headers ?? {}),
    fetch: (request, init) => baseFetch(request, credentials ? { ...init, credentials } : init),
    plugins: [new ClientRetryPlugin()],
  });

  return createORPCClient<TClient>(link);
}

export { isDefinedError, ORPCError, safe } from '@orpc/client';
