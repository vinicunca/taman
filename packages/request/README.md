# @vinicunca/request

Generic, typed request clients:

| Entry | What it is |
|---|---|
| `@vinicunca/request/orpc` | a typed [oRPC](https://orpc.dev) client for any contract or router |
| `@vinicunca/request/orpc-query` | TanStack Query utils for that client |
| `@vinicunca/request/http` | a REST client on [ofetch](https://github.com/unjs/ofetch) with an interceptor chain and presets |
| `@vinicunca/request/http-query` | TanStack Query options builders for the REST client |

```sh
pnpm add @vinicunca/request
pnpm add ofetch                 # for ./http and ./http-query
pnpm add @tanstack/vue-query    # (or any TanStack adapter) for the *-query entries
```

Nothing is sent with cookies unless you pass `credentials: 'include'`.

## oRPC

```ts
import type { MyContract } from 'my-api-contract';
import { createRpcClient, isDefinedError, safe, type ContractClient } from '@vinicunca/request/orpc';
import { createRpcQueryUtils } from '@vinicunca/request/orpc-query';

export const client = createRpcClient<ContractClient<MyContract>>({
  url: 'https://api.example.com/api/rpc',
  credentials: 'include',                    // cross-origin cookie auth
  headers: async () => ({ 'x-app': 'web' }), // or a bearer token
});
export const orpc = createRpcQueryUtils(client, { path: ['my-api'] });

const [error, todo] = await safe(client.todo.get({ id }));
if (isDefinedError(error) && error.code === 'NOT_FOUND') { /* … */ }

useQuery(orpc.todo.list.queryOptions({ input: { page: 1 } }));
```

For router-inferred APIs pass the router client type instead:
`createRpcClient<RouterClient<typeof router, RpcClientContext>>(…)`.

Streams: pass `context: LIVE_RETRY` to reconnect after network drops or 5xx
and resume from the last event id (a 4xx stops the stream).

With `skipLibCheck: false`, also install `@opentelemetry/api` (types only;
oRPC's shared types reference it).

## HTTP

```ts
import {
  createHttpClient,
  envelopeInterceptor,
  errorMessageInterceptor,
  refreshTokenInterceptor,
} from '@vinicunca/request/http';

export const http = createHttpClient({
  baseURL: 'https://api.example.com',
  timeout: 10_000,         // default; combined with any signal you pass
  responseReturn: 'data',  // 'raw' | 'body' (default) | 'data'
});

http.addRequestInterceptor((context) => {
  context.options.headers.set('Authorization', `Bearer ${store.accessToken}`);
});
http.addResponseInterceptor(envelopeInterceptor({ codeField: 'code', dataField: 'data', successCode: 0 }));
http.addResponseInterceptor(refreshTokenInterceptor({
  client: http,
  refresh: () => refreshAccessToken(),          // returns the new token
  applyToken: (context, token) => context.options.headers.set('Authorization', `Bearer ${token}`),
  onAuthFailure: () => logout(),
}));
http.addResponseInterceptor(errorMessageInterceptor({
  notify: (message) => toast.error(message),
  messages: { default: t('errors.default') },   // override any English default
}));

const users = await http.get<User[]>('/users', { query: { page: 1 } });
await http.post('/users', { name: 'Ana' });
```

- **Install presets in this order:** envelope → refresh token → error message,
  so only errors nobody recovered from show a message.
- **`responseReturn`:** `raw` returns `{ status, headers, data, request, response }`;
  `body` returns the parsed body; `data` returns the envelope's payload (with
  `envelopeInterceptor`), throwing `HttpError{ kind: 'envelope' }` on a bad code.
- **Errors:** every request rejects with `HttpError` (`kind`: `network`,
  `timeout`, `abort`, `http`, `envelope`; plus `status`, `code`, `data`, `request`).
- **Interceptors:** request interceptors may mutate `context.options`;
  response interceptors are a promise chain — `fulfilled` may transform,
  `rejected` may recover by returning a value (or an `HttpResponse`).
  Both `add*` functions return a remover.
- **Token refresh:** concurrent 401s share one `refresh()`; each request is
  retried once; a second 401, a failed refresh or `enabled: false` calls
  `onAuthFailure` and rejects.
- **TypeScript:** with `skipLibCheck: false`, also install `undici` and
  `@types/node` (types only; ofetch's type declarations import `undici`,
  whose own types need `@types/node`).

### Query strings

`query` is handed to ofetch by default (ufo): flat values and repeated
arrays (`ids=1&ids=2`). Nested objects become JSON there and Dates are
quoted, so for qs-style APIs set `arrayFormat`:

| `arrayFormat` | `{ ids: [1, 2], user: { name: 'Ana' } }` |
|---|---|
| `repeat` | `ids=1&ids=2&user[name]=Ana` |
| `brackets` | `ids[]=1&ids[]=2&user[name]=Ana` |
| `indices` | `ids[0]=1&ids[1]=2&user[name]=Ana` |
| `comma` | `ids=1,2&user[name]=Ana` |

Arrays of objects always use indices (`items[0][n]=a`), Dates are ISO
strings, `null` is `key=`, `undefined` is omitted. Values are encoded by
`URLSearchParams` (spaces as `+`, brackets as `%5B%5D`). Use
`querySerializer: (query) => string` for anything else; a string or
`URLSearchParams` query is used as-is.

Uploads: `body: formData`. Downloads: `responseType: 'blob'`. For anything
else, `http.raw` is the configured ofetch instance.

## HTTP + TanStack Query

```ts
import { createHttpQueryUtils } from '@vinicunca/request/http-query';

const api = createHttpQueryUtils(http, { key: ['my-api'] });

const products = useQuery(computed(() => api.get<ProductPage>('/products').queryOptions({
  query: { page: page.value },
  placeholderData: keepPreviousData,
  select: (result) => result.items,
})));

const create = useMutation(api.post<Product, NewProduct>('/products').mutationOptions({
  onSuccess: () => queryClient.invalidateQueries({ queryKey: api.get('/products').key() }),
}));

api.delete<void, { id: number }>((variables) => `/products/${variables.id}`)
  .mutationOptions({ body: () => undefined });
```

- Keys: `[...key, 'GET', path, { query }]`; `api.key()` and
  `api.get(path).key()` match everything / every query of a path.
- Request options (`query`, `headers`, `credentials`, `timeout`,
  `responseReturn`, `responseType`, `arrayFormat`, `querySerializer`,
  `parseResponse`) and TanStack options share one object. `retry`,
  `retryDelay` and `meta` belong to TanStack here; set HTTP retries on the client.
- Cancelled or superseded queries abort the underlying fetch.
