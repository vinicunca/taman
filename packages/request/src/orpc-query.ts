import type { NestedClient } from '@orpc/client';
import type { RouterUtils } from '@orpc/tanstack-query';
import { createTanstackQueryUtils } from '@orpc/tanstack-query';

export interface RpcQueryUtilsOptions {
  /** Root of every query key, e.g. `['taman']`. Default: none. */
  path?: Array<string>;
}

/**
 * TanStack Query helpers (`queryOptions`, `mutationOptions`,
 * `experimental_liveOptions`, `key()` …) for any TanStack framework adapter.
 */
export function createRpcQueryUtils<TClient extends NestedClient<any>>(
  client: TClient,
  options: RpcQueryUtilsOptions = {},
): RouterUtils<TClient> {
  return createTanstackQueryUtils(client, options.path ? { path: options.path } : undefined);
}
