# @vinicunca/taman-request

Typed clients for the Taman API, generated from `@vinicunca/taman-api-contract`.

```sh
pnpm add @vinicunca/taman-request
# for the TanStack Query helpers, also your adapter, e.g.
pnpm add @tanstack/vue-query
```

## Plain client

```ts
import { createTamanClient, isDefinedError, safe } from '@vinicunca/taman-request/orpc';

const client = createTamanClient({ baseUrl: 'https://api.example.com' });

const page = await client.todo.list({ page: 1, pageSize: 20, search: 'milk' });
const [error, todo] = await safe(client.todo.get({ id }));
if (isDefinedError(error) && error.code === 'NOT_FOUND') { /* … */ }
```

## TanStack Query

```ts
import { createTamanQueryUtils } from '@vinicunca/taman-request/orpc-query';

const orpc = createTamanQueryUtils(client);
useQuery(orpc.todo.list.queryOptions({ input: { page: 1 } }));
useMutation(orpc.todo.create.mutationOptions());
queryClient.invalidateQueries({ queryKey: orpc.todo.key() });
```

## Realtime

```ts
import { LIVE_RETRY } from '@vinicunca/taman-request/orpc';

for await (const event of await client.todo.live(undefined, { signal, context: LIVE_RETRY })) {
  // { type: 'created' | 'updated', todo } | { type: 'removed', id }
}
```

Authentication uses the backend's session cookie (`credentials: 'include'`).
Pass `headers` to send a bearer token instead.
