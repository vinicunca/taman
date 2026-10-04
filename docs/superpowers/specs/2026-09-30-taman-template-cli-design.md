# Taman admin template + `create-taman` CLI — design

- **Date:** 2026-09-30
- **Status:** Approved in conversation; pending written-spec review
- **Base:** `main` @ `05140e0`
- **Scope:** sub-projects 1 (make taman template-shaped) and 3 (CLI + CI smoke
  test). Sub-project 2 (first npm release of `taman-core` / `taman-ui`) is a
  prerequisite. The ngibur rebuild gets its own spec later.

## 1. Goal

One command scaffolds a complete taman monorepo (web SPA, Nitro API on
Cloudflare, Postgres + drizzle, better-auth, RBAC, transactional email, nx)
that installs the published `@vinicunca/*` packages from npm.

First consumers:

1. **ngibur** (`/Users/praburangki/Dev/taman-biner/ngibur`) — rebuilt from
   scratch on the template; its business packages (ticketing schema, ticket
   rendering, domain constants) are re-added on top.
2. **An experimental vibe-coded app** on the same stack.

Success means:

- `pnpm create taman my-app` produces a project that installs, type-checks,
  builds (`web` + `api`) and passes its unit tests with no manual edits.
- The generated project carries its own name (`@my-app/*`, `apps/web`,
  `apps/api`) and contains no `@taman/`, no example gallery and no ngibur
  domain code.
- A taman change that breaks generated projects fails CI before merge.

## 2. Decisions

| Topic | Decision | Reason |
|---|---|---|
| Updates after generation | **Owned from then on** (shadcn-style). Only the npm packages (`taman-core`, `taman-ui`, `request`, `internal/*`) receive updates | Keeps the package surface small; matches the unstyled, consumer-owns-it model already chosen for `taman-ui` |
| Starting content | **Clean start**: auth, organizations/teams, profile, preferences, plus **todo** as the single reference feature across every layer. No example gallery | One clean end-to-end pattern is what a human or an AI copies well; a demo gallery is noise to delete |
| Naming | CLI asks for project name + npm scope; renames `@taman/*` → `@<scope>/*`; apps are `apps/web` and `apps/api` | Owned code should carry the project's name; neutral app names fit every consumer |
| Where the template lives | **The taman repo is the template.** `apps/web`, `apps/api` and the private packages are exactly what gets generated | No second copy to drift; the template is always the code taman runs and tests |
| How the gallery is excluded | Stays in `apps/web` under `views/examples/**` and `router/routes/modules/dev/examples.ts`; the manifest deletes it | Routes are glob-loaded from `modules/dev/**`, so deletion leaves nothing dangling. A separate playground app would duplicate bootstrap, auth and layouts |
| Generation rules | A `template.manifest.ts` at the taman repo root, read by the CLI from the downloaded snapshot | Versioned with the code it describes; changing generation needs no CLI release |
| Download | `giget` from `github:vinicunca/taman#<ref>` (repo is public, no token) | Tarball of committed files only; small, well-maintained dependency |
| Version locking | Default ref = the CLI's own release tag `create-taman@x.y.z`; `--ref` overrides (e.g. `main`) | What a CLI version generates is the exact code tested when it shipped |
| Published dependency versions | Read from the downloaded `package.json` of each published package, written as `^<version>` into the pnpm catalog; consumers use `catalog:` | Matches the repo's existing catalog convention; one place to bump |
| Rename strategy | One blanket rule `@taman/` → `@<scope>/`; every other rename is an explicit `{ file, from, to }` entry | A blanket `taman` replace would break `@vinicunca/taman-*` and component names like `TamanAuthForm` |
| Platform | Cloudflare stays the default (Nitro `cloudflare` preset, Durable Object realtime, email binding), behind the existing neutral interfaces | Both consumers deploy on Cloudflare; platform-agnostic rule is satisfied by the interfaces, not by removing the adapter |
| Emails | `feature/emails` (worktree `../taman-emails`, complete, based on `a41b7eb`) is rebased onto main and merged before the restructure | It is finished; merging first avoids moving files under an unmerged branch |

## 3. Repository layout (after sub-project 1)

```
apps/
  web/                 (was better-auth-front)  @taman/web
  api/                 (was better-auth-back)   @taman/api
packages/
  taman-core/          published
  taman-ui/            published
  request/             published
  create-taman/        new, published
  shell/               browser-only
    app-ui  layouts  access  composables  stores
    designs  locales  types  utils
  server/              backend-only
    db-pg  emails
  shared/              used by web and api
    api-contract  rbac  constants
internal/              published tooling (tsconfig, vite-config, node-utils, lint-configs)
template.manifest.ts   generation rules (taman repo only)
```

- `packages/effects/{access,composables}` move to `packages/shell/`.
  `packages/{designs,locales,stores,types,utils}` move to `packages/shell/`.
- `@vinicunca/taman-api-contract` (private) is renamed `@taman/api-contract`
  so every private package follows the single `@taman/` rename rule.
- `pnpm-workspace.yaml` `packages:` globs, tsconfig `extends`/`include`
  relative paths, `uno.config.ts` `configDeps`, and nx project names are
  updated for the moves.

### 3.1 Reference feature: todo

Todo leaves the gallery (`apps/web/src/views/examples/orpc/**`) and becomes
the documented example of one feature across every layer:

| Layer | Location |
|---|---|
| Permissions | `packages/shared/rbac` — `todo` statements |
| Schema | `packages/server/db-pg/src/schemas/todo.schema.ts` |
| Contract | `packages/shared/api-contract` — todo contract |
| API | `apps/api/server/domains/todo` + `server/rpc/procedures/todo.ts` + realtime Durable Object |
| Page | `apps/web/src/views/todo/**`, route in `router/routes/modules/todo.ts` |

The http / oRPC *demo* pages (pagination, plain vs query clients) stay in the
gallery and are stripped at generation.

### 3.2 ngibur leftovers removed from taman

Found on `main` @ `05140e0`:

- `packages/rbac/src/rbac.shared.ts`, `rbac.admin.ts`,
  `rbac.organizations.ts` — `talent`, `eventCredit`, `bookingTalent`
  statements and grants.
- `packages/db-pg/src/codes.ts` + `codes.test.ts` (ticket codes) and its
  export from `src/index.ts`.
- `packages/constants/src/types.ts` — `NgiburEnv`.
- `apps/better-auth-front/src/router/routes/routes.constants.ts` — `TALENT`.
- `apps/better-auth-back/server/domains/core/core.service.ts:36` — talent
  wording in a comment.
- `packages/taman-core/src/preferences/__tests__/__snapshots__/config.test.ts.snap`
  — `assets.ngibur.com` logo (stale snapshot; regenerate).

These are re-added in ngibur's own packages during the ngibur rebuild.

## 4. `create-taman` CLI

**Package:** `packages/create-taman`, Node ESM, built with tsdown, published
through the existing changesets pipeline. Runtime dependencies: `giget`,
`@clack/prompts`.

**Usage:** `pnpm create taman <dir>` or `npx create-taman <dir>`.

**Prompts** (skippable via flags or `--yes`):

- Project name → target folder and root `package.json` name.
- npm scope → defaults to the project name; validated against npm naming
  rules.

**Flags:** `--ref <git ref>`, `--no-install`, `--no-git`, `--yes`, and a
hidden `--from <dir>` (local source, for CI and development).

**Steps:**

1. Abort if the target folder exists and is not empty.
2. Fetch the source:
   - GitHub provider: `giget` at `github:vinicunca/taman#<ref>`.
   - Local provider (`--from`): `git archive HEAD` of the given checkout, so
     only committed files are used, exactly like a GitHub tarball.
3. Load `template.manifest.ts` from the fetched source and apply it (§5).
4. Write a fresh `README.md` (setup steps) and copy every `.env.example` to
   `.env`.
5. `git init` and an "Initial commit from create-taman" (unless `--no-git`).
6. `pnpm install` (unless `--no-install`).
7. Print next steps: `docker compose up -d`, `pnpm db:migrate`, `pnpm dev`.

**Errors:**

- Network failure or unknown ref: clear message; the target folder is
  removed if the CLI created it.
- Manifest safety-check error (§5): generation aborts and the folder is
  removed.
- `pnpm install` failure: the project is kept; the CLI prints the command to
  retry.

## 5. Generation manifest

`template.manifest.ts` exports a typed object. The CLI implements the
operations as pure functions over an in-memory file map; I/O happens only at
load and write.

Operations, applied in order:

1. **`remove`** — glob patterns deleted from the snapshot:
   - Published package sources: `packages/taman-core`, `packages/taman-ui`,
     `packages/request`, `packages/create-taman`, `internal/**`.
   - Repo-only files: `.github/**`, `.changeset/**`, `scripts/release/**`,
     `scripts/deploy/**`, `docs/superpowers/**`, `**/graphify-out/**`,
     `CLAUDE.md`, `template.manifest.ts`.
   - The gallery: `apps/web/src/views/examples/**`,
     `apps/web/src/router/routes/modules/dev/examples.ts`, and
     `apps/web/src/locales/langs/*/examples.json` plus any other locale file
     the plan confirms is referenced only from `views/examples/**`
     (candidate: `form.json`). The smoke test's type-check and build catch a
     wrong call.
2. **`publishedDeps`** — every `workspace:` dependency on a removed published
   package becomes `catalog:`, with `<name>: ^<version>` added to the
   `pnpm-workspace.yaml` catalog (version read from that package's
   `package.json` in the snapshot). `packages:` globs drop `internal/*`.
3. **`rename`**:
   - Blanket: `@taman/` → `@<scope>/` in text files
     (`.ts .vue .json .yaml .md .css .mjs`).
   - Explicit `{ file, from, to }` entries with `{{name}}` / `{{scope}}`
     placeholders, e.g. root `package.json` name, wrangler worker name in
     `apps/api/nitro.config.ts`, `VITE_APP_NAMESPACE`, docker-compose database
     name.
4. **`scripts`** — root `package.json` scripts removed (changeset, publint,
   release).
5. **`pnpm-lock.yaml`** — deleted; the first install writes a fresh one.

**Safety checks** after the operations:

- **Error:** any `workspace:` dependency whose target package is missing.
- **Warning:** any remaining `@taman/` occurrence.

## 6. Testing

- **Unit (vitest):** each manifest operation against a small fixture repo —
  glob removal, `workspace:` → `catalog:` rewrite with version lookup, both
  rename kinds, both safety checks. Prompt/flag parsing and the scope
  validator.
- **CI smoke test** — a new job in `.github/workflows/release.yml` next to
  `verify`, on every PR and push to `main`:
  1. Pack the published packages (as `verify` already does).
  2. Generate from the checkout with `--from . --yes --no-git` into a temp
     folder, scope `acme`, with published dependencies overridden to the
     packed tarballs (pnpm `overrides` with `file:`), so unpublished changes
     are tested before they reach npm.
  3. `pnpm install`, type-check every tsconfig, build `web` and `api`, run
     unit tests and lint.
  4. Assert the output contains no `@taman/`, no `views/examples`, and no
     `talent` / `ticket` identifiers.

## 7. Order of work

Each step is reviewable on its own; the user commits.

1. Remove the ngibur leftovers (§3.2).
2. Rebase `feature/emails` onto `main` in `../taman-emails` (expect
   conflicts in `pnpm-lock.yaml`, `server/lib/cors.ts`,
   `server/errors/error.utils.ts`, `server/realtime/publisher.ts`); re-run
   its verification; user reviews and merges.
3. Restructure (§3): directory moves, app renames, `@taman/api-contract`.
4. Promote todo into the reference feature (§3.1).
5. First npm release of `taman-core` and `taman-ui` (user publishes once
   locally, then `npm trust` per package).
6. Build `packages/create-taman` and `template.manifest.ts`, with unit tests.
7. Add the CI smoke test.
8. First `create-taman` release. Then: ngibur rebuild spec.

## 8. Out of scope

- Updating already-generated projects (no `taman update` / diff command).
- Optional modules or a `--with-examples` flag.
- A non-Cloudflare deployment adapter.
- Porting ngibur's business packages (ngibur rebuild spec).

## 9. Notes for the ngibur rebuild (later spec)

- Pick the reference branch first: ngibur is checked out on `feat/emails`;
  `feat/talent-domain-crud` is 40 commits ahead with more business code,
  and `main` has the terraform/CI work.
- Business code outside ngibur's `apps/`: `packages/db` (ticketing +
  talent schema, ticket codes), `packages/tickets-ui` (ticket email/PDF
  renderers), `packages/constants/src/ticketing.ts`, ngibur copy in
  `packages/locales`, and (on the talent branch) rbac statements.
- `infra/terraform/.r2-credentials` in ngibur is untracked and not
  gitignored.
