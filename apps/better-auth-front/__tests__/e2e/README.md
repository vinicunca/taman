# Menu layout e2e (characterization)

These tests lock **current** `TamanMenu` behavior across admin layout modes before any Pohon/Akar rewrite. A full menu rewrite is **parked** until this suite is green and other features are not in flight.

## Prerequisites

1. **Director API** reachable at `VITE_DIRECTOR_URL` (default `http://localhost:8788`).
2. **Verified user** with access to demo routes (Dashboard, Demos nested menu, System).
3. Env vars (either naming works):

```bash
export E2E_EMAIL='you@example.com'
export E2E_PASSWORD='your-password'
# or
export TAMAN_E2E_EMAIL='...'
export TAMAN_E2E_PASSWORD='...'
```

Without credentials, menu specs **skip** instead of failing.

If port 5560 is already in use, stop that process or Playwright will fail to start the e2e dev server. Opt-in reuse: `E2E_REUSE_SERVER=1`.

## Run

From `apps/better-auth-front`:

```bash
pnpm test:e2e admin-menu-layouts.spec.ts admin-menu-a11y.spec.ts
```

Playwright starts Vite on port **5560** (`playwright.config.ts`), separate from the default dev port in `.env.development`.

## Helpers

| File                    | Role                                                           |
| ----------------------- | -------------------------------------------------------------- |
| `common/auth.ts`        | Email/password login via `PAuthForm`                           |
| `common/preferences.ts` | Patch `{namespace}-preferences` in `localStorage`, then reload |
| `common/menu.ts`        | Locators for sidebar/header/rail menus                         |

Layout changes use the same cache shape as `@taman/preferences` `PreferenceManager` (`StorageManager` + key `preferences`).

## What is intentionally not tested

- Arrow-key / roving tabindex menu behavior (see `admin-menu-a11y.spec.ts` baseline only)
- Pohon `NavigationMenu` or raw Akar primitives
