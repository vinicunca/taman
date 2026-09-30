import type { ContractClient } from '@vinicunca/request/orpc';
import type { TamanContract } from '@taman/api-contract';
import { createRpcClient } from '@vinicunca/request/orpc';
import { createRpcQueryUtils } from '@vinicunca/request/orpc-query';
import { useAppTamanConfig } from '@taman/composables';

const { apiUrl } = useAppTamanConfig(
  import.meta.env,
  import.meta.env.PROD,
);

export type TamanRpcClient = ContractClient<TamanContract>;

/** Plain oRPC client — `await client.todo.list(...)`. Session cookies ride along. */
export const client = createRpcClient<TamanRpcClient>({
  url: `${apiUrl.replace(/\/+$/, '')}/api/rpc`,
  credentials: 'include',
});

/** vue-query helpers — `useQuery(orpc.todo.list.queryOptions(...))`. */
export const orpc = createRpcQueryUtils(client, { path: ['taman'] });

export type TamanQueryUtils = typeof orpc;
