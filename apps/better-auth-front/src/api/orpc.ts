import { useAppTamanConfig } from '@taman/composables';
import { createTamanClient } from '@vinicunca/taman-request/orpc';
import { createTamanQueryUtils } from '@vinicunca/taman-request/orpc-query';

const { apiUrl } = useAppTamanConfig(
  import.meta.env,
  import.meta.env.PROD,
);

/** Plain oRPC client — `await client.todo.list(...)`. */
export const client = createTamanClient({ baseUrl: apiUrl });

/** vue-query helpers — `useQuery(orpc.todo.list.queryOptions(...))`. */
export const orpc = createTamanQueryUtils(client);
