# oRPC API layer — design

- **Date:** 2026-09-24
- **Status:** Approved in conversation; pending written-spec review
- **Branch:** `feature/v1`

## 1. Goal

Replace the backend's ad-hoc REST handlers with a single, typed oRPC API and
ship its client typings as public npm packages so other repositories can
consume the same API with full type safety.

Success means:

1. `apps/better-auth-back` serves every application procedure through one oRPC
   `RPCHandler` at `/api/rpc/**`, authenticated by the existing better-auth
   session.
2. `apps/better-auth-front` calls the API only through the oRPC client, in two
   styles: **plain request** and **vue-query**.
3. Working examples, each in both client styles:
   - **CRUD** — create, read, update, delete a todo.
   - **Pagination** — offset-paginated, filterable todo list.
   - **Realtime** — a live stream of todo changes, visible across browser tabs.
4. `@vinicunca/taman-api-contract` and `@vinicunca/taman-request` are
   publishable to the public npm registry and type-check in a project outside
   this monorepo.
5. Realtime fan-out works on Cloudflare Workers (the deployment target).

## 2. Decisions

| Topic | Decision | Reason |
|---|---|---|
| Type sharing | **Contract-first** (`@orpc/contract`) | Router-inferred types would drag Drizzle / better-auth / Nitro types into the published `.d.ts`. The contract depends only on `zod`. |
| Registry | **Public npm**, scope `@vinicunca`, `access: public` | No privacy requirement; `@vinicunca` already resolves from npmjs, so no scope-routing conflicts for consumers. |
| Packages | Contract in its own package; clients in `@vinicunca/taman-request` | The server imports the contract; it must not depend on a client package. Client factories live with the request package. |
| Wire protocol | **`RPCHandler`** only | Least per-procedure config; oRPC serialization preserves `Date`. `OpenAPIHandler` can be added later on the same router (see §10). |
| URL layout | **`/api` umbrella**: `/api/auth/**` (better-auth, unchanged), `/api/rpc/**` (oRPC), `/api/v1/**` reserved for OpenAPI | One prefix to proxy/CORS/rate-limit; each sub-prefix speaks exactly one protocol; no OAuth redirect URI change. |
| Existing REST surface | Migrate `/menu/all` → `menu.all`; delete the envelope / REST plumbing and the ofetch client | One app API. `/api/auth/**`, `/healthz`, `/readyz` stay plain HTTP by necessity. |
| Realtime | **Event iterator over HTTP (SSE)** on the same `RPCHandler` | Same route, client, auth, CORS, errors. Works on Workers. WebSocket stays an additive option. |
| Pub/sub | `DurablePublisher` (Cloudflare DO) in production, `MemoryPublisher` in dev | `MemoryPublisher` cannot fan out across Worker isolates. Selection lives in one module. |
| Examples resource | One org-scoped `todo` table | Covers CRUD, pagination (seeded ~100 rows) and realtime without extra tables. |
| Schemas | Hand-written zod in the contract, not `drizzle-zod` | Keeps the contract DB-free and the public API shape deliberate. Drift is caught by the compiler at the server boundary. |
| RBAC | New `todo: ['create','read','update','delete']` statement; owner **and** member get all four | Demonstrates the `can()` check; todos are collaborative. |

## 3. Package: `@vinicunca/taman-api-contract`

Location: `packages/api-contract` (new; covered by the `packages/*` workspace glob).

```
src/
  shared/pagination.ts   paginationInput, paginated(itemSchema)
  todo/todo.schema.ts    todoSchema, todoCreateInput, todoUpdateInput,
                         todoListInput, todoEventSchema
  todo/todo.contract.ts  todo procedures
  menu/menu.contract.ts  menu.all
  index.ts               contract, types
```

### 3.1 Shared pagination

```ts
paginationInput = z.object({
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(20),
});

paginated(item) = z.object({
  items: z.array(item),
  page: z.number().int(),
  pageSize: z.number().int(),
  total: z.number().int(),
  totalPages: z.number().int(), // ceil(total / pageSize); 0 when total is 0
});
```

### 3.2 Todo schemas

- `todoSchema`: `{ id: uuid, title: string, completed: boolean, createdBy: uuid | null, createdAt: Date, updatedAt: Date }`. `organizationId` is **not** exposed; scope is implicit from the session.
- `todoCreateInput`: `{ title: string (trim, 1–200), completed?: boolean }`.
- `todoUpdateInput`: `{ id: uuid, title?: …, completed?: boolean }` with at least one of `title` / `completed`.
- `todoListInput`: `paginationInput.extend({ search?: string (trim, ≤200), completed?: boolean })`.
- `todoEventSchema`: discriminated union on `type`:
  - `{ type: 'created', todo: todoSchema }`
  - `{ type: 'updated', todo: todoSchema }`
  - `{ type: 'removed', id: uuid }`

### 3.3 Procedures

| Procedure | Input | Output | Errors |
|---|---|---|---|
| `todo.list` | `todoListInput` | `paginated(todoSchema)` ordered by `createdAt desc` | — |
| `todo.get` | `{ id }` | `todoSchema` | `NOT_FOUND` |
| `todo.create` | `todoCreateInput` | `todoSchema` | — |
| `todo.update` | `todoUpdateInput` | `todoSchema` | `NOT_FOUND` |
| `todo.remove` | `{ id }` | `{ id }` | `NOT_FOUND` |
| `todo.live` | none | `eventIterator(todoEventSchema)` | — |
| `menu.all` | none | `Array<routeRecordSchema>` (shape of the current `RouteRecordStringComponent`; recursive `children` via `z.lazy`) | — |

`NOT_FOUND` is declared with `oc.errors({ NOT_FOUND: {} })` so it is a typed,
defined error on the client. `UNAUTHORIZED`, `FORBIDDEN` (with
`data.code = 'ORG_REQUIRED'`), `BAD_REQUEST` and `SERVICE_UNAVAILABLE` are
common errors raised by middleware/interceptors.

### 3.4 Exports

`contract`, `type TamanContract`, `type TamanClient = ContractRouterClient<TamanContract>`,
`type TamanInputs = InferContractRouterInputs<TamanContract>`,
`type TamanOutputs = InferContractRouterOutputs<TamanContract>`, and every schema
(so consumers can reuse them, e.g. for form validation).

Dependencies: `@orpc/contract`, `zod`.

## 4. Package: `@vinicunca/taman-request`

Location: `packages/effects/request` (renamed from `@taman/request`). The
existing ofetch client, `ApiError` and their tests are removed; the package
becomes oRPC-only.

### 4.1 `./orpc` — plain client

```ts
interface TamanClientOptions {
  baseUrl: string;                                     // origin of the backend, no trailing /api/rpc
  fetch?: typeof globalThis.fetch;                     // injectable: tests, SSR, Workers
  headers?: HeadersInit | (() => HeadersInit | Promise<HeadersInit>); // e.g. future bearer auth
}

function createTamanClient(options: TamanClientOptions): TamanClient
```

- `RPCLink` with `url: \`${baseUrl}/api/rpc\``.
- Wraps `fetch` to force `credentials: 'include'` (cross-origin cookie auth).
- Installs `ClientRetryPlugin`; retry is opt-in per call via `context.retry`,
  used by `todo.live` to reconnect and resume via `lastEventId`.
- Re-exports `ORPCError`, `isDefinedError` and the contract's `TamanClient`,
  `TamanInputs`, `TamanOutputs` types.

### 4.2 `./orpc-query` — vue-query utils

```ts
function createTamanQueryUtils(client: TamanClient) {
  return createTanstackQueryUtils(client, { path: ['taman'] });
}
```

The `['taman']` key prefix prevents cache collisions in host apps. The exact
name of the streaming helper (`experimental_liveOptions` /
`experimental_streamedOptions`) is confirmed against the installed
`@orpc/tanstack-query` 1.x during implementation.

### 4.3 Dependencies

`@orpc/client`, `@orpc/tanstack-query`, `@vinicunca/taman-api-contract`
(`workspace:^`). Optional peer: `@tanstack/vue-query` (only for `./orpc-query`).

## 5. Backend (`apps/better-auth-back`)

### 5.1 Layout

```
server/
  routes/api/rpc/[...].ts   mounts the handler
  rpc/
    base.ts                 os = implement(contract).$context<{ event: H3Event }>(); authed middleware
    handler.ts              RPCHandler(router, interceptors)
    router.ts               os.router({ todo, menu })
    procedures/todo.ts
    procedures/menu.ts
  domains/todo/
    todo.repo.ts
    todo.service.ts
  realtime/publisher.ts
```

### 5.2 Route

```ts
// routes/api/rpc/[...].ts
const { matched, response } = await rpcHandler.handle(event.req, {
  prefix: '/api/rpc',
  context: { event },
});
if (!matched) throw httpError({ status: 404, message: 'Procedure not found' });
return applyCorsToResponse(event, response);
```

`applyCorsToResponse` is required because non-2xx raw `Response`s bypass
Nitro's merge of the CORS middleware headers (same reason as the better-auth
passthrough).

### 5.3 Auth middleware (`authed`)

- Calls the existing `resolveContext(event)` (session → db → member).
- `getAuthAccess` throws a 401 `HTTPError`; `authed` maps it to
  `ORPCError('UNAUTHORIZED')`.
- Non-admin without `activeOrganizationId` →
  `ORPCError('FORBIDDEN', { data: { code: 'ORG_REQUIRED' } })` — the rule
  currently in `middleware/2.context.ts`.
- Injects `context.taman: TamanContext`.
- Todo procedures additionally require `context.taman.member` (todos are
  org-scoped); a platform admin without membership gets `ORG_REQUIRED`.

### 5.4 Handler interceptors

- `onError` → `console.error` for non-`ORPCError`s (CF Observability captures it).
- DB-connection errors (reusing `findConnectionErrorCode`, exported from
  `errors/error.db.ts`) → `ORPCError('SERVICE_UNAVAILABLE')`, message
  "Unable to reach the database. Is it running?".
- Input/output validation is performed by oRPC against the contract; invalid
  input yields `BAD_REQUEST` with the issues in `data`.

### 5.5 Domain

- **`TodoRepo extends CoreRepo`** — every query filtered by `organizationId`.
  `list` runs the page query (`limit`/`offset`, `ilike` on `title` for
  `search`, `eq` on `completed`) and a `count(*)` with the same filter.
  `update`/`remove` use `returning()`; zero rows ⇒ `null`.
- **`TodoService extends CoreService`** — checks `can({ todo: [action] })`
  (throws `ORPCError('FORBIDDEN')` on denial), computes `totalPages`, maps rows
  to the contract shape, and after each successful mutation publishes a
  `todoEventSchema` event to `todo:<organizationId>`. Returns `null` for a
  missing row; the procedure converts that to the typed `errors.NOT_FOUND()`.
- **Procedures** are thin: `.use(authed).handler(({ context, input, errors }) => …)`.

### 5.6 Realtime

```ts
// realtime/publisher.ts
getTodoPublisher(): Publisher<Record<`todo:${string}`, TodoEvent>>
```

- Returns a `DurablePublisher` (from `@orpc/cloudflare`) when the Durable
  Object namespace binding is present in the Worker env, else a process-wide
  `MemoryPublisher` with `resume: { enabled: true }`.
- `todo.live`:
  ```ts
  async function* ({ context, signal, lastEventId }) {
    yield* getTodoPublisher().subscribe(`todo:${orgId}`, { signal, lastEventId });
  }
  ```
  The channel is derived from the session, never from input.
- **DO hosting:** first try exporting `DurablePublisherObject` from the Nitro
  `cloudflare-module` build. If Nitro cannot export it cleanly, deploy a
  separate minimal Worker `taman-realtime` exporting only the DO, bound from
  the main Worker via `durable_objects.bindings[].script_name`.

### 5.7 Menu

`menu.all` moves the logic of `routes/menu/all.get.ts` behind `authed`
(the old route was unauthenticated).

### 5.8 Removed

`routes/menu/all.get.ts`, `middleware/2.context.ts` (and its
`H3EventContext` augmentation), `lib/api.ts` (`defineApiHandler`,
`ApiEnvelope`), `lib/validate.ts` — each after confirming no remaining
importers.

Unchanged: `routes/api/auth/[...all].ts`, `routes/healthz`, `routes/readyz`,
`middleware/1.cors.ts`, the Nitro error-handler chain (still serves non-oRPC
routes).

## 6. Data & RBAC

- `packages/db-pg/src/schema/todo.schema.ts` → `todoTable`:
  `id` uuid (v7, app-generated), `organizationId` → `organization.id`
  (`on delete cascade`), `title` text not null, `completed` boolean default
  `false`, `createdBy` → `user.id` (`on delete set null`), timestamps via
  `generateTimestampColumns()`. Index on `(organizationId, createdAt)`.
- Drizzle migration generated with the existing `db:generate` flow.
- `apps/better-auth-back/scripts/seed-todos.ts` inserts ~100 todos into a
  given organization (mirrors `seed-admin.ts`; nx `seed:todos` target).
- `@taman/rbac`: `sharedStatements.todo = ['create','read','update','delete']`;
  `ownerRole` and `memberRole` both get all four; admin statements inherit via
  the shared statements.

## 7. Frontend (`apps/better-auth-front`)

### 7.1 Wiring

- `src/api/orpc.ts`: module singletons `client = createTamanClient({ baseUrl: apiUrl })`
  and `orpc = createTamanQueryUtils(client)`.
- `src/api/errors.ts`: `getErrors()` reads `ORPCError` (`message`,
  `data.code`). The global `QueryCache.onError` toast is unchanged.
- `getAllMenusApi` → `client.menu.all()`.
- Removed: `src/api/use-request.ts`, `src/api/domains/backstage/*` (incl.
  tests), relative imports into `packages/effects/request/src` — after
  grepping for other importers.

### 7.2 Examples

Registered under a new **oRPC** group in `router/routes/modules/dev/examples.ts`.

```
views/examples/orpc/
  plain/
    use-todos-plain.ts        client.todo.* + refs (list/page/filters, mutations, loading, error)
    use-todo-live-plain.ts    for await over client.todo.live(undefined, { signal, context: { retry: Infinity } })
    crud.vue  pagination.vue  live.vue
  query/
    use-todos-query.ts        queryOptions({ input: computed }) + keepPreviousData; mutationOptions +
                              invalidate orpc.todo.list.key() on success
    use-todo-live-query.ts    stream → applyTodoEvent(queryClient, event)
    crud.vue  pagination.vue  live.vue
  components/
    todo-form.vue  todo-table.vue  todo-pager.vue  todo-event-log.vue
```

- Both styles render the same components; only the composable differs.
- **CRUD:** create/edit via `@taman-core/form-ui`, delete via the existing
  dialog with confirmation; `NOT_FOUND` handled with `isDefinedError`.
- **Pagination:** `page` / `pageSize` / filters synced to the URL query;
  changing a filter resets `page` to 1.
- **Realtime:** plain shows an event log; query applies events to the cache —
  `created` / `removed` → invalidate `todo.list`; `updated` → `setQueryData`
  patch of the row in any cached list page. `applyTodoEvent` is a pure,
  exported function.
- UI: pohon-ui + existing shared components.

## 8. Publishing

- Both packages: remove `private`, set `publishConfig.access: "public"`,
  `license: "MIT"`, `repository` (with `directory`), `files: ["dist"]`,
  `version: "0.1.0"`, and a README with quick start.
- Build with tsdown (pattern of `internal/node-utils/tsdown.config.ts`): ESM +
  bundled `.d.ts`, `skipNodeModulesBundle`.
  - Contract entry: `src/index.ts`.
  - Request entries: `src/orpc.ts`, `src/orpc-query.ts` → `./orpc`, `./orpc-query`.
- `exports` resolve to `src/*.ts` inside the workspace (via a `development`
  condition or equivalent that the app's Vite/TS config picks up) and to
  `dist` for published consumers.
- `pnpm publish` rewrites `catalog:` / `workspace:` protocols.
- Versions in **lockstep**. Root script `release:api`: bump both (`bumpp`) →
  build → `publint` + `attw` → `pnpm -r publish --filter` both packages.
- `@orpc/*` pinned to a single version in the pnpm catalog. `@orpc/cloudflare`
  and `@orpc/publisher` are at 1.14.11 while core is 1.15.4, and
  `@orpc/cloudflare` pins `@orpc/client@1.14.11`; if mixing causes type
  conflicts, pin every `@orpc/*` to 1.14.11. The 2.0 beta is not used.

## 9. Testing & verification

Baseline first: record the currently failing tests (5 in form-ui/popup-ui) and
type errors (68 in the app) so regressions are judged against it.

| Layer | Test | Technique |
|---|---|---|
| Contract | pagination defaults/limits, `totalPages` helper, todo input rules | schema unit tests |
| Backend | `authed`: 401 → `UNAUTHORIZED`, no org → `ORG_REQUIRED`, context injected | oRPC `call()`, stubbed `resolveContext` |
| Backend | `TodoService`: org scoping passed to repo, `can()` denial, `null` → `NOT_FOUND`, publish on every mutation | fake repo + `MemoryPublisher` |
| Backend | `todo.live` yields published events, stops on abort | `MemoryPublisher` + `AbortController` |
| Round-trip | `RPCHandler` + router + `createTamanClient` with `fetch` → `handler.handle`, in-process | prefix, credentials, `Date` serialization, typed errors |
| Frontend | `applyTodoEvent` | pure-function unit test |
| Packaging | tarballs from `pnpm pack` installed in a scratch project outside the workspace; a client call type-checks | manual script |

Manual:

- Seed todos, exercise all six example pages against `nitro dev`.
- Two tabs: a mutation in one appears in the other (plain log and query table).
- Cloudflare: `nitro build --preset cloudflare-module` + `wrangler dev`;
  resolve DO hosting (§5.6); confirm `todo.live` events fan out through the DO.

Repo queries against a live Postgres are verified manually only; adding a
test-DB harness is out of scope.

## 10. Out of scope / follow-ups

- **OpenAPI for mobile:** add `.route({ method, path })` to contract procedures
  and mount `OpenAPIHandler` (`@orpc/openapi`) at `/api/v1/**` on the same
  router; generate the spec with `OpenAPIGenerator` for native clients.
- **Mobile auth:** better-auth `bearer` plugin; clients pass it via the
  `headers` option of `createTamanClient`.
- WebSocket link (`@orpc/client/websocket`).
- Redis / Upstash publishers.
- CI publish workflow.
- Production `wrangler` / Hyperdrive configuration beyond what the realtime
  check needs.
