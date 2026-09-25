# `@vinicunca/request` HTTP Client Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make `@vinicunca/request` generic (no Taman coupling) and add an ofetch-based `./http` client plus `./http-query` TanStack Query builders, then adopt them in the Taman app.

**Architecture:** `./orpc` and `./orpc-query` become type-parameterized factories (`createRpcClient<TClient>`, `createRpcQueryUtils`). `./http` wraps `ofetch.raw` in its own interceptor chain (transform + recover), owns the timeout (merged with any caller signal), normalizes every failure to `HttpError`, and ships three app-agnostic presets (envelope, token refresh, error messages). `./http-query` mirrors oRPC's utils: `api.get<T>(path).queryOptions(...)` / `api.post<T, V>(path).mutationOptions(...)`.

**Tech Stack:** TypeScript 6, ofetch 1.5.1 (optional peer), `@tanstack/query-core` 5.103 (optional peer), oRPC 1.15.4, zod 4.6.5 (tests), vitest 5, tsdown, pnpm catalogs, Vue 3.5 + `@tanstack/vue-query` in the app.

**Spec:** `docs/superpowers/specs/2026-09-25-request-http-design.md` (amended in `caf413c`)

## Global Constraints

- `packages/request` must not import `@vinicunca/taman-api-contract`, any `@taman/*`, Vue, Pinia or app code (tests included).
- `credentials` has no default in `createRpcClient` or `createHttpClient`.
- Every `@orpc/*` stays pinned to exactly `1.15.4` (catalog). `ofetch` is an **optional peer** `^1.5.1` (catalog `ofetch: ^1.5.1`); `@tanstack/query-core` stays an optional peer `>=5.80.2`.
- Default HTTP timeout `10_000` ms, owned by the client via `AbortSignal.any([signal, AbortSignal.timeout(ms)])` — never passed to ofetch (ofetch ignores its timeout whenever a signal exists).
- Default `responseReturn` is `'body'`; `query` goes to ofetch (ufo) unless `arrayFormat` or `querySerializer` is set; string / `URLSearchParams` queries are appended as-is.
- `./http-query` forwards only these request options: `query`, `headers`, `credentials`, `timeout`, `responseReturn`, `responseType`, `arrayFormat`, `querySerializer`, `parseResponse`. `retry`, `retryDelay`, `meta` belong to TanStack there.
- Node-environment test files start with `// @vitest-environment node`. Root vitest runs everything: `pnpm vitest run <paths>`.
- Repo tsconfig base has `noUncheckedIndexedAccess`, `verbatimModuleSyntax`, `isolatedModules` — use `import type` for types.
- Work in a separate git worktree (the user edits the main checkout concurrently and runs dev servers on :8788/:5556 — never touch those processes). Stage files explicitly by path; never `git add -A`; never commit `graphify-out/`; never run `graphify update`.
- Pre-existing failing tests on `feature/v1` (baseline, not regressions): backend `server/errors/error.utils.test.ts > carries CORS headers`, `packages/@core/base/shared` letter.test.ts (4), `packages/@core/composables` use-sortable.test.ts, `packages/@core/preferences` config.test.ts, form-ui form-integration (3) / form-validation-loading (1) / taman-file-upload (1), popup-ui dialog (1), `packages/utils` generate-routes-frontend (1) — plus any failures already present on the branch base, which Task 1 Step 1 records. Front `vue-tsc` has ~100 pre-existing errors in untouched files.
- Commit messages end with `Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>`.

## Review Focus

1. A caller that aborts (e.g. TanStack cancelling a query) while a client timeout is configured must abort immediately with `kind: 'abort'`, not wait for the timeout — pinned by `client.test.ts` "aborts on the caller signal even when a timeout is configured" (Task 2).
2. A `204` / empty response in envelope mode (`responseReturn: 'data'`, e.g. a DELETE) must resolve to `undefined`, not fail the code check — pinned by `envelope.test.ts` "resolves an empty (204) body…" (Task 3).
3. An endpoint that keeps answering 401 must not loop: exactly two requests, one `onAuthFailure`, one toast — pinned by `refresh-token.test.ts` "does not loop… and notifies once" (Task 3).
4. When a `rejected` handler recovers by re-issuing a request with a different `responseReturn`, the **outer** request's `responseReturn` decides the result — pinned by `client.test.ts` "continues through later fulfilled handlers…" (Task 2).
5. Cancelling a TanStack query must abort the actual network request — pinned by `http-query.test.ts` "aborts the network request when the query is cancelled" (Task 4).

---

## File Structure

**`packages/request/`** (`@vinicunca/request`)
- Modify: `package.json` (deps, exports, peers, metadata), `tsdown.config.ts` (entries), `README.md` (rewrite)
- Replace: `src/orpc.ts`, `src/orpc-query.ts`, `src/orpc.test.ts`
- Create `src/http/`: `types.ts`, `errors.ts`, `internal.ts`, `query.ts` (+ `query.test.ts`), `client.ts` (+ `client.test.ts`), `testing.ts` (test helpers, not exported), `index.ts`
- Create `src/http/interceptors/`: `envelope.ts`, `refresh-token.ts`, `error-message.ts` (+ one `.test.ts` each)
- Create: `src/http-query.ts` (+ `src/http-query.test.ts`)

**`apps/better-auth-front/`**
- Modify: `package.json` (+ `ofetch`), `src/api/orpc.ts`, `src/api/errors.ts` (+ `errors.test.ts`)
- Create: `src/api/http.ts`
- Modify: `src/views/demos/features/vue-query/paginated-queries.vue`
- Modify (imports only): `src/views/examples/orpc/plain/crud.vue`, `plain/use-todos-plain.ts`, `query/crud.vue`, `query/apply-todo-event.ts`, `query/apply-todo-event.test.ts`, `shared/todo-table.vue`, `shared/use-todo-live.ts`

**Other**
- Modify: `apps/better-auth-back/server/rpc/round-trip.test.ts`
- Modify: `scripts/release/check-api-packages.sh`, root `package.json` (`release:api`)

---

### Task 1: Generic `./orpc` + `./orpc-query`, adopted everywhere

**Files:**
- Replace: `packages/request/src/orpc.ts`, `packages/request/src/orpc-query.ts`, `packages/request/src/orpc.test.ts`
- Modify: `packages/request/package.json`
- Modify: `apps/better-auth-front/src/api/orpc.ts`, `apps/better-auth-front/src/views/examples/orpc/query/apply-todo-event.ts`, `.../query/apply-todo-event.test.ts`, `.../plain/crud.vue`, `.../plain/use-todos-plain.ts`, `.../query/crud.vue`, `.../shared/todo-table.vue`, `.../shared/use-todo-live.ts`
- Modify: `apps/better-auth-back/server/rpc/round-trip.test.ts`, `scripts/release/check-api-packages.sh`, root `package.json`

**Interfaces:**
- Consumes: `TamanContract`, `Todo`, `TodoEvent`, `TodoPage`, `TamanInputs` from `@vinicunca/taman-api-contract` (already exported).
- Produces (`@vinicunca/request/orpc`): `type RpcFetch = (request: Request, init?: RequestInit) => Promise<Response>`; `type RpcClientContext = ClientRetryPluginContext`; `type ContractClient<TContract extends AnyContractRouter>`; `interface RpcClientOptions { url; fetch?; headers?; credentials? }`; `createRpcClient<TClient extends NestedClient<RpcClientContext>>(options): TClient`; `LIVE_RETRY`; re-exports `isDefinedError`, `ORPCError`, `safe`.
- Produces (`@vinicunca/request/orpc-query`): `interface RpcQueryUtilsOptions { path?: Array<string> }`; `createRpcQueryUtils<TClient>(client, options?): RouterUtils<TClient>`.
- Produces (app, `#/api/orpc`): `type TamanRpcClient = ContractClient<TamanContract>`; `client`; `orpc`; `type TamanQueryUtils = typeof orpc`.

- [ ] **Step 1: Record the baseline**

Run: `pnpm vitest run 2>&1 | grep -E "^ FAIL " | sed 's/ >.*//; s/ \[.*//' | sort -u` and `pnpm --filter @taman/better-auth-front typecheck 2>&1 | grep -c "error TS"`.
Expected: failures ⊆ the Global Constraints baseline list (record anything extra as pre-existing in your report). Save both outputs to your report.

- [ ] **Step 2: Write the failing test**

Replace `packages/request/src/orpc.test.ts` with:

```ts
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
```

- [ ] **Step 3: Update the package manifest**

In `packages/request/package.json`:
- `description` → `"Generic typed request clients: oRPC and ofetch-based REST, each with TanStack Query helpers."`
- `repository.directory` → `"packages/request"`
- `dependencies` → exactly `{ "@orpc/client": "catalog:", "@orpc/contract": "catalog:", "@orpc/tanstack-query": "catalog:" }` (remove `@vinicunca/taman-api-contract`)
- `devDependencies` → add `"zod": "catalog:"` (keep `@orpc/server`, `@tanstack/query-core`, `tsdown`, `typescript`)

Run: `pnpm install`

- [ ] **Step 4: Run the test to verify it fails**

Run: `pnpm vitest run packages/request/src/orpc.test.ts`
Expected: FAIL — `createRpcClient` / `createRpcQueryUtils` / `ContractClient` are not exported.

- [ ] **Step 5: Implement**

Replace `packages/request/src/orpc.ts` with:

```ts
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
```

Replace `packages/request/src/orpc-query.ts` with:

```ts
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
```

- [ ] **Step 6: Run the package tests and typecheck**

Run: `pnpm vitest run packages/request/src/orpc.test.ts && pnpm --filter @vinicunca/request typecheck`
Expected: 6 tests PASS; tsc exits 0.

- [ ] **Step 7: Adopt in the app, backend test and release scripts**

`apps/better-auth-front/src/api/orpc.ts` — replace with:

```ts
import type { TamanContract } from '@vinicunca/taman-api-contract';
import type { ContractClient } from '@vinicunca/request/orpc';
import { useAppTamanConfig } from '@taman/composables';
import { createRpcClient } from '@vinicunca/request/orpc';
import { createRpcQueryUtils } from '@vinicunca/request/orpc-query';

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
```

`apps/better-auth-front/src/views/examples/orpc/query/apply-todo-event.ts` — change the two type imports at the top to:

```ts
import type { TamanInputs, TodoEvent, TodoPage } from '@vinicunca/taman-api-contract';
import type { TamanQueryUtils } from '#/api/orpc';
```

`apps/better-auth-front/src/views/examples/orpc/query/apply-todo-event.test.ts` — replace lines 1–8 (imports + `utils`) with:

```ts
import type { Todo, TodoPage } from '@vinicunca/taman-api-contract';
import type { TamanRpcClient } from '#/api/orpc';
import { QueryClient } from '@tanstack/vue-query';
import { createRpcClient } from '@vinicunca/request/orpc';
import { createRpcQueryUtils } from '@vinicunca/request/orpc-query';
import { describe, expect, it, vi } from 'vitest';
import { applyTodoEvent } from './apply-todo-event';

const utils = createRpcQueryUtils(
  createRpcClient<TamanRpcClient>({ url: 'http://api.test/api/rpc', fetch: vi.fn() }),
  { path: ['taman'] },
);
```

Type-only imports that moved to the contract package (change only the module specifier on these lines):
- `src/views/examples/orpc/plain/crud.vue`: `import type { Todo } from '@vinicunca/taman-api-contract';`
- `src/views/examples/orpc/plain/use-todos-plain.ts`: `import type { TamanInputs, Todo, TodoPage } from '@vinicunca/taman-api-contract';` (keep `import { isDefinedError, safe } from '@vinicunca/request/orpc';`)
- `src/views/examples/orpc/query/crud.vue`: `import type { Todo } from '@vinicunca/taman-api-contract';`
- `src/views/examples/orpc/shared/todo-table.vue`: `import type { Todo } from '@vinicunca/taman-api-contract';`
- `src/views/examples/orpc/shared/use-todo-live.ts`: `import type { TodoEvent } from '@vinicunca/taman-api-contract';` (keep `import { LIVE_RETRY } from '@vinicunca/request/orpc';`)

`apps/better-auth-back/server/rpc/round-trip.test.ts` — replace the `@vinicunca/request/orpc` import and the `client` definition with:

```ts
import type { TamanContract } from '@vinicunca/taman-api-contract';
import type { ContractClient } from '@vinicunca/request/orpc';
import { createRpcClient, isDefinedError, safe } from '@vinicunca/request/orpc';
```

```ts
const client = createRpcClient<ContractClient<TamanContract>>({
  url: `http://api.test${RPC_PREFIX}`,
  fetch: async (request, init) => {
    const { response } = await rpcHandler.handle(new Request(request, init), {
      prefix: RPC_PREFIX,
      context: { event: {} as H3Event },
    });
    return response ?? new Response(null, { status: 404 });
  },
});
```

`scripts/release/check-api-packages.sh`:
- `PACKAGES=(packages/api-contract packages/effects/request)` → `PACKAGES=(packages/api-contract packages/request)`
- replace the consumer `index.ts` heredoc body (between `cat > "$consumer/index.ts" <<'TS'` and `TS`) with:

```ts
import type { TamanContract, TamanOutputs } from '@vinicunca/taman-api-contract';
import { createRpcClient, isDefinedError, safe, type ContractClient } from '@vinicunca/request/orpc';
import { createRpcQueryUtils } from '@vinicunca/request/orpc-query';

const client = createRpcClient<ContractClient<TamanContract>>({ url: 'https://api.example.com/api/rpc', credentials: 'include' });
export async function demo(): Promise<Date | undefined> {
  const page: TamanOutputs['todo']['list'] = await client.todo.list({ page: 1 });
  const [error] = await safe(client.todo.get({ id: page.items[0]!.id }));
  if (isDefinedError(error)) {
    const code: 'NOT_FOUND' = error.code;
    void code;
  }
  void createRpcQueryUtils(client, { path: ['taman'] }).todo.list.queryOptions({ input: { page: 1 } });
  return page.items[0]?.createdAt;
}
```

Root `package.json` `release:api`: replace `packages/effects/request/package.json` with `packages/request/package.json`, and make sure the publish filter names `@vinicunca/request` (not `@vinicunca/taman-request`).

Run: `git grep -n "createTamanClient\|createTamanQueryUtils\|TamanFetch\|RPC_PATH\|effects/request" -- apps packages scripts package.json ':!*.md'`
Expected: no output.

- [ ] **Step 8: Verify the adopters**

Run: `pnpm vitest run packages/request apps/better-auth-back/server/rpc apps/better-auth-front/src/views/examples/orpc apps/better-auth-front/src/api && pnpm --filter @taman/better-auth-front typecheck 2>&1 | grep "src/api/orpc\|views/examples/orpc"`
Expected: tests PASS; the grep prints nothing.

- [ ] **Step 9: Commit**

```bash
git add packages/request apps/better-auth-front/src/api/orpc.ts apps/better-auth-front/src/views/examples/orpc apps/better-auth-back/server/rpc/round-trip.test.ts scripts/release/check-api-packages.sh package.json pnpm-lock.yaml
git commit -m "feat(request): make the oRPC clients generic over the contract type"
```

---

### Task 2: `./http` core — client, errors, query serializer

**Files:**
- Create: `packages/request/src/http/types.ts`, `errors.ts`, `internal.ts`, `query.ts`, `client.ts`, `testing.ts`, `index.ts`
- Test: `packages/request/src/http/query.test.ts`, `packages/request/src/http/client.test.ts`
- Modify: `packages/request/package.json`, `packages/request/tsdown.config.ts`

**Interfaces:**
- Consumes: nothing from earlier tasks.
- Produces (`@vinicunca/request/http`): `createHttpClient(options?: HttpClientOptions): HttpClient`; `DEFAULT_TIMEOUT = 10_000`; `isHttpResponse(value): value is HttpResponse`; `class HttpError` (`kind`, `request`, `context?`, `status?`, `code?`, `data?`, `response?`, `cause`); `isHttpError`; `serializeQuery(query, arrayFormat?)`; all types in `types.ts` (`HttpMethod`, `ResponseReturn`, `ArrayFormat`, `HttpQuery`, `HttpClientOptions`, `HttpRequestOptions`, `HttpRequestContext`, `HttpResponse`, `RequestInterceptor`, `ResponseInterceptor`, `HttpClient`).
- Produces (internal, for Task 3): `getServerMessage(data): string | undefined` and `toHttpError(error, context)` in `errors.ts`; `RETRIED` symbol and `InternalRequestOptions` in `internal.ts`; test helpers `createFakeFetch(routes)` → `{ fetch, calls: RecordedCall[] }` and `respondAfter(request, ms, response?)` in `testing.ts`.

- [ ] **Step 1: Wire the package entry**

In `packages/request/package.json`:
- `exports`: add `"./http": "./src/http/index.ts"`
- `publishConfig.exports`: add `"./http": { "types": "./dist/http.d.mts", "default": "./dist/http.mjs" }`
- `peerDependencies`: add `"ofetch": "^1.5.1"`; `peerDependenciesMeta`: add `"ofetch": { "optional": true }`
- `devDependencies`: add `"ofetch": "catalog:"`

Replace `packages/request/tsdown.config.ts` with:

```ts
import { defineConfig } from 'tsdown';

export default defineConfig({
  clean: true,
  deps: {
    skipNodeModulesBundle: true,
  },
  dts: true,
  entry: {
    'orpc': 'src/orpc.ts',
    'orpc-query': 'src/orpc-query.ts',
    'http': 'src/http/index.ts',
  },
  format: ['esm'],
});
```

Run: `pnpm install`

- [ ] **Step 2: Add the test helpers**

`packages/request/src/http/testing.ts`:

```ts
/** Test helpers for `./http` (not exported from the package). */

export interface RecordedCall {
  method: string;
  path: string;
  search: string;
  headers: Headers;
  credentials: RequestCredentials;
  body: string | null;
}

export type Route = (request: Request) => Response | Promise<Response>;

/** An in-process `fetch` that routes by pathname and records every call. */
export function createFakeFetch(routes: Record<string, Route>) {
  const calls: Array<RecordedCall> = [];

  const fetch: typeof globalThis.fetch = async (input, init) => {
    const request = new Request(input as RequestInfo, init);
    const url = new URL(request.url);
    calls.push({
      method: request.method,
      path: url.pathname,
      search: url.search,
      headers: request.headers,
      credentials: request.credentials,
      body: request.method === 'GET' || request.method === 'HEAD' ? null : await request.clone().text(),
    });
    const route = routes[url.pathname];
    return route ? route(request) : new Response('not found', { status: 404 });
  };

  return { fetch, calls };
}

/** Resolves after `ms`, or rejects with the abort reason if the request is aborted first. */
export function respondAfter(request: Request, ms: number, response: () => Response = () => Response.json({ late: true })): Promise<Response> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => resolve(response()), ms);
    request.signal.addEventListener('abort', () => {
      clearTimeout(timer);
      reject(request.signal.reason);
    });
  });
}
```

- [ ] **Step 3: Write the failing tests**

`packages/request/src/http/query.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { appendQueryString, serializeQuery } from './query';

function decoded(query: Record<string, unknown>, format?: Parameters<typeof serializeQuery>[1]) {
  return decodeURIComponent(serializeQuery(query, format));
}

describe('serializeQuery', () => {
  it('serializes flat values', () => {
    expect(decoded({ a: 1, b: 'x', t: true, f: false })).toBe('a=1&b=x&t=true&f=false');
  });

  it('nests objects with bracket paths', () => {
    expect(decoded({ user: { name: 'Ana', role: { id: 2 } } })).toBe('user[name]=Ana&user[role][id]=2');
  });

  it('supports every array format', () => {
    expect(decoded({ ids: [1, 2] }, 'repeat')).toBe('ids=1&ids=2');
    expect(decoded({ ids: [1, 2] }, 'brackets')).toBe('ids[]=1&ids[]=2');
    expect(decoded({ ids: [1, 2] }, 'indices')).toBe('ids[0]=1&ids[1]=2');
    expect(decoded({ ids: [1, 2] }, 'comma')).toBe('ids=1,2');
  });

  it('always uses indices for arrays that contain objects', () => {
    expect(decoded({ items: [{ n: 'a' }, { n: 'b' }] }, 'repeat')).toBe('items[0][n]=a&items[1][n]=b');
  });

  it('writes Dates as ISO strings, null as empty and omits undefined and empty arrays', () => {
    expect(decoded({ d: new Date(0), z: null, u: undefined, e: [] })).toBe('d=1970-01-01T00:00:00.000Z&z=');
  });

  it('encodes values the URLSearchParams way', () => {
    expect(serializeQuery({ s: 'a b&c' })).toBe('s=a+b%26c');
  });
});

describe('appendQueryString', () => {
  it('adds ? or & as needed and ignores an empty string', () => {
    expect(appendQueryString('/a', 'x=1')).toBe('/a?x=1');
    expect(appendQueryString('/a?y=2', 'x=1')).toBe('/a?y=2&x=1');
    expect(appendQueryString('/a', '')).toBe('/a');
  });
});
```

`packages/request/src/http/client.test.ts`:

```ts
// @vitest-environment node
import type { HttpResponse } from './types';
import { describe, expect, it } from 'vitest';
import { createHttpClient, isHttpResponse } from './client';
import { HttpError, isHttpError } from './errors';
import { createFakeFetch, respondAfter } from './testing';

const envelope = { code: 0, data: { id: 1 }, message: 'ok' };

function setup() {
  const fake = createFakeFetch({
    '/env': () => Response.json(envelope),
    '/echo': (request) => Response.json({ search: new URL(request.url).search }),
    '/boom': () => Response.json({ error: 'Kaboom' }, { status: 500 }),
    '/slow': (request) => respondAfter(request, 500),
  });
  const http = createHttpClient({ baseURL: 'http://api.test', fetch: fake.fetch, retry: false, headers: { 'x-client': '1' } });
  return { http, calls: fake.calls };
}

async function rejection(promise: Promise<unknown>): Promise<HttpError> {
  const error = await promise.then(() => undefined, (error_: unknown) => error_);
  if (!isHttpError(error)) {
    throw new Error(`expected an HttpError, got ${String(error)}`);
  }
  return error;
}

describe('createHttpClient', () => {
  it('returns the parsed body by default', async () => {
    const { http } = setup();
    await expect(http.get('/env')).resolves.toEqual(envelope);
  });

  it('returns the full response for responseReturn: raw', async () => {
    const { http } = setup();
    const raw = await http.get<HttpResponse>('/env', { responseReturn: 'raw' });
    expect(isHttpResponse(raw)).toBe(true);
    expect(raw.status).toBe(200);
    expect(raw.data).toEqual(envelope);
    expect(raw.response).toBeInstanceOf(Response);
  });

  it('treats responseReturn: data like body when no envelope interceptor is installed', async () => {
    const { http } = setup();
    await expect(http.get('/env', { responseReturn: 'data' })).resolves.toEqual(envelope);
  });

  it('sends the method, a JSON body and merged headers', async () => {
    const { http, calls } = setup();
    await http.post('/echo', { a: 1 }, { headers: { 'x-req': '2' } });
    const call = calls.at(-1)!;
    expect(call.method).toBe('POST');
    expect(call.body).toBe('{"a":1}');
    expect(call.headers.get('x-client')).toBe('1');
    expect(call.headers.get('x-req')).toBe('2');
    expect(call.headers.get('content-type')).toContain('application/json');
  });

  it('only sends credentials when configured', async () => {
    const { http, calls } = setup();
    await http.get('/echo');
    await http.get('/echo', { credentials: 'include' });
    expect(calls[0]!.credentials).not.toBe('include');
    expect(calls[1]!.credentials).toBe('include');
  });

  it('hands query objects to ofetch by default (repeated arrays)', async () => {
    const { http } = setup();
    await expect(http.get('/echo', { query: { ids: [1, 2], s: 'a b' } })).resolves.toEqual({ search: '?ids=1&ids=2&s=a+b' });
  });

  it('uses qs-style serialization when arrayFormat is set', async () => {
    const { http } = setup();
    const result = await http.get<{ search: string }>('/echo', { query: { ids: [1, 2], user: { name: 'Ana' } }, arrayFormat: 'brackets' });
    expect(decodeURIComponent(result.search)).toBe('?ids[]=1&ids[]=2&user[name]=Ana');
  });

  it('uses a custom querySerializer and appends string/URLSearchParams queries as-is', async () => {
    const { http } = setup();
    await expect(http.get('/echo', { query: { a: 1 }, querySerializer: () => 'custom=1' })).resolves.toEqual({ search: '?custom=1' });
    await expect(http.get('/echo', { query: 'x=1' })).resolves.toEqual({ search: '?x=1' });
    await expect(http.get('/echo', { query: new URLSearchParams([['y', '2']]) })).resolves.toEqual({ search: '?y=2' });
  });

  it('runs request interceptors in order and lets them mutate headers', async () => {
    const { http, calls } = setup();
    const order: Array<string> = [];
    http.addRequestInterceptor((context) => {
      order.push('first');
      context.options.headers.set('authorization', 'Bearer a');
    });
    http.addRequestInterceptor(async (context) => {
      order.push('second');
      context.options.headers.set('authorization', `${context.options.headers.get('authorization')}!`);
    });
    await http.get('/echo');
    expect(order).toEqual(['first', 'second']);
    expect(calls.at(-1)!.headers.get('authorization')).toBe('Bearer a!');
  });

  it('chains fulfilled handlers in order and removes an interceptor', async () => {
    const { http } = setup();
    http.addResponseInterceptor({
      fulfilled: (response) => ({ ...response, data: { step: 1 } }),
    });
    const remove = http.addResponseInterceptor({
      fulfilled: (response) => ({ ...response, data: { step: (response.data as { step: number }).step + 1 } }),
    });
    await expect(http.get('/env')).resolves.toEqual({ step: 2 });
    remove();
    await expect(http.get('/env')).resolves.toEqual({ step: 1 });
  });

  it('lets a rejected handler recover with a value', async () => {
    const { http } = setup();
    http.addResponseInterceptor({ rejected: () => 'fallback' });
    await expect(http.get('/boom')).resolves.toBe('fallback');
  });

  it('continues through later fulfilled handlers when a rejected handler returns an HttpResponse', async () => {
    const { http } = setup();
    http.addResponseInterceptor({ rejected: () => http.request('/env', { responseReturn: 'raw' }) });
    http.addResponseInterceptor({ fulfilled: (response) => ({ ...response, data: 'seen by later handler' }) });
    await expect(http.get('/boom')).resolves.toBe('seen by later handler');
  });

  it('rejects with kind http and the server message', async () => {
    const { http } = setup();
    const error = await rejection(http.get('/boom'));
    expect(error).toBeInstanceOf(HttpError);
    expect(error).toMatchObject({ kind: 'http', status: 500, message: 'Kaboom', data: { error: 'Kaboom' } });
    expect(error.request).toEqual({ url: '/boom', method: 'GET' });
  });

  it('rejects with kind timeout', async () => {
    const { http } = setup();
    expect((await rejection(http.get('/slow', { timeout: 20 }))).kind).toBe('timeout');
  });

  it('aborts on the caller signal even when a timeout is configured', async () => {
    const { http } = setup();
    const controller = new AbortController();
    setTimeout(() => controller.abort(), 20);
    const started = Date.now();
    const error = await rejection(http.get('/slow', { signal: controller.signal, timeout: 10_000 }));
    expect(error.kind).toBe('abort');
    expect(Date.now() - started).toBeLessThan(400);
  });

  it('rejects with kind network when fetch itself fails', async () => {
    const http = createHttpClient({ baseURL: 'http://api.test', retry: false, fetch: async () => { throw new TypeError('fetch failed'); } });
    expect((await rejection(http.get('/x'))).kind).toBe('network');
  });

  it('exposes the ofetch instance as raw', () => {
    const { http } = setup();
    expect(typeof http.raw.raw).toBe('function');
  });
});
```

- [ ] **Step 4: Run tests to verify they fail**

Run: `pnpm vitest run packages/request/src/http`
Expected: FAIL — `./query`, `./client`, `./errors` do not exist.

- [ ] **Step 5: Implement types, errors and the marker**

`packages/request/src/http/types.ts`:

```ts
import type { $Fetch } from 'ofetch';
import type { HttpError } from './errors';

export type HttpMethod = 'GET' | 'HEAD' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
export type ResponseReturn = 'raw' | 'body' | 'data';
export type ArrayFormat = 'repeat' | 'brackets' | 'indices' | 'comma';
export type HttpQuery = Record<string, unknown> | URLSearchParams | string;
export type HttpResponseType = 'json' | 'text' | 'blob' | 'arrayBuffer' | 'stream';

export interface HttpClientOptions {
  baseURL?: string;
  headers?: HeadersInit;
  /** No default: cookies are only sent when you ask for them. */
  credentials?: RequestCredentials;
  /** Milliseconds. Default 10_000. `0` disables the timeout. */
  timeout?: number;
  /** ofetch retry count (idempotent methods by default). */
  retry?: number | false;
  retryDelay?: number;
  retryStatusCodes?: Array<number>;
  /** Default `'body'`. */
  responseReturn?: ResponseReturn;
  /** Unset: `query` is handed to ofetch (ufo). Set: qs-style serialization. */
  arrayFormat?: ArrayFormat;
  querySerializer?: (query: Record<string, unknown>) => string;
  parseResponse?: (text: string) => unknown;
  fetch?: typeof globalThis.fetch;
}

export interface HttpRequestOptions extends Omit<HttpClientOptions, 'baseURL' | 'fetch'> {
  method?: HttpMethod;
  query?: HttpQuery;
  body?: unknown;
  responseType?: HttpResponseType;
  signal?: AbortSignal;
}

export interface HttpRequestContext {
  /** Path or URL as passed to the client (before `baseURL`). */
  url: string;
  options: Omit<HttpRequestOptions, 'headers' | 'method'> & {
    method: HttpMethod;
    headers: Headers;
    responseReturn: ResponseReturn;
  };
  /** Free-form per-request state for interceptors (e.g. retry markers). */
  meta: Record<PropertyKey, unknown>;
}

export interface HttpResponse<T = unknown> {
  status: number;
  headers: Headers;
  data: T;
  request: HttpRequestContext;
  response: Response;
}

export type RequestInterceptor = (context: HttpRequestContext) => void | Promise<void>;

export interface ResponseInterceptor {
  /** May transform the response. Throw to turn it into an error. */
  fulfilled?: (response: HttpResponse) => HttpResponse | Promise<HttpResponse>;
  /**
   * May recover: return an `HttpResponse` to continue through the remaining
   * `fulfilled` handlers, or any other value to finish with it as the result.
   * Throw to keep the request failed.
   */
  rejected?: (error: HttpError) => unknown;
}

export interface HttpClient {
  request: <T = unknown>(url: string, options?: HttpRequestOptions) => Promise<T>;
  get: <T = unknown>(url: string, options?: HttpRequestOptions) => Promise<T>;
  delete: <T = unknown>(url: string, options?: HttpRequestOptions) => Promise<T>;
  post: <T = unknown>(url: string, body?: unknown, options?: HttpRequestOptions) => Promise<T>;
  put: <T = unknown>(url: string, body?: unknown, options?: HttpRequestOptions) => Promise<T>;
  patch: <T = unknown>(url: string, body?: unknown, options?: HttpRequestOptions) => Promise<T>;
  /** Returns a function that removes the interceptor. */
  addRequestInterceptor: (interceptor: RequestInterceptor) => () => void;
  /** Returns a function that removes the interceptor. */
  addResponseInterceptor: (interceptor: ResponseInterceptor) => () => void;
  /** The configured ofetch instance, for anything the client doesn't cover. */
  readonly raw: $Fetch;
}
```

`packages/request/src/http/errors.ts`:

```ts
import type { HttpRequestContext } from './types';

export type HttpErrorKind = 'network' | 'timeout' | 'abort' | 'http' | 'envelope';

export interface HttpErrorInit {
  kind: HttpErrorKind;
  message: string;
  request: { url: string; method: string };
  context?: HttpRequestContext;
  status?: number;
  code?: unknown;
  data?: unknown;
  response?: Response;
  cause?: unknown;
}

/** The single error type every `./http` request rejects with. */
export class HttpError extends Error {
  override readonly name = 'HttpError';
  readonly kind: HttpErrorKind;
  readonly request: { url: string; method: string };
  /** Full request context, used by presets that re-issue the request. */
  readonly context?: HttpRequestContext;
  readonly status?: number;
  readonly code?: unknown;
  readonly data?: unknown;
  readonly response?: Response;

  constructor(init: HttpErrorInit) {
    super(init.message, { cause: init.cause });
    this.kind = init.kind;
    this.request = init.request;
    this.context = init.context;
    this.status = init.status;
    this.code = init.code;
    this.data = init.data;
    this.response = init.response;
  }
}

export function isHttpError(error: unknown): error is HttpError {
  return error instanceof HttpError
    || (typeof error === 'object' && error !== null
      && (error as { name?: unknown }).name === 'HttpError'
      && 'kind' in error);
}

/** `data.message` or `data.error` when the server sent a string there. */
export function getServerMessage(data: unknown): string | undefined {
  if (typeof data !== 'object' || data === null) {
    return undefined;
  }
  const { message, error } = data as { message?: unknown; error?: unknown };
  if (typeof message === 'string' && message) {
    return message;
  }
  return typeof error === 'string' && error ? error : undefined;
}

interface FetchErrorLike {
  data?: unknown;
  response?: Response;
  cause?: unknown;
}

/** Normalizes anything a request can throw into an `HttpError`. */
export function toHttpError(error: unknown, context: HttpRequestContext): HttpError {
  if (isHttpError(error)) {
    return error;
  }

  const request = { url: context.url, method: context.options.method };
  const fetchError = (error ?? {}) as FetchErrorLike;

  if (fetchError.response) {
    const { status } = fetchError.response;
    return new HttpError({
      kind: 'http',
      message: getServerMessage(fetchError.data) ?? `${request.method} ${request.url} failed with status ${status}`,
      request,
      context,
      status,
      data: fetchError.data,
      response: fetchError.response,
      cause: error,
    });
  }

  const cause = fetchError.cause ?? error;
  const name = (cause as { name?: unknown } | undefined)?.name;

  if (name === 'TimeoutError') {
    return new HttpError({ kind: 'timeout', message: `${request.method} ${request.url} timed out`, request, context, cause: error });
  }
  if (name === 'AbortError') {
    return new HttpError({ kind: 'abort', message: `${request.method} ${request.url} was aborted`, request, context, cause: error });
  }
  return new HttpError({ kind: 'network', message: `${request.method} ${request.url} could not reach the server`, request, context, cause: error });
}
```

`packages/request/src/http/internal.ts`:

```ts
import type { HttpRequestOptions } from './types';

/** Request-context `meta` key set by presets that re-issue a request. */
export const RETRIED = Symbol.for('vinicunca.request.retried');

/** Options accepted internally: the public options plus the retry marker. */
export type InternalRequestOptions = HttpRequestOptions & { [RETRIED]?: boolean };
```

- [ ] **Step 6: Implement the query serializer**

`packages/request/src/http/query.ts`:

```ts
import type { ArrayFormat } from './types';

/**
 * qs-style query string built on `URLSearchParams`: nested objects become
 * `a[b]=1`, arrays follow `arrayFormat`, arrays containing objects always
 * use indices, `Date` → ISO string, `null` → `key=`, `undefined` → omitted.
 */
export function serializeQuery(query: Record<string, unknown>, arrayFormat: ArrayFormat = 'repeat'): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    appendValue(params, key, value, arrayFormat);
  }
  return params.toString();
}

function appendValue(params: URLSearchParams, key: string, value: unknown, arrayFormat: ArrayFormat): void {
  if (value === undefined) {
    return;
  }
  if (value === null) {
    params.append(key, '');
    return;
  }
  if (value instanceof Date) {
    params.append(key, value.toISOString());
    return;
  }
  if (Array.isArray(value)) {
    appendArray(params, key, value, arrayFormat);
    return;
  }
  if (typeof value === 'object') {
    for (const [childKey, child] of Object.entries(value)) {
      appendValue(params, `${key}[${childKey}]`, child, arrayFormat);
    }
    return;
  }
  params.append(key, String(value));
}

function isPlainObjectItem(item: unknown): boolean {
  return typeof item === 'object' && item !== null && !(item instanceof Date);
}

function scalar(item: unknown): string {
  if (item === null) {
    return '';
  }
  return item instanceof Date ? item.toISOString() : String(item);
}

function appendArray(params: URLSearchParams, key: string, items: Array<unknown>, arrayFormat: ArrayFormat): void {
  const present = items.filter((item) => item !== undefined);
  if (present.length === 0) {
    return;
  }

  if (arrayFormat === 'indices' || present.some(isPlainObjectItem)) {
    items.forEach((item, index) => appendValue(params, `${key}[${index}]`, item, arrayFormat));
    return;
  }

  if (arrayFormat === 'comma') {
    params.append(key, present.map(scalar).join(','));
    return;
  }

  const itemKey = arrayFormat === 'brackets' ? `${key}[]` : key;
  for (const item of present) {
    params.append(itemKey, scalar(item));
  }
}

/** Appends an already-serialized query string to a URL. */
export function appendQueryString(url: string, queryString: string): string {
  if (!queryString) {
    return url;
  }
  return `${url}${url.includes('?') ? '&' : '?'}${queryString}`;
}
```

- [ ] **Step 7: Implement the client**

`packages/request/src/http/client.ts`:

```ts
import type { FetchOptions } from 'ofetch';
import type {
  HttpClient,
  HttpClientOptions,
  HttpRequestContext,
  HttpRequestOptions,
  HttpResponse,
  RequestInterceptor,
  ResponseInterceptor,
} from './types';
import { ofetch } from 'ofetch';
import type { InternalRequestOptions } from './internal';
import { toHttpError } from './errors';
import { RETRIED } from './internal';
import { appendQueryString, serializeQuery } from './query';

export const DEFAULT_TIMEOUT = 10_000;

const HTTP_RESPONSE = Symbol.for('vinicunca.request.http-response');

export function isHttpResponse(value: unknown): value is HttpResponse {
  return typeof value === 'object' && value !== null && HTTP_RESPONSE in value;
}

function combineSignals(signal: AbortSignal | undefined, timeout: number): AbortSignal | undefined {
  // ofetch ignores its own `timeout` whenever a `signal` is present, so the
  // client owns the timeout and merges it with the caller's signal.
  const signals = [signal, timeout > 0 ? AbortSignal.timeout(timeout) : undefined]
    .filter((item): item is AbortSignal => item !== undefined);

  if (signals.length <= 1) {
    return signals[0];
  }
  return AbortSignal.any(signals);
}

/**
 * vben-style HTTP client on ofetch: typed methods, an interceptor chain that
 * can transform results and recover from errors, and `responseReturn`.
 */
export function createHttpClient(clientOptions: HttpClientOptions = {}): HttpClient {
  const { baseURL, fetch, headers: defaultHeaders, ...defaults } = clientOptions;
  const $fetch = ofetch.create({ baseURL }, fetch ? { fetch } : undefined);
  const requestInterceptors: Array<RequestInterceptor> = [];
  const responseInterceptors: Array<ResponseInterceptor> = [];

  function createContext(url: string, options: InternalRequestOptions): HttpRequestContext {
    const headers = new Headers(defaultHeaders);
    new Headers(options.headers).forEach((value, key) => headers.set(key, value));

    return {
      url,
      options: {
        ...defaults,
        ...options,
        method: options.method ?? 'GET',
        headers,
        responseReturn: options.responseReturn ?? defaults.responseReturn ?? 'body',
      },
      meta: options[RETRIED] ? { [RETRIED]: true } : {},
    };
  }

  async function send(context: HttpRequestContext): Promise<HttpResponse> {
    const {
      method,
      headers,
      body,
      query,
      credentials,
      timeout = DEFAULT_TIMEOUT,
      retry,
      retryDelay,
      retryStatusCodes,
      responseType,
      parseResponse,
      arrayFormat,
      querySerializer,
      signal,
    } = context.options;

    let url = context.url;
    let ofetchQuery: Record<string, unknown> | undefined;

    if (typeof query === 'string' || query instanceof URLSearchParams) {
      url = appendQueryString(url, query.toString().replace(/^\?/, ''));
    } else if (query && (querySerializer || arrayFormat)) {
      url = appendQueryString(url, querySerializer ? querySerializer(query) : serializeQuery(query, arrayFormat));
    } else if (query) {
      ofetchQuery = query;
    }

    try {
      const response = await $fetch.raw(url, {
        method,
        headers,
        body: body as FetchOptions['body'],
        query: ofetchQuery,
        credentials,
        retry,
        retryDelay,
        retryStatusCodes,
        responseType,
        parseResponse,
        signal: combineSignals(signal, timeout),
      } as FetchOptions);

      return {
        [HTTP_RESPONSE]: true,
        status: response.status,
        headers: response.headers,
        data: response._data,
        request: context,
        response,
      } as HttpResponse;
    } catch (error) {
      throw toHttpError(error, context);
    }
  }

  async function request<T>(url: string, options: HttpRequestOptions = {}): Promise<T> {
    const context = createContext(url, options);

    for (const interceptor of [...requestInterceptors]) {
      await interceptor(context);
    }

    let chain: Promise<unknown> = send(context);
    for (const { fulfilled, rejected } of [...responseInterceptors]) {
      chain = chain.then(
        (value) => (fulfilled && isHttpResponse(value) ? fulfilled(value) : value),
        (error: unknown) => {
          if (!rejected) {
            throw error;
          }
          return rejected(toHttpError(error, context));
        },
      );
    }

    const result = await chain;
    if (!isHttpResponse(result)) {
      return result as T;
    }
    // This request's own setting decides, even when a recovered response came
    // from a re-issued request.
    return (context.options.responseReturn === 'raw' ? result : result.data) as T;
  }

  function remover<T>(list: Array<T>, item: T): () => void {
    list.push(item);
    return () => {
      const index = list.indexOf(item);
      if (index !== -1) {
        list.splice(index, 1);
      }
    };
  }

  return {
    request,
    get: (url, options) => request(url, { ...options, method: 'GET' }),
    delete: (url, options) => request(url, { ...options, method: 'DELETE' }),
    post: (url, body, options) => request(url, { ...options, body, method: 'POST' }),
    put: (url, body, options) => request(url, { ...options, body, method: 'PUT' }),
    patch: (url, body, options) => request(url, { ...options, body, method: 'PATCH' }),
    addRequestInterceptor: (interceptor) => remover(requestInterceptors, interceptor),
    addResponseInterceptor: (interceptor) => remover(responseInterceptors, interceptor),
    raw: $fetch,
  };
}
```

`packages/request/src/http/index.ts` (core exports; Task 3 adds the presets):

```ts
export { createHttpClient, DEFAULT_TIMEOUT, isHttpResponse } from './client';
export { HttpError, isHttpError } from './errors';
export type { HttpErrorInit, HttpErrorKind } from './errors';
export { serializeQuery } from './query';
export type * from './types';
```

- [ ] **Step 8: Run tests and typecheck**

Run: `pnpm vitest run packages/request/src/http && pnpm --filter @vinicunca/request typecheck`
Expected: 24 tests PASS (query 7, client 17); tsc exits 0.

- [ ] **Step 9: Commit**

```bash
git add packages/request pnpm-lock.yaml
git commit -m "feat(request): add ofetch-based ./http client with interceptor chain and HttpError"
```

---

### Task 3: `./http` presets — envelope, token refresh, error messages

**Files:**
- Create: `packages/request/src/http/interceptors/envelope.ts`, `refresh-token.ts`, `error-message.ts`
- Test: `packages/request/src/http/interceptors/envelope.test.ts`, `refresh-token.test.ts`, `error-message.test.ts`
- Modify: `packages/request/src/http/index.ts`

**Interfaces:**
- Consumes: `HttpError`, `getServerMessage` (`../errors`); `RETRIED`, `InternalRequestOptions` (`../internal`); `HttpClient`, `HttpRequestContext`, `ResponseInterceptor` (`../types`); `createHttpClient` (`../client`); `createFakeFetch`, `respondAfter` (`../testing`).
- Produces: `envelopeInterceptor(options?: EnvelopeInterceptorOptions)`; `refreshTokenInterceptor(options: RefreshTokenInterceptorOptions)`; `errorMessageInterceptor(options: ErrorMessageInterceptorOptions)`; `DEFAULT_ERROR_MESSAGES`; `type ErrorMessageKey`; all exported from `@vinicunca/request/http`.

- [ ] **Step 1: Write the failing tests**

`packages/request/src/http/interceptors/envelope.test.ts`:

```ts
// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { createHttpClient } from '../client';
import { isHttpError } from '../errors';
import { createFakeFetch } from '../testing';
import { envelopeInterceptor } from './envelope';

function setup(options?: Parameters<typeof envelopeInterceptor>[0]) {
  const fake = createFakeFetch({
    '/ok': () => Response.json({ code: 0, data: { id: 1 }, message: 'ok' }),
    '/bad': () => Response.json({ code: 7, message: 'Nope' }),
    '/custom': () => Response.json({ status: 'success', result: { id: 2 } }),
    '/empty': () => new Response(null, { status: 204 }),
  });
  const http = createHttpClient({ baseURL: 'http://api.test', fetch: fake.fetch, retry: false });
  http.addResponseInterceptor(envelopeInterceptor(options));
  return http;
}

describe('envelopeInterceptor', () => {
  it('unwraps data for responseReturn: data', async () => {
    await expect(setup().get('/ok', { responseReturn: 'data' })).resolves.toEqual({ id: 1 });
  });

  it('leaves body and raw requests untouched', async () => {
    const http = setup();
    await expect(http.get('/ok')).resolves.toEqual({ code: 0, data: { id: 1 }, message: 'ok' });
    await expect(http.get('/bad')).resolves.toEqual({ code: 7, message: 'Nope' });
  });

  it('throws an envelope HttpError when the code is not the success code', async () => {
    const error = await setup().get('/bad', { responseReturn: 'data' }).catch((error_: unknown) => error_);
    expect(isHttpError(error)).toBe(true);
    expect(error).toMatchObject({ kind: 'envelope', status: 200, code: 7, message: 'Nope' });
  });

  it('accepts a function dataField and successCode', async () => {
    const http = setup({
      codeField: 'status',
      successCode: (code) => code === 'success',
      dataField: (body) => body.result,
    });
    await expect(http.get('/custom', { responseReturn: 'data' })).resolves.toEqual({ id: 2 });
  });

  it('resolves an empty (204) body to undefined instead of failing the code check', async () => {
    await expect(setup().get('/empty', { responseReturn: 'data' })).resolves.toBeUndefined();
  });
});
```

`packages/request/src/http/interceptors/refresh-token.test.ts`:

```ts
// @vitest-environment node
import { describe, expect, it, vi } from 'vitest';
import { createHttpClient } from '../client';
import { createFakeFetch } from '../testing';
import { errorMessageInterceptor } from './error-message';
import { refreshTokenInterceptor } from './refresh-token';

function setup(options: { refresh?: () => Promise<string>; enabled?: boolean } = {}) {
  let token = 'old';
  const fake = createFakeFetch({
    '/secure': (request) => (request.headers.get('authorization') === 'Bearer new'
      ? Response.json({ ok: true })
      : Response.json({ message: 'expired' }, { status: 401 })),
    '/always-401': () => Response.json({}, { status: 401 }),
    '/forbidden': () => Response.json({}, { status: 403 }),
  });
  const http = createHttpClient({ baseURL: 'http://api.test', fetch: fake.fetch, retry: false });
  http.addRequestInterceptor((context) => {
    context.options.headers.set('authorization', `Bearer ${token}`);
  });

  const refresh = vi.fn(options.refresh ?? (async () => {
    await new Promise((resolve) => setTimeout(resolve, 20));
    token = 'new';
    return 'new';
  }));
  const onAuthFailure = vi.fn();
  const notify = vi.fn();

  http.addResponseInterceptor(refreshTokenInterceptor({
    client: http,
    refresh,
    applyToken: (context, value) => context.options.headers.set('authorization', `Bearer ${value}`),
    onAuthFailure,
    enabled: options.enabled,
  }));
  http.addResponseInterceptor(errorMessageInterceptor({ notify }));

  return { http, calls: fake.calls, refresh, onAuthFailure, notify, setToken: (value: string) => { token = value; } };
}

describe('refreshTokenInterceptor', () => {
  it('refreshes once for concurrent 401s and retries each request once with the new token', async () => {
    const { http, calls, refresh } = setup();
    const results = await Promise.all([http.get('/secure'), http.get('/secure'), http.get('/secure')]);
    expect(results).toEqual([{ ok: true }, { ok: true }, { ok: true }]);
    expect(refresh).toHaveBeenCalledTimes(1);
    expect(calls.map((call) => call.headers.get('authorization'))).toEqual([
      'Bearer old', 'Bearer old', 'Bearer old', 'Bearer new', 'Bearer new', 'Bearer new',
    ]);
  });

  it('calls onAuthFailure once and rejects every waiting request when refresh fails', async () => {
    const { http, onAuthFailure } = setup({ refresh: async () => { throw new Error('refresh denied'); } });
    const outcomes = await Promise.allSettled([http.get('/secure'), http.get('/secure')]);
    expect(outcomes.map((outcome) => outcome.status)).toEqual(['rejected', 'rejected']);
    expect(onAuthFailure).toHaveBeenCalledTimes(1);
  });

  it('does not loop on an endpoint that keeps answering 401, and notifies once', async () => {
    const { http, calls, onAuthFailure, notify, setToken } = setup();
    setToken('new');
    const error = await http.get('/always-401').catch((error_: unknown) => error_);
    expect(error).toMatchObject({ kind: 'http', status: 401 });
    expect(calls).toHaveLength(2);
    expect(onAuthFailure).toHaveBeenCalledTimes(1);
    expect(notify).toHaveBeenCalledTimes(1);
  });

  it('goes straight to onAuthFailure when refresh is disabled', async () => {
    const { http, refresh, onAuthFailure } = setup({ enabled: false });
    await expect(http.get('/secure')).rejects.toMatchObject({ status: 401 });
    expect(refresh).not.toHaveBeenCalled();
    expect(onAuthFailure).toHaveBeenCalledTimes(1);
  });

  it('leaves other errors alone', async () => {
    const { http, refresh, onAuthFailure } = setup();
    await expect(http.get('/forbidden')).rejects.toMatchObject({ status: 403 });
    expect(refresh).not.toHaveBeenCalled();
    expect(onAuthFailure).not.toHaveBeenCalled();
  });
});
```

`packages/request/src/http/interceptors/error-message.test.ts`:

```ts
// @vitest-environment node
import { describe, expect, it, vi } from 'vitest';
import { createHttpClient } from '../client';
import { createFakeFetch, respondAfter } from '../testing';
import { DEFAULT_ERROR_MESSAGES, errorMessageInterceptor } from './error-message';

function setup(options: Omit<Parameters<typeof errorMessageInterceptor>[0], 'notify'> = {}, fetch?: typeof globalThis.fetch) {
  const fake = createFakeFetch({
    '/server-message': () => Response.json({ message: 'Quota exceeded' }, { status: 429 }),
    '/not-found': () => Response.json({}, { status: 404 }),
    '/teapot': () => new Response('', { status: 418 }),
    '/slow': (request) => respondAfter(request, 500),
  });
  const http = createHttpClient({ baseURL: 'http://api.test', fetch: fetch ?? fake.fetch, retry: false });
  const notify = vi.fn();
  http.addResponseInterceptor(errorMessageInterceptor({ notify, ...options }));
  return { http, notify };
}

describe('errorMessageInterceptor', () => {
  it('prefers the server message', async () => {
    const { http, notify } = setup();
    await expect(http.get('/server-message')).rejects.toMatchObject({ status: 429 });
    expect(notify).toHaveBeenCalledWith('Quota exceeded', expect.objectContaining({ status: 429 }));
  });

  it('falls back to the status message, then the default', async () => {
    const { http, notify } = setup();
    await http.get('/not-found').catch(() => {});
    await http.get('/teapot').catch(() => {});
    expect(notify.mock.calls.map(([message]) => message)).toEqual([DEFAULT_ERROR_MESSAGES[404], DEFAULT_ERROR_MESSAGES.default]);
  });

  it('uses overrides and can ignore the server message', async () => {
    const { http, notify } = setup({ messages: { default: 'Oops', 404: 'Missing' }, preferServerMessage: false });
    await http.get('/server-message').catch(() => {});
    await http.get('/not-found').catch(() => {});
    expect(notify.mock.calls.map(([message]) => message)).toEqual(['Oops', 'Missing']);
  });

  it('uses the network and timeout messages', async () => {
    const network = setup({}, async () => { throw new TypeError('fetch failed'); });
    await network.http.get('/x').catch(() => {});
    expect(network.notify).toHaveBeenCalledWith(DEFAULT_ERROR_MESSAGES.network, expect.anything());

    const { http, notify } = setup();
    await http.get('/slow', { timeout: 20 }).catch(() => {});
    expect(notify).toHaveBeenCalledWith(DEFAULT_ERROR_MESSAGES.timeout, expect.anything());
  });

  it('stays silent for aborted requests and always rethrows', async () => {
    const { http, notify } = setup();
    const controller = new AbortController();
    setTimeout(() => controller.abort(), 10);
    await expect(http.get('/slow', { signal: controller.signal })).rejects.toMatchObject({ kind: 'abort' });
    expect(notify).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm vitest run packages/request/src/http/interceptors`
Expected: FAIL — the three interceptor modules do not exist.

- [ ] **Step 3: Implement the presets**

`packages/request/src/http/interceptors/envelope.ts`:

```ts
import type { ResponseInterceptor } from '../types';
import { getServerMessage, HttpError } from '../errors';

export interface EnvelopeInterceptorOptions {
  /** Field holding the result code. Default `'code'`. */
  codeField?: string;
  /** Field holding the payload, or a function that extracts it. Default `'data'`. */
  dataField?: string | ((body: Record<string, unknown>) => unknown);
  /** Success code, or a predicate. Default `0`. */
  successCode?: string | number | boolean | ((code: unknown) => boolean);
}

/**
 * Unwraps `{ code, data, message }` envelopes for requests made with
 * `responseReturn: 'data'`. `raw` and `body` requests pass through untouched.
 */
export function envelopeInterceptor(options: EnvelopeInterceptorOptions = {}): ResponseInterceptor {
  const { codeField = 'code', dataField = 'data', successCode = 0 } = options;

  return {
    fulfilled(response) {
      if (response.request.options.responseReturn !== 'data') {
        return response;
      }

      // 204 / empty body: nothing to unwrap.
      if (response.data === undefined || response.data === null || response.data === '') {
        response.data = undefined;
        return response;
      }

      const body = response.data as Record<string, unknown>;
      const code = body[codeField];
      const ok = typeof successCode === 'function' ? successCode(code) : code === successCode;

      if (!ok) {
        throw new HttpError({
          kind: 'envelope',
          message: getServerMessage(body) ?? `Request failed with code ${String(code)}`,
          request: { url: response.request.url, method: response.request.options.method },
          context: response.request,
          status: response.status,
          code,
          data: body,
          response: response.response,
        });
      }

      response.data = typeof dataField === 'function' ? dataField(body) : body[dataField];
      return response;
    },
  };
}
```

`packages/request/src/http/interceptors/refresh-token.ts`:

```ts
import type { HttpError } from '../errors';
import type { InternalRequestOptions } from '../internal';
import type { HttpClient, HttpRequestContext, ResponseInterceptor } from '../types';
import { RETRIED } from '../internal';

export interface RefreshTokenInterceptorOptions {
  client: HttpClient;
  /** Obtains a new access token. */
  refresh: () => Promise<string>;
  /** Writes the new token onto the request that will be re-issued. */
  applyToken: (context: HttpRequestContext, token: string) => void;
  /** Log out, show a "session expired" dialog, … */
  onAuthFailure: (error: HttpError) => void | Promise<void>;
  /** Default `true`. When `false`, a 401 goes straight to `onAuthFailure`. */
  enabled?: boolean | (() => boolean);
  /** Default: `error.status === 401`. */
  isUnauthorized?: (error: HttpError) => boolean;
}

interface RefreshAttempt {
  promise: Promise<string>;
  failure?: Promise<void>;
}

/**
 * On 401: refresh the token once (concurrent 401s share the same refresh),
 * then re-issue each failed request once with the new token.
 */
export function refreshTokenInterceptor(options: RefreshTokenInterceptorOptions): ResponseInterceptor {
  const isUnauthorized = options.isUnauthorized ?? ((error: HttpError) => error.status === 401);
  let inflight: RefreshAttempt | undefined;

  function startRefresh(): RefreshAttempt {
    const attempt: RefreshAttempt = { promise: options.refresh() };
    attempt.promise
      .finally(() => {
        if (inflight === attempt) {
          inflight = undefined;
        }
      })
      .catch(() => {});
    return attempt;
  }

  return {
    async rejected(error) {
      if (!isUnauthorized(error)) {
        throw error;
      }

      const enabled = typeof options.enabled === 'function' ? options.enabled() : options.enabled ?? true;
      const context = error.context;

      if (!enabled || !context || context.meta[RETRIED]) {
        await options.onAuthFailure(error);
        throw error;
      }

      const attempt = inflight ??= startRefresh();
      let token: string;
      try {
        token = await attempt.promise;
      } catch {
        attempt.failure ??= Promise.resolve(options.onAuthFailure(error));
        await attempt.failure;
        throw error;
      }

      const retryContext: HttpRequestContext = {
        url: context.url,
        options: { ...context.options, headers: new Headers(context.options.headers) },
        meta: { ...context.meta, [RETRIED]: true },
      };
      options.applyToken(retryContext, token);

      const retryOptions: InternalRequestOptions = { ...retryContext.options, [RETRIED]: true };
      return options.client.request(retryContext.url, retryOptions);
    },
  };
}
```

`packages/request/src/http/interceptors/error-message.ts`:

```ts
import type { HttpError } from '../errors';
import type { ResponseInterceptor } from '../types';
import { getServerMessage } from '../errors';

export type ErrorMessageKey = 'network' | 'timeout' | 'default' | 400 | 401 | 403 | 404 | 408;

export const DEFAULT_ERROR_MESSAGES: Record<ErrorMessageKey, string> = {
  network: 'Network error. Please check your connection.',
  timeout: 'The request timed out. Please try again.',
  default: 'Something went wrong. Please try again.',
  400: 'The request was invalid.',
  401: 'Your session has expired. Please sign in again.',
  403: 'You do not have permission to do that.',
  404: 'The requested resource was not found.',
  408: 'The request timed out. Please try again.',
};

export interface ErrorMessageInterceptorOptions {
  notify: (message: string, error: HttpError) => void;
  /** Override any default message, e.g. with translated strings. */
  messages?: Partial<Record<ErrorMessageKey, string>>;
  /** Prefer `data.message` / `data.error` from the server. Default `true`. */
  preferServerMessage?: boolean;
}

const NOTIFIED = Symbol.for('vinicunca.request.notified');

/** Shows one message per failed request, then rethrows. Aborts are silent. */
export function errorMessageInterceptor(options: ErrorMessageInterceptorOptions): ResponseInterceptor {
  const messages = { ...DEFAULT_ERROR_MESSAGES, ...options.messages };
  const preferServerMessage = options.preferServerMessage ?? true;

  return {
    rejected(error) {
      const flagged = error as HttpError & { [NOTIFIED]?: boolean };
      if (error.kind === 'abort' || flagged[NOTIFIED]) {
        throw error;
      }

      const serverMessage = preferServerMessage ? getServerMessage(error.data) : undefined;
      const kindMessage = error.kind === 'network' || error.kind === 'timeout' ? messages[error.kind] : undefined;
      const statusMessage = error.status === undefined ? undefined : messages[error.status as ErrorMessageKey];

      flagged[NOTIFIED] = true;
      options.notify(serverMessage ?? kindMessage ?? statusMessage ?? messages.default, error);
      throw error;
    },
  };
}
```

Replace `packages/request/src/http/index.ts` with:

```ts
export { createHttpClient, DEFAULT_TIMEOUT, isHttpResponse } from './client';
export { HttpError, isHttpError } from './errors';
export type { HttpErrorInit, HttpErrorKind } from './errors';
export { envelopeInterceptor } from './interceptors/envelope';
export type { EnvelopeInterceptorOptions } from './interceptors/envelope';
export { DEFAULT_ERROR_MESSAGES, errorMessageInterceptor } from './interceptors/error-message';
export type { ErrorMessageInterceptorOptions, ErrorMessageKey } from './interceptors/error-message';
export { refreshTokenInterceptor } from './interceptors/refresh-token';
export type { RefreshTokenInterceptorOptions } from './interceptors/refresh-token';
export { serializeQuery } from './query';
export type * from './types';
```

- [ ] **Step 4: Run tests and typecheck**

Run: `pnpm vitest run packages/request/src/http && pnpm --filter @vinicunca/request typecheck`
Expected: 39 tests PASS (Task 2's 24 + envelope 5, refresh 5, error-message 5); tsc exits 0.

- [ ] **Step 5: Commit**

```bash
git add packages/request/src/http
git commit -m "feat(request): add envelope, token-refresh and error-message interceptors"
```

---

### Task 4: `./http-query` — TanStack Query builders

**Files:**
- Create: `packages/request/src/http-query.ts`
- Test: `packages/request/src/http-query.test.ts`
- Modify: `packages/request/package.json`, `packages/request/tsdown.config.ts`

**Interfaces:**
- Consumes: `createHttpClient`, `HttpError`, `isHttpError`, `HttpClient`, `HttpMethod`, `HttpQuery`, `HttpRequestOptions`, test helpers (Tasks 2–3).
- Produces (`@vinicunca/request/http-query`): `createHttpQueryUtils(client, options?: { key?: ReadonlyArray<unknown> }): HttpQueryUtils` with `key(path?)`, `get<TData>(path)` → `HttpQueryEndpoint<TData>` (`key()`, `queryOptions<U, TSelected>(options?)`), `post|put|patch|delete<TData, TVariables>(path | (variables) => path)` → `HttpMutationEndpoint<TData, TVariables>` (`key()`, `mutationOptions<TContext>(options?)`); types `HttpQueryRequestOptions`, `HttpQueryOptionsIn`, `HttpQueryOptionsBase`, `HttpMutationOptionsIn`.

- [ ] **Step 1: Wire the entry**

`packages/request/package.json`: `exports` add `"./http-query": "./src/http-query.ts"`; `publishConfig.exports` add `"./http-query": { "types": "./dist/http-query.d.mts", "default": "./dist/http-query.mjs" }`.
`packages/request/tsdown.config.ts`: add `'http-query': 'src/http-query.ts',` to `entry`.

- [ ] **Step 2: Write the failing test**

`packages/request/src/http-query.test.ts`:

```ts
// @vitest-environment node
import { QueryClient } from '@tanstack/query-core';
import { describe, expect, it } from 'vitest';
import { createHttpClient } from './http/client';
import { isHttpError } from './http/errors';
import { createFakeFetch, respondAfter } from './http/testing';
import { createHttpQueryUtils } from './http-query';

function setup() {
  const network = { aborted: false };
  const fake = createFakeFetch({
    '/items': (request) => Response.json({ search: new URL(request.url).search }),
    '/items/5': () => new Response(null, { status: 204 }),
    '/slow': (request) => {
      request.signal.addEventListener('abort', () => {
        network.aborted = true;
      });
      return respondAfter(request, 500);
    },
  });
  const http = createHttpClient({ baseURL: 'http://api.test', fetch: fake.fetch, retry: false });
  return { api: createHttpQueryUtils(http, { key: ['ext'] }), calls: fake.calls, client: new QueryClient(), network };
}

describe('createHttpQueryUtils', () => {
  it('builds keys rooted at the given key', () => {
    const { api } = setup();
    expect(api.key()).toEqual(['ext']);
    expect(api.key('/items')).toEqual(['ext', 'GET', '/items']);
    expect(api.get('/items').key()).toEqual(['ext', 'GET', '/items']);
    expect(createHttpQueryUtils(createHttpClient()).key()).toEqual([]);
  });

  it('puts the query into the key, passes TanStack options through and fetches with the query', async () => {
    const { api, client } = setup();
    const options = api.get<{ search: string }>('/items').queryOptions({ query: { page: 2 }, staleTime: 1000 });
    expect(options.queryKey).toEqual(['ext', 'GET', '/items', { query: { page: 2 } }]);
    expect(options).toMatchObject({ staleTime: 1000 });
    expect(options).not.toHaveProperty('query');
    await expect(client.fetchQuery(options)).resolves.toEqual({ search: '?page=2' });
  });

  it('normalizes URLSearchParams queries in the key', () => {
    const { api } = setup();
    expect(api.get('/items').queryOptions({ query: new URLSearchParams('a=1') }).queryKey)
      .toEqual(['ext', 'GET', '/items', { query: 'a=1' }]);
  });

  it('aborts the network request when the query is cancelled', async () => {
    const { api, client, network } = setup();
    const pending = client.fetchQuery(api.get('/slow').queryOptions()).catch((error: unknown) => error);
    await new Promise((resolve) => setTimeout(resolve, 20));
    await client.cancelQueries({ queryKey: api.key() });
    const error = await pending;
    expect(isHttpError(error)).toBe(false);
    expect((error as { constructor: { name: string } }).constructor.name).toBe('CancelledError');
    expect(network.aborted).toBe(true);
  });

  it('maps mutation variables to the path and body', async () => {
    const { api, calls } = setup();
    const create = api.post<unknown, { title: string }>('/items').mutationOptions();
    const remove = api.delete<unknown, { id: number }>((variables) => `/items/${variables.id}`)
      .mutationOptions({ body: () => undefined });

    expect(create.mutationKey).toEqual(['ext', 'POST', '/items']);
    expect(remove.mutationKey).toEqual(['ext', 'DELETE']);

    await create.mutationFn!({ title: 'x' }, {} as never);
    await remove.mutationFn!({ id: 5 }, {} as never);
    expect(calls.map((call) => [call.method, call.path, call.body])).toEqual([
      ['POST', '/items', '{"title":"x"}'],
      ['DELETE', '/items/5', ''],
    ]);
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `pnpm vitest run packages/request/src/http-query.test.ts`
Expected: FAIL — `./http-query` does not exist.

- [ ] **Step 4: Implement**

`packages/request/src/http-query.ts`:

```ts
import type { MutationObserverOptions, QueryFunction, QueryFunctionContext, QueryKey, QueryObserverOptions } from '@tanstack/query-core';
import type { HttpError } from './http/errors';
import type { HttpClient, HttpMethod, HttpQuery, HttpRequestOptions } from './http/types';

/**
 * Request options forwarded to the HTTP client; everything else goes to
 * TanStack Query. `retry`, `retryDelay` and `meta` exist on both sides, so
 * here they belong to TanStack — set HTTP-level retries on the client.
 */
const REQUEST_OPTION_KEYS = [
  'query',
  'headers',
  'credentials',
  'timeout',
  'responseReturn',
  'responseType',
  'arrayFormat',
  'querySerializer',
  'parseResponse',
] as const;

type RequestOptionKey = typeof REQUEST_OPTION_KEYS[number];
export type HttpQueryRequestOptions = Pick<HttpRequestOptions, RequestOptionKey>;

/** Options accepted by `get(path).queryOptions()`: request options + TanStack query options. */
export type HttpQueryOptionsIn<TData, TSelected> = HttpQueryRequestOptions
  & Omit<QueryObserverOptions<TData, HttpError, TSelected, TData, QueryKey>, 'queryKey' | 'queryFn'>;

/** What `queryOptions()` adds to the options you passed. */
export interface HttpQueryOptionsBase<TData> {
  queryKey: QueryKey;
  queryFn: QueryFunction<TData>;
  enabled?: boolean;
}

/** Options accepted by `post(path).mutationOptions()` and friends. */
export type HttpMutationOptionsIn<TData, TVariables, TContext> = HttpQueryRequestOptions
  & Omit<MutationObserverOptions<TData, HttpError, TVariables, TContext>, 'mutationKey' | 'mutationFn'>
  & {
    /** Maps the mutation variables to the request body. Default: the variables themselves. */
    body?: (variables: TVariables) => unknown;
  };

export interface HttpQueryEndpoint<TData> {
  /** `[...root, 'GET', path]`: matches every query of this path. */
  key: () => QueryKey;
  queryOptions: <U, TSelected = TData>(
    options?: U & HttpQueryOptionsIn<TData, TSelected>,
  ) => NoInfer<Omit<U, RequestOptionKey> & HttpQueryOptionsBase<TData>>;
}

export interface HttpMutationEndpoint<TData, TVariables> {
  key: () => QueryKey;
  mutationOptions: <TContext = unknown>(
    options?: HttpMutationOptionsIn<TData, TVariables, TContext>,
  ) => NoInfer<MutationObserverOptions<TData, HttpError, TVariables, TContext>>;
}

type MutationPath<TVariables> = string | ((variables: TVariables) => string);

export interface HttpQueryUtils {
  /** `[...root]`, or `[...root, 'GET', path]`. */
  key: (path?: string) => QueryKey;
  get: <TData = unknown>(path: string) => HttpQueryEndpoint<TData>;
  post: <TData = unknown, TVariables = void>(path: MutationPath<TVariables>) => HttpMutationEndpoint<TData, TVariables>;
  put: <TData = unknown, TVariables = void>(path: MutationPath<TVariables>) => HttpMutationEndpoint<TData, TVariables>;
  patch: <TData = unknown, TVariables = void>(path: MutationPath<TVariables>) => HttpMutationEndpoint<TData, TVariables>;
  delete: <TData = unknown, TVariables = void>(path: MutationPath<TVariables>) => HttpMutationEndpoint<TData, TVariables>;
}

function splitOptions(options: object): [HttpQueryRequestOptions, Record<string, unknown>] {
  const request: Record<string, unknown> = {};
  const rest = { ...options } as Record<string, unknown>;
  for (const key of REQUEST_OPTION_KEYS) {
    if (key in rest) {
      request[key] = rest[key];
      delete rest[key];
    }
  }
  return [request as HttpQueryRequestOptions, rest];
}

/** Keys must be JSON-serializable for TanStack's hashing. */
function keyQuery(query: HttpQuery | undefined): unknown {
  return query instanceof URLSearchParams ? query.toString() : query ?? null;
}

/** TanStack Query options builders for an `./http` client. */
export function createHttpQueryUtils(client: HttpClient, options: { key?: ReadonlyArray<unknown> } = {}): HttpQueryUtils {
  const root = [...(options.key ?? [])];

  function mutation<TData, TVariables>(method: Exclude<HttpMethod, 'GET' | 'HEAD'>, path: MutationPath<TVariables>): HttpMutationEndpoint<TData, TVariables> {
    const key = () => (typeof path === 'string' ? [...root, method, path] : [...root, method]);
    return {
      key,
      mutationOptions(mutationOptions = {} as never) {
        const { body, ...withoutBody } = mutationOptions as { body?: (variables: TVariables) => unknown };
        const [request, rest] = splitOptions(withoutBody);
        return {
          ...rest,
          mutationKey: key(),
          mutationFn: (variables: TVariables) => client.request<TData>(typeof path === 'function' ? path(variables) : path, {
            ...request,
            method,
            body: body ? body(variables) : variables,
          }),
        } as never;
      },
    };
  }

  return {
    key: (path) => (path === undefined ? [...root] : [...root, 'GET', path]),
    get<TData>(path: string): HttpQueryEndpoint<TData> {
      return {
        key: () => [...root, 'GET', path],
        queryOptions(queryOptions = {} as never) {
          const [request, rest] = splitOptions(queryOptions);
          return {
            ...rest,
            queryKey: [...root, 'GET', path, { query: keyQuery(request.query) }],
            queryFn: ({ signal }: QueryFunctionContext) => client.request<TData>(path, { ...request, method: 'GET', signal }),
          } as never;
        },
      };
    },
    post: (path) => mutation('POST', path),
    put: (path) => mutation('PUT', path),
    patch: (path) => mutation('PATCH', path),
    delete: (path) => mutation('DELETE', path),
  };
}
```

- [ ] **Step 5: Run tests and typecheck**

Run: `pnpm vitest run packages/request && pnpm --filter @vinicunca/request typecheck`
Expected: all package tests PASS (orpc 6 + http 39 + http-query 5 = 50); tsc exits 0.

- [ ] **Step 6: Commit**

```bash
git add packages/request
git commit -m "feat(request): add ./http-query TanStack Query builders"
```

---

### Task 5: Adopt `./http` in the Taman app

**Files:**
- Modify: `apps/better-auth-front/package.json`
- Create: `apps/better-auth-front/src/api/http.ts`
- Modify: `apps/better-auth-front/src/views/demos/features/vue-query/paginated-queries.vue`
- Modify: `apps/better-auth-front/src/api/errors.ts`
- Test: `apps/better-auth-front/src/api/errors.test.ts`

**Interfaces:**
- Consumes: `createHttpClient`, `HttpError`, `isHttpError` (`@vinicunca/request/http`); `createHttpQueryUtils` (`@vinicunca/request/http-query`).
- Produces: `dummyjsonClient` and `dummyjson` (query utils, key root `['dummyjson']`) from `#/api/http`; `getErrors` handles `HttpError`.

- [ ] **Step 1: Add the dependency**

In `apps/better-auth-front/package.json` `dependencies` add `"ofetch": "catalog:"` (alphabetical). Run: `pnpm install`.

- [ ] **Step 2: Write the failing test**

Append to `apps/better-auth-front/src/api/errors.test.ts` (add `import { HttpError } from '@vinicunca/request/http';` to its imports):

```ts
describe('getErrors with HttpError', () => {
  const request = { url: '/products', method: 'GET' };

  it('maps network and timeout kinds to the localized fallbacks', () => {
    expect(getErrors(new HttpError({ kind: 'network', message: 'offline', request }))).toBe('ui.fallback.http.networkError');
    expect(getErrors(new HttpError({ kind: 'timeout', message: 'slow', request }))).toBe('ui.fallback.http.requestTimeout');
  });

  it('maps HTTP statuses like any other status-bearing error', () => {
    expect(getErrors(new HttpError({ kind: 'http', status: 404, message: 'GET /products failed', request }))).toBe('ui.fallback.http.notFound');
  });
});
```

Run: `pnpm vitest run apps/better-auth-front/src/api/errors.test.ts`
Expected: FAIL — the network/timeout cases return the raw message.

- [ ] **Step 3: Implement the `getErrors` branch**

In `apps/better-auth-front/src/api/errors.ts`, add `import { isHttpError } from '@vinicunca/request/http';` to the imports, and insert this block right after the `if (error instanceof ORPCError) { … }` block:

```ts
  if (isHttpError(error)) {
    if (error.kind === 'network') {
      return $t('ui.fallback.http.networkError');
    }
    if (error.kind === 'timeout') {
      return $t('ui.fallback.http.requestTimeout');
    }
  }
```

Also add "`HttpError` — from the REST client (`#/api/http`)" to the shapes listed in `getErrors`' JSDoc.

- [ ] **Step 4: Add the example REST client**

`apps/better-auth-front/src/api/http.ts`:

```ts
import { createHttpClient } from '@vinicunca/request/http';
import { createHttpQueryUtils } from '@vinicunca/request/http-query';

/**
 * Example non-RPC client: the public dummyjson.com API behind the vue-query
 * demos. Real integrations add interceptors here (auth header, envelope,
 * token refresh, error toasts) — see `@vinicunca/request`'s README.
 */
export const dummyjsonClient = createHttpClient({ baseURL: 'https://dummyjson.com' });

/** vue-query helpers — `useQuery(dummyjson.get<T>('/products').queryOptions(...))`. */
export const dummyjson = createHttpQueryUtils(dummyjsonClient, { key: ['dummyjson'] });
```

- [ ] **Step 5: Use it in the paginated-queries demo**

In `apps/better-auth-front/src/views/demos/features/vue-query/paginated-queries.vue`, replace everything from `<script setup lang="ts">` down to (not including) `function prevPage()` with:

```vue
<script setup lang="ts">
import type { IProducts } from './typing';

import { keepPreviousData, useQuery } from '@tanstack/vue-query';
import { computed, ref } from 'vue';
import { dummyjson } from '#/api/http';

const LIMIT = 10;

const page = ref(1);
const { data, error, isError, isPending, isPlaceholderData } = useQuery(computed(() =>
  dummyjson.get<IProducts>('/products').queryOptions({
    query: { limit: LIMIT, skip: (page.value - 1) * LIMIT },
    // The data from the last successful fetch is available while new data is being requested.
    placeholderData: keepPreviousData,
  }),
));
```

Leave `prevPage`, `nextPage` and the `<template>` unchanged.

- [ ] **Step 6: Verify**

Run: `pnpm vitest run apps/better-auth-front/src/api && pnpm --filter @taman/better-auth-front typecheck 2>&1 | grep "src/api/\|vue-query/paginated-queries"`
Expected: tests PASS; the grep shows only the pre-existing `#/api/request` errors in `src/api/domains/core/user.ts` and `timezone.ts` (no errors in `errors.ts`, `http.ts`, `orpc.ts` or `paginated-queries.vue`).

- [ ] **Step 7: Commit**

```bash
git add apps/better-auth-front/package.json apps/better-auth-front/src/api/http.ts apps/better-auth-front/src/api/errors.ts apps/better-auth-front/src/api/errors.test.ts apps/better-auth-front/src/views/demos/features/vue-query/paginated-queries.vue pnpm-lock.yaml
git commit -m "feat(front): use the ./http client for the dummyjson vue-query demo"
```

---

### Task 6: Packaging — README, publish checks

**Files:**
- Replace: `packages/request/README.md`
- Modify: `scripts/release/check-api-packages.sh`

**Interfaces:**
- Consumes: all four entries (Tasks 1–4).
- Produces: `pnpm check:api-packages` green for both packages with all four `@vinicunca/request` entries type-checked by an out-of-workspace consumer.

- [ ] **Step 1: Rewrite the README**

Replace `packages/request/README.md` with:

```md
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
```

- [ ] **Step 2: Extend the consumer check**

In `scripts/release/check-api-packages.sh`, append these lines inside the consumer `index.ts` heredoc (after the existing `demo` function, before the closing `TS`):

```ts
import { createHttpClient, envelopeInterceptor, errorMessageInterceptor, isHttpError, refreshTokenInterceptor } from '@vinicunca/request/http';
import { createHttpQueryUtils } from '@vinicunca/request/http-query';

const http = createHttpClient({ baseURL: 'https://api.example.com', responseReturn: 'data' });
http.addResponseInterceptor(envelopeInterceptor());
http.addResponseInterceptor(refreshTokenInterceptor({ client: http, refresh: async () => 'token', applyToken: (context, token) => context.options.headers.set('authorization', token), onAuthFailure: () => {} }));
http.addResponseInterceptor(errorMessageInterceptor({ notify: () => {} }));
const api = createHttpQueryUtils(http, { key: ['example'] });
export const products = api.get<{ items: Array<{ id: number }> }>('/products').queryOptions({ query: { page: 1 }, select: (page) => page.items });
export const create = api.post<{ id: number }, { title: string }>('/products').mutationOptions();
export async function load(): Promise<number | undefined> {
  try {
    return (await http.get<{ total: number }>('/stats')).total;
  } catch (error) {
    return isHttpError(error) ? error.status : undefined;
  }
}
```

In the `npm install` line, add `ofetch` next to `@tanstack/query-core`.

- [ ] **Step 3: Build and verify the tarballs**

Run: `pnpm --filter @vinicunca/request build && find packages/request/dist -type f | sort && pnpm check:api-packages`
Expected: `dist` contains `orpc.mjs`, `orpc-query.mjs`, `http.mjs`, `http-query.mjs` and matching `.d.mts` files; the script ends with `API packages OK.` (publint "All good!", attw esm-only green, consumer `tsc` exit 0). If the built file names differ, align `publishConfig.exports` with the real output before re-running. Do **not** run `pnpm release:api`.

- [ ] **Step 4: Commit**

```bash
git add packages/request/README.md scripts/release/check-api-packages.sh
git commit -m "docs(request): document the generic oRPC and ./http entries and check them in publish"
```

---

### Task 7: Final verification

**Files:** none new.

- [ ] **Step 1: Full tests and typechecks**

Run: `pnpm vitest run 2>&1 | grep -E "^ FAIL " | sed 's/ >.*//; s/ \[.*//' | sort -u`, then `pnpm vitest run 2>&1 | grep -E "^      Tests "`, `pnpm --filter @vinicunca/request typecheck`, `pnpm --filter @vinicunca/taman-api-contract typecheck`, and `pnpm --filter @taman/better-auth-front typecheck 2>&1 | grep -c "error TS"`.
Expected: failing files equal Task 1 Step 1's baseline; package typechecks exit 0; the front error count is ≤ the baseline and none of its errors are in files changed on this branch (`git diff --name-only <base>..HEAD`).

- [ ] **Step 2: Lint changed files**

Run: `pnpm exec eslint $(git diff --name-only <base>..HEAD -- '*.ts' '*.vue')` (base = the commit this branch started from). Fix reported problems in those files only (`--fix` first; hand-fix the rest if small and behavior-neutral), then re-run the tests covering any touched file.

- [ ] **Step 3: Commit lint fixes (skip if nothing changed)**

```bash
git add <the changed files, by path>
git commit -m "chore: lint fixes for @vinicunca/request http client"
```
