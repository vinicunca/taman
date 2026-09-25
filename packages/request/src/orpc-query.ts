import type { TamanRpcClient } from './orpc';
import { createTanstackQueryUtils } from '@orpc/tanstack-query';

/**
 * TanStack Query helpers (`queryOptions`, `mutationOptions`,
 * `experimental_liveOptions`, `key()` …) for any TanStack framework adapter.
 * Every key's path starts with `'taman'`
 * so they never collide with the host app's own queries.
 */
export function createTamanQueryUtils(client: TamanRpcClient) {
  return createTanstackQueryUtils(client, { path: ['taman'] });
}

export type TamanQueryUtils = ReturnType<typeof createTamanQueryUtils>;
