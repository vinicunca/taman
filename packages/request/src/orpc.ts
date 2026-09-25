import type { ClientRetryPluginContext } from '@orpc/client/plugins';
import type { TamanClient } from '@vinicunca/taman-api-contract';
import { createORPCClient, ORPCError } from '@orpc/client';
import { RPCLink } from '@orpc/client/fetch';
import { ClientRetryPlugin } from '@orpc/client/plugins';

export type TamanFetch = (request: Request, init?: RequestInit) => Promise<Response>;

type HeaderRecord = Record<string, string>;

export interface TamanClientOptions {
  /** Backend origin, e.g. `https://api.example.com`. `/api/rpc` is appended. */
  baseUrl: string;
  /** Override `fetch` (tests, SSR, Worker-to-Worker calls). */
  fetch?: TamanFetch;
  /** Extra headers per request, e.g. `Authorization: Bearer …` for non-cookie clients. */
  headers?: HeaderRecord | (() => HeaderRecord | Promise<HeaderRecord>);
}

export type TamanClientContext = ClientRetryPluginContext;
export type TamanRpcClient = TamanClient<TamanClientContext>;

export const RPC_PATH = '/api/rpc';

/**
 * Pass as `context` when consuming `todo.live` (or any stream): reconnects
 * forever after network drops and resumes from the last event id. A 5xx
 * (proxy hiccup, Worker restart) is retried too, since that's transient —
 * only a 4xx server-sent error such as UNAUTHORIZED stops the stream instead
 * of hammering the API.
 */
export const LIVE_RETRY: TamanClientContext = {
  retry: Number.POSITIVE_INFINITY,
  shouldRetry: ({ error }) => !(error instanceof ORPCError) || error.status >= 500,
};

export function createTamanClient(options: TamanClientOptions): TamanRpcClient {
  const baseFetch: TamanFetch = options.fetch ?? ((request, init) => globalThis.fetch(request, init));

  const link = new RPCLink<TamanClientContext>({
    url: `${options.baseUrl.replace(/\/+$/, '')}${RPC_PATH}`,
    headers: async () => (typeof options.headers === 'function' ? await options.headers() : options.headers ?? {}),
    // Session cookies live on the backend's origin; fetch defaults to `same-origin`.
    fetch: (request, init) => baseFetch(request, { ...init, credentials: 'include' }),
    plugins: [new ClientRetryPlugin()],
  });

  return createORPCClient(link);
}

export { isDefinedError, ORPCError, safe } from '@orpc/client';
export type {
  TamanInputs,
  TamanOutputs,
  Todo,
  TodoEvent,
  TodoPage,
} from '@vinicunca/taman-api-contract';
