# `@taman/request`

An [ofetch](https://github.com/unjs/ofetch)-based request client that unwraps this project's `{ code, data, message }` response envelope. Framework-agnostic — no Vue or TanStack Query dependency lives in this package.

```ts
// apps/*/src/api/client.ts
export const api = createFetchClient({ baseURL: apiUrl });

const user = await api.request<User>(`/users/${id}`);
```

> Looking for `useApiQuery`/`useApiMutation`? That vue-query layer lives per-app now (e.g. `apps/better-auth-front/src/api/vue-query`), not in this package — see the Gotchas section below for why.

## Table of contents

- [Setup](#setup)
- [The base client](#the-base-client)
  - [Calling convention](#calling-convention)
  - [Errors (`ApiError`)](#errors-apierror)
  - [Escape hatch: `fetch`](#escape-hatch-fetch)
  - [Auth headers, retries, and other ofetch options](#auth-headers-retries-and-other-ofetch-options)
- [Gotchas](#gotchas)

## Setup

```ts
import { createFetchClient } from "@taman/request";

export const api = createFetchClient({ baseURL: apiUrl });
```

Create the client **once** per app and export it — every other module imports that instance, rather than calling `createFetchClient` again.

## The base client

Every call assumes the server responds with the envelope:

```ts
interface ApiEnvelope<T> {
  code: number; // `successCode` (default 0) = success
  data: T;
  message: string;
}
```

`code === successCode` resolves the call with `data`, typed as `T`. Anything else — a non-matching business code, an HTTP error, a network failure — throws a single `ApiError` (see below). Callers never see the envelope shape directly.

```ts
const api = createFetchClient({
  baseURL: "https://api.example.com",
  successCode: 0, // optional, this is the default
  // any other ofetch option: headers, timeout, retry, onRequest, onResponseError, ...
});
```

### Calling convention

`api.request` is the one envelope-aware entry point — there's no `.get`/`.post`/`.put` sugar. This mirrors ofetch's own convention, which mirrors native `fetch`: omit `method` for a `GET`, pass it explicitly for anything else.

```ts
const user = await api.request<User>("/users/1"); // GET
const page = await api.request<User[]>("/users", { query: { page: 2 } }); // GET, query params

const created = await api.request<User>("/users", {
  method: "POST",
  body: { name: "Asep" },
});
await api.request<User>(`/users/${id}`, { method: "PUT", body });
await api.request<User>(`/users/${id}`, {
  method: "PATCH",
  body: { name: "Euis" },
});
await api.request<void>(`/users/${id}`, { method: "DELETE" });
```

- Generic `<T>` is the **unwrapped** data type — you never write out the envelope.
- `options` is any per-call ofetch option (`method`, `body`, `query`, `headers`, `signal`, `timeout`, ...) except the ones the client owns (`responseType`, `parseResponse`).
- Query params go through ofetch's native `query` option — no `qs`, no manual serialization.

### Errors (`ApiError`)

Every failure — business, HTTP, or network — surfaces as one `ApiError`, so callers only ever `catch` one type:

```ts
class ApiError extends Error {
  code?: number; // business code from the envelope (undefined for transport errors)
  status?: number; // HTTP status (undefined for network errors)
  data?: unknown; // the raw response body, if any
  // message: envelope message, or the HTTP/network message as a fallback
  // cause: the underlying error, when normalized from a thrown failure
}
```

```ts
try {
  await api.request("/users", { method: "POST", body });
} catch (error) {
  if (error instanceof ApiError) {
    toast.error(error.message);
    if (error.code === 4001) {
      // business-specific handling
    }
  }
}
```

`status` and `code` being both `undefined` means a network/timeout/abort failure, not a server response.

### Escape hatch: `fetch`

`api.fetch` is the raw, configured ofetch instance — no envelope unwrapping at all. Use it for endpoints that don't return `{ code, data, message }` (third-party APIs, file downloads), or for methods the envelope-aware call doesn't support (`HEAD`):

```ts
const blob = await api.fetch<Blob>("/reports/export", { responseType: "blob" });
await api.fetch("/health", { method: "HEAD" });
```

`api.fetch` shares the same `baseURL` and options (including any `onRequest`/`onResponseError` hooks) as `api.request` — it just skips the envelope logic.

### Auth headers, retries, and other ofetch options

The client has **no built-in knowledge of auth**. Attach headers, refresh tokens, or retry logic through ofetch's own hooks, passed straight through `createFetchClient`:

```ts
export const api = createFetchClient({
  baseURL: apiUrl,
  onRequest({ options }) {
    options.headers.set("Authorization", `Bearer ${getToken()}`);
  },
  onResponseError({ response }) {
    if (response.status === 401) {
      // refresh / redirect to login
    }
  },
});
```

## Gotchas

- **The vue-query layer lives per-app, not here.** `useApiQuery`/`useApiMutation` (URL-first key derivation, body mapper, both bound via a `createApiQueryHelpers(client)` factory) started out as a `./vue-query` subpath of this package, then moved into `apps/better-auth-front/src/api/vue-query` — the composables are 100% generic, but this package is deliberately Vue/TanStack-free so any consumer that doesn't want that dependency isn't forced to carry it. If another app needs the same pattern, copy that folder (imports are just `@taman/request` + `@tanstack/vue-query`) rather than reaching across apps.
- **The envelope shape is fixed.** `{ code, data, message }` with `successCode` defaulting to `0` isn't configurable per instance — this client is built for this project's backend, not a generic wrapper. Endpoints that don't return this shape go through `api.fetch` instead.
- **`createFetchClient` is not a singleton.** Nothing stops you from calling it twice, but every part of an app should import the _same_ exported instance — two instances mean two auth-hook setups and, if you've also built a vue-query layer on top, two independent caches.
- **`HEAD` isn't available on `api.request`.** A `HEAD` response has no body, so envelope parsing would always fail; use `api.fetch(url, { method: "HEAD" })` instead.
- **No token/auth logic is built in.** If you're expecting axios-interceptor-style refresh-token handling out of the box, it isn't here — wire it through `onRequest`/`onResponseError` as shown above.
