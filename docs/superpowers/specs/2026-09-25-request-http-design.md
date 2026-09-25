# `@vinicunca/request`: generic oRPC clients + ofetch HTTP client — design

- **Date:** 2026-09-25
- **Status:** Approved in conversation; pending written-spec review
- **Base:** `feature/v1` @ `9bd9b52` (package already renamed to `@vinicunca/request` at `packages/request`)

## 1. Goal

Make `@vinicunca/request` a generic, publishable request library with four
entry points and no Taman coupling:

| Entry | Purpose |
|---|---|
| `./orpc` | typed oRPC client for any contract or router (made generic) |
| `./orpc-query` | TanStack Query utils for that client (made generic) |
| `./http` | **new** vben-style `RequestClient` for non-RPC HTTP (external / legacy REST), built on ofetch |
| `./http-query` | **new** TanStack Query options builder for the HTTP client |

Success means:

1. The package imports nothing from `@vinicunca/taman-api-contract` (or any
   `@taman/*`), Vue, Pinia or app code.
2. The Taman frontend keeps working with two-line oRPC setup and uses `./http`
   + `./http-query` for one real external API example.
3. The HTTP client reproduces the useful parts of vben's `@vben/request`
   (methods, interceptor chain, `responseReturn`, envelope unwrap, token
   refresh, error messages) with injected app behavior.
4. `pnpm check:api-packages` passes: publint, attw, and a type-checked
   consumer outside the workspace that imports all four entries.

## 2. Decisions

| Topic | Decision | Reason |
|---|---|---|
| Placement | `./http` + `./http-query` subpaths of `@vinicunca/request` | Chosen by the user (option B); one package for all request concerns. |
| Contract coupling | Removed. Consumers pass the client type as a type parameter | The runtime client never needs the contract; only types do. |
| `credentials` | No default in either client | A generic library must not send cookies unless asked. |
| Transport | ofetch (`ofetch.raw`), **optional peer** | Consumers of only `./orpc` never install it. |
| Interceptors | Own promise chain around `ofetch.raw`, not ofetch hooks | ofetch hooks can't transform the return value or recover from errors; vben's envelope unwrap and token refresh need both. |
| Query strings | Default: pass `query` to ofetch (ufo). Opt-in `arrayFormat` → own `URLSearchParams` flattener with qs-style nesting. Escape hatch `querySerializer` | ufo covers flat params + repeated arrays for free; it JSON-encodes nested objects and quotes Dates, so qs-style output is opt-in. |
| Token refresh | Single-flight shared promise; each request retried once | Same effect as vben's `isRefreshing` + queue with less state. |
| i18n | English default messages, overridable via `messages` | No locale dependency in the package. |
| Upload / download / SSE helpers | Not provided | `body: FormData`, `responseType: 'blob'` and `./orpc` streams (or `http.raw`) cover them. |
| Query-builder API | Framework-agnostic options builders (like `./orpc-query`); Vue reactivity via `computed(() => …)` in the app | Works with every TanStack adapter; no Vue code in the package. |
| Infinite queries | Not in v1 of `./http-query` | Offset paging + `keepPreviousData` covers the example. |

## 3. `./orpc` and `./orpc-query` (made generic)

```ts
// ./orpc
export type RpcFetch = (request: Request, init?: RequestInit) => Promise<Response>;
export type RpcClientContext = ClientRetryPluginContext;
export type ContractClient<TContract extends AnyContractRouter> =
  ContractRouterClient<TContract, RpcClientContext>;

export interface RpcClientOptions {
  url: string;                                   // full endpoint, e.g. `${apiUrl}/api/rpc`
  fetch?: RpcFetch;
  headers?: Record<string, string> | (() => Record<string, string> | Promise<Record<string, string>>);
  credentials?: RequestCredentials;              // no default
}

export function createRpcClient<TClient extends NestedClient<RpcClientContext>>(
  options: RpcClientOptions,
): TClient;

export const LIVE_RETRY: RpcClientContext;       // unchanged behavior (retry network + 5xx, stop on 4xx)
export { isDefinedError, ORPCError, safe } from '@orpc/client';
```

```ts
// ./orpc-query
export function createRpcQueryUtils<TClient extends NestedClient<any>>(
  client: TClient,
  options?: { path?: string[] },                 // key root; default none
): RouterUtils<TClient>;
```

- Removed: `createTamanClient`, `createTamanQueryUtils`, `TamanFetch`,
  `TamanClientOptions`, `TamanClientContext`, `TamanRpcClient`,
  `TamanQueryUtils`, `RPC_PATH`, and the re-exports of `TamanInputs`,
  `TamanOutputs`, `Todo`, `TodoEvent`, `TodoPage` (import those from
  `@vinicunca/taman-api-contract`).
- `createRpcClient` builds `RPCLink({ url, headers, fetch, plugins: [new ClientRetryPlugin()] })`;
  when `credentials` is set, the fetch wrapper applies it.
- Dependencies: `@orpc/client`, `@orpc/contract` (types), `@orpc/tanstack-query`.

## 4. `./http` — the HTTP client

### 4.1 Construction and methods

```ts
export function createHttpClient(options?: HttpClientOptions): HttpClient;

export interface HttpClientOptions {
  baseURL?: string;
  headers?: HeadersInit;
  credentials?: RequestCredentials;              // no default
  timeout?: number;                              // default 10_000 ms
  retry?: number | false;                        // passed to ofetch (idempotent methods)
  retryDelay?: number;
  retryStatusCodes?: number[];
  responseReturn?: ResponseReturn;               // default 'body'
  arrayFormat?: ArrayFormat;                     // unset → ofetch/ufo query handling
  querySerializer?: (query: Record<string, unknown>) => string;
  parseResponse?: (text: string) => unknown;     // e.g. JSON-bigint parse
  fetch?: typeof globalThis.fetch;               // injectable (tests, SSR, Workers)
}

export type ResponseReturn = 'raw' | 'body' | 'data';
export type ArrayFormat = 'repeat' | 'brackets' | 'indices' | 'comma';

export interface HttpRequestOptions extends Omit<HttpClientOptions, 'baseURL' | 'fetch'> {
  method?: HttpMethod;
  query?: Record<string, unknown> | URLSearchParams | string;
  body?: unknown;                                // objects → JSON; FormData/Blob/string as-is
  responseType?: 'json' | 'text' | 'blob' | 'arrayBuffer' | 'stream';
  signal?: AbortSignal;
}

export interface HttpClient {
  request: <T = unknown>(url: string, options?: HttpRequestOptions) => Promise<T>;
  get: <T = unknown>(url: string, options?: HttpRequestOptions) => Promise<T>;
  delete: <T = unknown>(url: string, options?: HttpRequestOptions) => Promise<T>;
  post: <T = unknown>(url: string, body?: unknown, options?: HttpRequestOptions) => Promise<T>;
  put: <T = unknown>(url: string, body?: unknown, options?: HttpRequestOptions) => Promise<T>;
  patch: <T = unknown>(url: string, body?: unknown, options?: HttpRequestOptions) => Promise<T>;
  addRequestInterceptor: (interceptor: RequestInterceptor) => () => void;
  addResponseInterceptor: (interceptor: ResponseInterceptor) => () => void;
  readonly raw: $Fetch;                          // the configured ofetch instance
}
```

- Per-request options override client options (headers merge; others replace).
- The client owns the timeout (`AbortSignal.any([signal, AbortSignal.timeout(timeout)])`) instead of
  passing `timeout` to ofetch, because ofetch ignores its own `timeout` whenever a `signal` is given
  (and `./http-query` always passes TanStack's signal). `timeout: 0` disables it.
- Return value by `responseReturn`: `raw` → `HttpResponse`; `body` and
  `data` → `HttpResponse.data` (after interceptors; the envelope preset makes
  `data` the unwrapped payload).

### 4.2 Interceptor model

```ts
export interface HttpRequestContext {
  url: string;
  options: HttpRequestOptions & { method: HttpMethod; headers: Headers };
}
export type RequestInterceptor = (ctx: HttpRequestContext) => void | Promise<void>;

export interface HttpResponse<T = unknown> {
  status: number;
  headers: Headers;
  data: T;
  request: HttpRequestContext;
  response: Response;
}
export interface ResponseInterceptor {
  fulfilled?: (response: HttpResponse) => HttpResponse | Promise<HttpResponse>;
  rejected?: (error: HttpError) => unknown;      // return a value/HttpResponse to recover, or throw
}
```

Request pipeline for `client.request(url, options)`:

1. Merge client + request options into an `HttpRequestContext`
   (`headers` normalized to a `Headers` instance).
2. Run request interceptors in insertion order (each may mutate `ctx`).
3. Build the query: if `arrayFormat` or `querySerializer` is set, serialize
   `query` into a string and append it to the URL; otherwise pass `query` to
   ofetch unchanged.
4. Call `ofetch.raw(url, { … })`; wrap the outcome as `HttpResponse` or
   `HttpError` (§4.4).
5. Run response interceptors as a promise chain in insertion order: a
   fulfilled response flows through each `fulfilled`; an error flows through
   each `rejected` until one returns (recovers — a returned `HttpResponse`
   continues through the remaining `fulfilled` handlers; any other value is
   treated as the final `data`) or all rethrow.
6. Apply `responseReturn`.

Interceptors are removable via the returned unsubscribe function.

### 4.3 Query serializer (`query.ts`, used only when opted in)

Flatten to bracket-path pairs, then `URLSearchParams.append`:

| Input | Output |
|---|---|
| `{ a: 1, b: 'x' }` | `a=1&b=x` |
| `{ user: { name: 'Ana', role: { id: 2 } } }` | `user[name]=Ana&user[role][id]=2` |
| `{ ids: [1, 2] }` | `repeat` `ids=1&ids=2` · `brackets` `ids[]=1&ids[]=2` · `indices` `ids[0]=1&ids[1]=2` · `comma` `ids=1,2` |
| `{ items: [{ n: 'a' }] }` | always indices: `items[0][n]=a` |
| `Date` | `toISOString()` |
| boolean / number | `String(value)` |
| `undefined` | key omitted |
| `null` | `key=` |
| `URLSearchParams` or string as `query` | used as-is |

`URLSearchParams` encodes spaces as `+` and brackets as `%5B%5D`
(documented in the README).

### 4.4 Errors

```ts
export class HttpError extends Error {
  readonly kind: 'network' | 'timeout' | 'abort' | 'http' | 'envelope';
  readonly status?: number;
  readonly code?: unknown;
  readonly data?: unknown;
  readonly request: { url: string; method: string };
  readonly context?: HttpRequestContext;          // full request context, used to re-issue (token refresh)
  readonly response?: Response;
  readonly cause?: unknown;
}
export function isHttpError(error: unknown): error is HttpError;
```

Mapping from the ofetch/fetch outcome:

- `FetchError` with a `response` → `kind: 'http'`, `status`, `data` (parsed body), `response`.
- Error name `TimeoutError` (timeout signal) → `kind: 'timeout'`.
- Error name `AbortError` → `kind: 'abort'`.
- Any other failure before a response (e.g. `TypeError: fetch failed`) → `kind: 'network'`.
- Envelope code mismatch (§4.5.1) → `kind: 'envelope'`, `status` = the 2xx, `code`, `data` = the envelope.

`message` is the server-provided message when present
(`data.message ?? data.error`), else a short English description.

### 4.5 Presets

All are plain factories returning `ResponseInterceptor`; install order
envelope → refresh token → error message.

#### 4.5.1 `envelopeInterceptor(options?)`

```ts
envelopeInterceptor({
  codeField?: string;                               // default 'code'
  dataField?: string | ((body: any) => unknown);    // default 'data'
  successCode?: unknown | ((code: unknown) => boolean); // default 0
})
```

Acts only when the request's `responseReturn` is `'data'`. An empty body
(`204`, or no content) resolves to `undefined` without a code check. Success →
`response.data = body[dataField]` (or `dataField(body)`); mismatch → throws
`HttpError{ kind: 'envelope' }`. `raw` and `body` requests pass through.

#### 4.5.2 `refreshTokenInterceptor(options)`

```ts
refreshTokenInterceptor({
  client: HttpClient;
  refresh: () => Promise<string>;                    // returns the new token
  applyToken: (ctx: HttpRequestContext, token: string) => void;
  onAuthFailure: (error: HttpError) => void | Promise<void>;
  enabled?: boolean | (() => boolean);              // default true
  isUnauthorized?: (error: HttpError) => boolean;   // default: status === 401
})
```

- Non-matching errors are rethrown untouched.
- Refresh disabled → `await onAuthFailure(error)`, rethrow.
- Request already retried once (marker on the request context) →
  `onAuthFailure`, rethrow (no loop).
- Otherwise await the shared in-flight refresh promise (created on first
  401, cleared when settled), `applyToken(ctx, token)`, and re-issue the
  request through `client.request` with the same options and `responseReturn`.
- `refresh` throws → `onAuthFailure(error)` once for that refresh, every
  waiting request rejects with the original `HttpError`.

#### 4.5.3 `errorMessageInterceptor(options)`

```ts
errorMessageInterceptor({
  notify: (message: string, error: HttpError) => void;
  messages?: Partial<Record<'network' | 'timeout' | 400 | 401 | 403 | 404 | 408 | 'default', string>>;
  preferServerMessage?: boolean;                    // default true
})
```

Skips `kind: 'abort'`. Message selection: server message (if
`preferServerMessage` and present) → `messages[kind]` for network/timeout →
`messages[status]` → `messages.default`. English defaults for every key.
Always rethrows after notifying.

## 5. `./http-query` — TanStack Query options builder

> Amended during planning (2026-09-25): a path builder
> (`api.get<TData>(path).queryOptions(options)`) replaces
> `queryOptions<TData>(path, options)`. With `TData` given explicitly,
> TypeScript cannot also infer the TanStack options, so `select` loses its
> contextual type; fixing `TData` on the builder first (as oRPC's utils do
> with the procedure) restores full inference and vue-query compatibility.
> Verified against `@tanstack/vue-query` 5.103 `useQuery(computed(() => …))`.

```ts
export function createHttpQueryUtils(
  client: HttpClient,
  options?: { key?: readonly unknown[] },          // key root; default []
): HttpQueryUtils;

export interface HttpQueryUtils {
  key: (path?: string) => QueryKey;                // [...root] or [...root, 'GET', path]
  get: <TData = unknown>(path: string) => HttpQueryEndpoint<TData>;
  post / put / patch / delete: <TData = unknown, TVariables = void>(
    path: string | ((variables: TVariables) => string),
  ) => HttpMutationEndpoint<TData, TVariables>;
}

export interface HttpQueryEndpoint<TData> {
  key: () => QueryKey;                             // [...root, 'GET', path]
  queryOptions: <U, TSelected = TData>(options?: U & HttpQueryOptionsIn<TData, TSelected>)
    => Omit<U, RequestOptionKey> & { queryKey; queryFn; enabled?: boolean };
}                                                  // queryKey: [...root, 'GET', path, { query }]

export interface HttpMutationEndpoint<TData, TVariables> {
  key: () => QueryKey;                             // [...root, METHOD, path-if-string]
  mutationOptions: <TContext = unknown>(options?: HttpMutationOptionsIn<TData, TVariables, TContext>)
    => MutationObserverOptions<TData, HttpError, TVariables, TContext>;
}                                                  // options.body?: (variables) => unknown; default: variables are the body
```

- Request options forwarded to the client: `query`, `headers`, `credentials`,
  `timeout`, `responseReturn`, `responseType`, `arrayFormat`,
  `querySerializer`, `parseResponse`. Everything else is a TanStack option.
  `retry`, `retryDelay` and `meta` exist on both sides and belong to TanStack
  here; HTTP-level retries are configured on the client.
- `queryFn` forwards TanStack's `signal`, so cancelled or superseded queries
  abort the fetch (`HttpError{ kind: 'abort' }`).
- `URLSearchParams` queries are normalized to strings in the key.
- Types come from `@tanstack/query-core` (optional peer); results are plain
  options objects usable with `@tanstack/vue-query` (`useQuery(computed(() => …))`).

Usage:

```ts
const dummy = createHttpQueryUtils(http, { key: ['dummyjson'] });
useQuery(computed(() => dummy.get<ProductPage>('/products').queryOptions({
  query: { limit: 10, skip },
  placeholderData: keepPreviousData,
  select: (page) => page.products,
})));
useMutation(dummy.post<User, NewUser>('/users/add').mutationOptions({
  onSuccess: () => queryClient.invalidateQueries({ queryKey: dummy.get('/users').key() }),
}));
```

## 6. Package metadata

- `packages/request/package.json`:
  - `exports`: `./orpc`, `./orpc-query`, `./http`, `./http-query` → `src/*.ts`
    (`src/http/index.ts`, `src/http-query.ts`); `publishConfig.exports` → the
    matching `dist/*.mjs` / `*.d.mts`.
  - `dependencies`: `@orpc/client`, `@orpc/contract`, `@orpc/tanstack-query`.
  - `peerDependencies` (both optional): `@tanstack/query-core >=5.80.2`,
    `ofetch` (range confirmed against the installed 1.5.x during implementation).
  - `repository.directory: packages/request`; description without Taman.
- `tsdown.config.ts` entries: `src/orpc.ts`, `src/orpc-query.ts`,
  `src/http/index.ts` (published as `http`), `src/http-query.ts`.
- README: sections per entry, including the vben-equivalent setup and the
  query-string / encoding notes.
- `scripts/release/check-api-packages.sh`: consumer imports all four entries
  (installs `ofetch` and `@tanstack/query-core`); `PACKAGES` points to
  `packages/request` (currently still `packages/effects/request`).
- Root `package.json` `release:api`: bump `packages/request/package.json`
  (currently `packages/effects/request/package.json`) and publish-filter
  `@vinicunca/request`.

## 7. Taman app adoption

- `apps/better-auth-front/src/api/orpc.ts`:
  `createRpcClient<ContractClient<TamanContract>>({ url: \`${apiUrl}/api/rpc\`, credentials: 'include' })`
  and `createRpcQueryUtils(client, { path: ['taman'] })`.
- Other call sites updated: `apps/better-auth-back/server/rpc/round-trip.test.ts`,
  `apps/better-auth-front/src/views/examples/orpc/query/apply-todo-event.test.ts`,
  and every import of the removed Taman type re-exports.
- New `apps/better-auth-front/src/api/http.ts`: a `dummyjson` client
  (`createHttpClient({ baseURL: 'https://dummyjson.com' })`) and its
  `createHttpQueryUtils(…, { key: ['dummyjson'] })`.
- `apps/better-auth-front/src/views/demos/features/vue-query/paginated-queries.vue`
  uses `dummy.get<IProducts>('/products').queryOptions({ query, placeholderData: keepPreviousData })`.
- `apps/better-auth-front/src/api/errors.ts`: `HttpError` branch —
  `network` → `ui.fallback.http.networkError`, `timeout` →
  `ui.fallback.http.requestTimeout`, otherwise the existing status mapping.
- Out of scope: legacy `src/api/domains/core/user.ts` / `timezone.ts`.

## 8. Testing

Vitest; HTTP tests inject `fetch` into ofetch and run in-process
(`// @vitest-environment node`).

| Area | Cases |
|---|---|
| `./orpc` | generic client hits the given `url`; `credentials` applied only when set; typed client from a contract type; `LIVE_RETRY` unchanged |
| `./orpc-query` | `path` option roots keys; no option → unprefixed keys |
| query serializer | four array formats, nesting, arrays of objects, Date/null/undefined/boolean, string and `URLSearchParams` passthrough; default path leaves `query` to ofetch |
| client | three `responseReturn` modes; request interceptor order and header mutation; response chain order; `rejected` recovery with a value and with an `HttpResponse`; unsubscribe; per-request overrides; `HttpError` kinds for http/timeout/abort/network |
| envelope preset | success unwrap; function `dataField`/`successCode`; mismatch → `kind: 'envelope'`; no effect for `raw`/`body` |
| refresh preset | 3 concurrent 401s → 1 `refresh` call, each retried once with the new token; refresh failure → `onAuthFailure` once and all reject; second 401 after retry → no loop; disabled → `onAuthFailure` immediately; non-401 untouched |
| error-message preset | server message preferred; `messages` overrides; status mapping; network/timeout keys; abort skipped; always rethrows |
| `./http-query` | key shapes and partial matching; `queryFn` passes query + signal; cancellation aborts the fetch; `URLSearchParams` key normalization; `mutationOptions` body mapping and path function; TanStack options passthrough |
| app | `getErrors` for `HttpError` kinds; existing oRPC tests still pass after the API change |
| packaging | `pnpm check:api-packages` green (publint, attw esm-only, consumer tsc importing all four entries) |

## 9. Out of scope

- Upload/download/SSE helpers; infinite-query helpers.
- Migrating or deleting the legacy `user.ts` / `timezone.ts` API files.
- Publishing (the user runs `pnpm release:api`).
- Changing `@vinicunca/taman-api-contract` beyond README usage snippets.
