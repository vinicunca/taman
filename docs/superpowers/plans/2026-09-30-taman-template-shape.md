# Taman template shape — Implementation Plan (Plan 1 of 2)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the taman repo template-shaped: no ngibur code, emails merged, packages grouped into `shell/`, `server/`, `shared/`, apps renamed `web`/`api`, and todo promoted to a first-class reference feature — with the repo still building and passing its tests.

**Architecture:** Pure restructuring plus one feature move. Every cross-package reference already goes through `workspace:*` package names, so directory moves only touch a short list of path-based configs. The todo UI moves from the example gallery into `views/todo` with its own route module, locale namespace and home-path override, so it survives when Plan 2's generator deletes the gallery.

**Tech Stack:** pnpm 12 workspace + catalogs, nx, Vue 3 + Vite 8, Nitro 3 (Cloudflare preset), vitest 5, vue-tsc, drizzle, better-auth.

**Spec:** `/Users/praburangki/Dev/@vinicunca/taman/docs/superpowers/specs/2026-09-30-taman-template-cli-design.md` (§3, §3.1, §3.2, §7 steps 1–4). Plan 2 (`create-taman` + CI smoke test, §4–§6) is written after this plan lands.

## Global Constraints

- Work only in worktrees: `../taman-emails` (Task 1) and `../taman-template` on branch `feature/template-shape` (Tasks 2–6). Never edit, build or run dev servers in the main checkout `/Users/praburangki/Dev/@vinicunca/taman`; the user edits it and runs servers on :8788 / :5556. If you start servers, use :8799 (api) and :5601 (web).
- Private packages keep the `@taman/` scope. Published package names (`@vinicunca/taman-core`, `@vinicunca/taman-ui`, `@vinicunca/request`, `internal/*`) do not change.
- `@vinicunca/taman-api-contract` becomes `@taman/api-contract` and stays `"private": true`.
- Do **not** change the wrangler worker name `taman-better-auth-back` in `nitro.config.ts` (renaming creates a new Cloudflare worker); Plan 2's manifest renames it in generated projects.
- After this plan, no source file outside `docs/` may contain `talent`, `eventCredit`, `bookingTalent`, `ticket`, `Ngibur` or `ngibur` (case-insensitive), except `apps/*/src/api/errors.test.ts`-style sample strings that do not mention those words.
- Shell gotchas: `ls`, `ps`, `which` are aliased — use `/bin/ls`, `/bin/ps`. zsh does not word-split unquoted variables; list paths explicitly or use `$(echo $VAR)`.
- Commits go on the feature branch only, each ending with `Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>`. The user reviews and merges (squash allowed); never push, never merge into `main` yourself.
- Generated files the app build rewrites (`apps/*/components.d.ts`, `auto-imports.d.ts`) must be restored with `git checkout --` after verification builds unless the task intentionally changes them.

## Review Focus

1. **Gitignored env files are left behind by `git mv`.** Real `.env*` files are untracked, so after moving `apps/better-auth-*` and `packages/db-pg`, dev servers silently start with empty config. Expected: every env file exists at its new path. Pinned in Task 2 Step 1 (copy from main checkout) and Task 4 Step 5 (existence check).
2. **`uno.config.ts` `configDeps` pointing at a moved folder fails silently** (theme edits stop hot-reloading; no error). Expected: the path resolves to an existing directory. Pinned in Task 3 Step 6.
3. **Root scripts calling nx projects that no longer exist** (`dev:better-auth-front`, `db:generate` targeting a non-existent `db` project). Expected: every `nx run <project>:` in root `package.json` names a real project. Pinned in Task 4 Step 6.
4. **Locale drift between en-US and id-ID for the new `todo` namespace** shows raw keys to Indonesian users. Expected: identical key sets. Pinned in Task 5 Step 1 (test).
5. **Emails' generated templates going stale after the move** (the codegen reads paths relative to the package). Expected: `build:templates` produces no diff at the new location. Pinned in Task 3 Step 8.

---

## File Structure (end state)

```
apps/web/                      ← apps/better-auth-front   (@taman/web, nx: web)
apps/api/                      ← apps/better-auth-back    (@taman/api, nx: api)
packages/shell/access          ← packages/effects/access
packages/shell/composables     ← packages/effects/composables
packages/shell/designs         ← packages/designs
packages/shell/locales         ← packages/locales
packages/shell/stores          ← packages/stores
packages/shell/types           ← packages/types
packages/shell/utils           ← packages/utils
packages/shell/app-ui, layouts   (unchanged)
packages/server/db-pg          ← packages/db-pg
packages/server/emails         ← packages/emails (arrives via Task 1)
packages/shared/api-contract   ← packages/api-contract   (@taman/api-contract)
packages/shared/rbac           ← packages/rbac
packages/shared/constants      ← packages/constants
apps/web/src/views/todo/       ← views/examples/orpc/query/* + orpc/shared/*
apps/web/src/router/routes/modules/todo.ts   (new)
apps/web/src/locales/langs/{en-US,id-ID}/todo.json   (new)
```

---

### Task 1: Rebase and verify `feature/emails`

The emails branch (worktree `/Users/praburangki/Dev/@vinicunca/taman-emails`, branch `feature/emails`, 2 commits on `a41b7eb`) is complete. `git merge-tree` against `main` predicts one conflict: `pnpm-lock.yaml`.

**Files:**
- Modify (conflict resolution only): `pnpm-lock.yaml`

**Interfaces:**
- Produces: `packages/emails` (`@taman/emails`) on `main` after the user merges; later tasks move it to `packages/server/emails`.

- [ ] **Step 1: Confirm the worktree is clean and nothing is running in it**

Run:
```bash
cd /Users/praburangki/Dev/@vinicunca/taman-emails && git status --short && git log --oneline -3 && /bin/ps aux | grep taman-emails | grep -v grep
```
Expected: no status lines; top commit `feat(emails): add localized transactional email delivery`; no processes. If anything is running or dirty, stop and ask the user.

- [ ] **Step 2: Rebase onto main**

Run:
```bash
cd /Users/praburangki/Dev/@vinicunca/taman-emails && git rebase main
```
Expected: stops with `CONFLICT (content): Merge conflict in pnpm-lock.yaml`.

- [ ] **Step 3: Resolve the lockfile by regenerating it**

During a rebase, `--ours` is the branch being rebased onto (`main`). Take main's lockfile, then let pnpm add the emails dependencies:
```bash
cd /Users/praburangki/Dev/@vinicunca/taman-emails && git checkout --ours pnpm-lock.yaml && pnpm install --no-frozen-lockfile && git add pnpm-lock.yaml && GIT_EDITOR=true git rebase --continue
```
Expected: rebase completes (`Successfully rebased`). If a second conflict appears in any other file, stop and report it to the user — do not guess.

- [ ] **Step 4: Run the emails branch's own verification**

```bash
cd /Users/praburangki/Dev/@vinicunca/taman-emails && pnpm install --frozen-lockfile \
  && pnpm vitest run packages/emails \
  && pnpm exec tsc --noEmit -p packages/emails/tsconfig.json \
  && (cd apps/better-auth-back && npx vue-tsc --noEmit -p tsconfig.json) \
  && pnpm exec eslint packages/emails apps/better-auth-back/server apps/better-auth-back/nitro.config.ts \
  && pnpm --filter @taman/emails build:templates && git status --porcelain packages/emails/src/generated
```
Expected: all tests pass, both type-checks exit 0, eslint reports nothing, and the final `git status` prints nothing.

- [ ] **Step 5: Run the full unit suite and compare to the known baseline**

```bash
cd /Users/praburangki/Dev/@vinicunca/taman-emails && pnpm test:unit 2>&1 | grep -E "^ FAIL|Tests " | sort -u
```
Expected: the only failures are these 8 known ones (anything else is a regression — stop and report):
```
apps/better-auth-back/server/errors/error.utils.test.ts > jsonError > carries CORS headers so a browser can actually read the error
packages/taman-core/src/composables/__tests__/use-sortable.test.ts
packages/taman-core/src/preferences/__tests__/config.test.ts > defaultPreferences immutability test > should not modify the config object
packages/taman-ui/src/form/__tests__/form-integration.test.ts > … delays validation loading to avoid flashing for fast validators
packages/taman-ui/src/form/__tests__/form-integration.test.ts > … filters native zod formats from nested default extraction
packages/taman-ui/src/form/__tests__/form-integration.test.ts > … ignores stale asynchronous validation results
packages/taman-ui/src/form/__tests__/form-validation-loading.test.ts > … keeps the field and submit action busy across repeated async schema validation
packages/taman-ui/src/popup/dialog/__tests__/dialog.test.ts > taman dialog > mounts an open modal directly in the main content
packages/utils/src/helpers/__tests__/generate-routes-frontend.test.ts > generateRoutesByFrontend > should not corrupt the source route table across repeated generations
```
(The `use-sortable` entry is a suite-level failure; count 8 failed tests.)

- [ ] **Step 6: Hand off to the user (gate)**

Stop and tell the user: "`feature/emails` is rebased onto main and verified; review it in `../taman-emails`, then merge with `git merge --ff-only feature/emails` from your main checkout." **Do not start Task 2 until the user confirms `main` contains the emails commits** (`git -C /Users/praburangki/Dev/@vinicunca/taman log --oneline -3` shows `feat(emails): …`).

---

### Task 2: Create the template worktree and remove ngibur leftovers

**Files:**
- Create: `packages/rbac/src/rbac.shared.test.ts`
- Modify: `packages/rbac/src/rbac.shared.ts`, `packages/rbac/src/rbac.admin.ts`, `packages/rbac/src/rbac.organizations.ts`
- Delete: `packages/db-pg/src/codes.ts`, `packages/db-pg/src/codes.test.ts`, `packages/constants/src/types.ts`
- Modify: `packages/db-pg/src/index.ts`, `packages/constants/src/index.ts`, `apps/better-auth-front/src/router/routes/routes.constants.ts`, `apps/better-auth-back/server/domains/core/core.service.ts:36`
- Modify (regenerate): `packages/taman-core/src/preferences/__tests__/__snapshots__/config.test.ts.snap`

**Interfaces:**
- Produces: `sharedStatements` with exactly one resource, `todo: ['create', 'read', 'update', 'delete']`. `ROUTE_ORDER` without `TALENT`.

- [ ] **Step 1: Create the worktree, install, and copy env files**

```bash
cd /Users/praburangki/Dev/@vinicunca/taman && git worktree add -b feature/template-shape ../taman-template main
cd ../taman-template && pnpm install --frozen-lockfile
for f in apps/better-auth-back/.env apps/better-auth-front/.env apps/better-auth-front/.env.analyze apps/better-auth-front/.env.development apps/better-auth-front/.env.production packages/db-pg/.env; do [ -f "../taman/$f" ] && cp "../taman/$f" "$f" && echo "copied $f"; done
```
Expected: worktree created on `feature/template-shape`; install succeeds; each existing env file is reported as copied.

- [ ] **Step 2: Record the type-check baseline**

Build the web app once (generates the `.pohon-ui` types vue-tsc needs), restore generated files, then type-check every tsconfig:
```bash
cd /Users/praburangki/Dev/@vinicunca/taman-template
(cd apps/better-auth-front && pnpm build >/dev/null 2>&1); git checkout -- apps/better-auth-front/components.d.ts apps/better-auth-front/auto-imports.d.ts 2>/dev/null; rm -f apps/better-auth-front/dist.zip
: > /tmp/taman-template-types-baseline.txt
for t in $(find apps packages -name tsconfig.json -not -path '*/node_modules/*' -not -path '*/dist/*'); do d=$(dirname $t); (cd $d && npx vue-tsc --noEmit -p tsconfig.json 2>&1 | grep 'error TS' | sed "s|^|$d/|") >> /tmp/taman-template-types-baseline.txt; done
(cd apps/better-auth-front && pnpm typecheck 2>&1 | grep 'error TS' | sed 's|^|app: |') >> /tmp/taman-template-types-baseline.txt
sort -u -o /tmp/taman-template-types-baseline.txt /tmp/taman-template-types-baseline.txt; cat /tmp/taman-template-types-baseline.txt
```
Expected: only errors under `taman-ui/src/tabs/` and `layout-core-tabbar.vue` (the user's tabs work). If others appear, record them — later tasks must not add to this list.

- [ ] **Step 3: Write the failing rbac test**

Create `packages/rbac/src/rbac.shared.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { adminRoles } from './rbac.admin';
import { ORGANIZATION_ROLES, USER_ROLES } from './rbac.constants';
import { organizationRoles } from './rbac.organizations';
import { sharedStatements } from './rbac.shared';

describe('shared statements', () => {
  it('declares only the template reference resource', () => {
    expect(Object.keys(sharedStatements)).toEqual(['todo']);
  });

  it('grants roles nothing beyond better-auth defaults and todo', () => {
    const roles = [
      adminRoles[USER_ROLES.ADMIN],
      organizationRoles[ORGANIZATION_ROLES.OWNER],
      organizationRoles[ORGANIZATION_ROLES.MEMBER],
    ];

    for (const role of roles) {
      expect(Object.keys(role.statements)).not.toContain('talent');
      expect(Object.keys(role.statements)).not.toContain('eventCredit');
      expect(Object.keys(role.statements)).not.toContain('bookingTalent');
    }
  });
});
```

- [ ] **Step 4: Run it to verify it fails**

Run: `cd /Users/praburangki/Dev/@vinicunca/taman-template && pnpm vitest run packages/rbac`
Expected: FAIL — `expected [ 'talent', 'eventCredit', 'bookingTalent', 'todo' ] to deeply equal [ 'todo' ]`.

- [ ] **Step 5: Remove the ngibur statements and grants**

Replace the whole of `packages/rbac/src/rbac.shared.ts` with:
```ts
/**
 * Resource statements shared by the platform-admin and organization access
 * controls, declared once so the two role sets cannot drift apart.
 *
 * `as const` matters: better-auth infers the allowed action names from these
 * literal tuples, so widening them to `string[]` silently turns every
 * `authorize({ todo: [...] })` call into an unchecked one.
 *
 * Role statements answer "may this role do X" and cannot express "the row
 * belongs to you". Ownership rules stay explicit checks in the calling
 * service; only the role half lives here.
 */
export const sharedStatements = {
  todo: ['create', 'read', 'update', 'delete'],
} as const;

/** Every resource/action pair a caller can be asked about. */
export type PermissionRequest = {
  [Resource in keyof typeof sharedStatements]?: Array<
    (typeof sharedStatements)[Resource][number]
  >;
};
```

In `packages/rbac/src/rbac.admin.ts`, replace:
```ts
  ...defaultAdminAc.statements,
  talent: ['create', 'update', 'delete', 'manage'],
  eventCredit: ['create', 'delete', 'read'],
  bookingTalent: ['create', 'update', 'delete', 'read'],
  todo: ['create', 'read', 'update', 'delete'],
```
with:
```ts
  ...defaultAdminAc.statements,
  todo: ['create', 'read', 'update', 'delete'],
```

In `packages/rbac/src/rbac.organizations.ts`, replace:
```ts
  ...ownerAc.statements,
  talent: ['create', 'update', 'delete', 'manage'],
  eventCredit: ['create', 'delete', 'read'],
  bookingTalent: ['create', 'update', 'delete', 'read'],
  todo: ['create', 'read', 'update', 'delete'],
```
with:
```ts
  ...ownerAc.statements,
  todo: ['create', 'read', 'update', 'delete'],
```
and replace:
```ts
  ...memberAc.statements,
  // No `manage`: a member may only edit the talent linked to their own user.
  talent: ['update'],
  // Crediting/booking is an org-management action, not a self-serve one.
  eventCredit: [],
  bookingTalent: [],
  // Todos are collaborative: every member may manage them.
  todo: ['create', 'read', 'update', 'delete'],
```
with:
```ts
  ...memberAc.statements,
  // Todos are collaborative: every member may manage them.
  todo: ['create', 'read', 'update', 'delete'],
```

- [ ] **Step 6: Run the rbac tests to verify they pass**

Run: `pnpm vitest run packages/rbac`
Expected: PASS (both `rbac.shared.test.ts` tests and the existing `rbac.todo.test.ts`).

- [ ] **Step 7: Remove the ticket codes, `NgiburEnv`, `TALENT`, and the talent comment**

```bash
cd /Users/praburangki/Dev/@vinicunca/taman-template
git rm -q packages/db-pg/src/codes.ts packages/db-pg/src/codes.test.ts packages/constants/src/types.ts
```
Replace `packages/db-pg/src/index.ts` with:
```ts
export * from './client';
export * from './schemas';
export * from './types';
```
Replace `packages/constants/src/index.ts` with:
```ts
export * from './core';
export * from '@vinicunca/taman-core/constants';
```
In `apps/better-auth-front/src/router/routes/routes.constants.ts`, delete the line `  TALENT: 101,`.
In `apps/better-auth-back/server/domains/core/core.service.ts`, replace:
```ts
   * Answers "may this role do X" and nothing else. Row-level questions (is
   * this talent linked to me, is it inside my organization) cannot be
```
with:
```ts
   * Answers "may this role do X" and nothing else. Row-level questions (is
   * this row mine, is it inside my organization) cannot be
```

- [ ] **Step 8: Regenerate the stale preferences snapshot**

The snapshot still holds an old ngibur logo URL, timezone and menu defaults; the current `defaultPreferences` is correct.
```bash
pnpm vitest run --dom packages/taman-core/src/preferences/__tests__/config.test.ts -u
grep -c ngibur packages/taman-core/src/preferences/__tests__/__snapshots__/config.test.ts.snap
```
Expected: 1 snapshot updated; grep prints `0`.

- [ ] **Step 9: Verify no leftovers and nothing else broke**

```bash
git grep -n -i "talent\|eventCredit\|bookingTalent\|ticket\|ngibur" -- apps packages internal ':!**/graphify-out/**'
(cd packages/db-pg && npx vue-tsc --noEmit -p tsconfig.json) && (cd packages/constants && npx vue-tsc --noEmit -p tsconfig.json) && (cd packages/rbac && npx vue-tsc --noEmit -p tsconfig.json) && (cd apps/better-auth-back && npx vue-tsc --noEmit -p tsconfig.json)
(cd apps/better-auth-front && pnpm typecheck 2>&1 | grep 'error TS' | grep -v '/tabs/\|layout-core-tabbar')
pnpm test:unit 2>&1 | grep -E "Tests "
```
Expected: the grep prints nothing; the four type-checks exit 0; the app type-check prints nothing; tests report **7** failed (the `config.test.ts` snapshot failure from the Task 1 list is now fixed).

- [ ] **Step 10: Lint and commit**

```bash
npx eslint packages/rbac/src packages/db-pg/src packages/constants/src apps/better-auth-front/src/router/routes/routes.constants.ts apps/better-auth-back/server/domains/core/core.service.ts
git add -A packages/rbac packages/db-pg packages/constants packages/taman-core/src/preferences/__tests__/__snapshots__ apps/better-auth-front/src/router/routes/routes.constants.ts apps/better-auth-back/server/domains/core/core.service.ts
git commit -m "chore: remove ngibur leftovers from the template

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```
Expected: eslint reports nothing; one commit.

---

### Task 3: Group packages into `shell/`, `server/`, `shared/`

**Files:**
- Move (git mv): see the File Structure table (all `packages/*` rows).
- Delete: `packages/effects/README.md`
- Modify: `pnpm-workspace.yaml` (`packages:` globs), `apps/better-auth-front/uno.config.ts:11`, `packages/server/db-pg/project.json` (`$schema`, `sourceRoot`, `cwd`, `envFile`), `packages/server/db-pg/gen-auth-schema.ts:6`, `packages/shared/api-contract/package.json` (`repository.directory`), `scripts/release/check-api-packages.sh:9`, `.vscode/settings.json:157`

**Interfaces:**
- Consumes: `packages/emails` from Task 1.
- Produces: new package directories; package names unchanged in this task.

- [ ] **Step 1: Move the directories**

```bash
cd /Users/praburangki/Dev/@vinicunca/taman-template
mkdir -p packages/server packages/shared
git mv packages/effects/access packages/shell/access
git mv packages/effects/composables packages/shell/composables
git mv packages/designs packages/shell/designs
git mv packages/locales packages/shell/locales
git mv packages/stores packages/shell/stores
git mv packages/types packages/shell/types
git mv packages/utils packages/shell/utils
git mv packages/db-pg packages/server/db-pg
git mv packages/emails packages/server/emails
git mv packages/api-contract packages/shared/api-contract
git mv packages/rbac packages/shared/rbac
git mv packages/constants packages/shared/constants
git rm -q packages/effects/README.md
[ -f ../taman/packages/db-pg/.env ] && cp ../taman/packages/db-pg/.env packages/server/db-pg/.env
rm -rf packages/effects packages/db-pg packages/designs packages/locales packages/stores packages/types packages/utils packages/api-contract packages/rbac packages/constants packages/emails
/bin/ls packages packages/shell packages/server packages/shared
```
Expected: `packages/` lists `request server shared shell taman-core taman-ui`; `shell/` lists `access app-ui composables designs layouts locales stores types utils`; `server/` lists `db-pg emails`; `shared/` lists `api-contract constants rbac`. (The `rm -rf` only clears leftover untracked `node_modules`/`graphify-out`; tracked files were already moved.)

- [ ] **Step 2: Update workspace globs**

In `pnpm-workspace.yaml`, replace:
```yaml
  - packages/effects/*
  - packages/shell/*
  - packages/business/*
```
with:
```yaml
  - packages/shell/*
  - packages/server/*
  - packages/shared/*
```
(`packages/business/*` pointed at a directory that does not exist.)

- [ ] **Step 3: Fix db-pg's nx project paths and the auth-schema import**

In `packages/server/db-pg/project.json`:
- `"$schema": "../../node_modules/nx/schemas/project-schema.json"` → `"$schema": "../../../node_modules/nx/schemas/project-schema.json"`
- every `"packages/db-pg` → `"packages/server/db-pg` (covers `sourceRoot`, all `cwd`, all `envFile`):
```bash
sed -i '' 's#"\.\./\.\./node_modules/nx#"../../../node_modules/nx#; s#"packages/db-pg#"packages/server/db-pg#g' packages/server/db-pg/project.json
grep -n "packages/\|schema" packages/server/db-pg/project.json
```
In `packages/server/db-pg/gen-auth-schema.ts`, replace `from '../../apps/better-auth-back/server/auth';` with `from '../../../apps/better-auth-back/server/auth';`.

- [ ] **Step 4: Fix the remaining path references**

- `apps/better-auth-front/uno.config.ts`: `getAllConfigFiles('../../packages/designs/src')` → `getAllConfigFiles('../../packages/shell/designs/src')`.
- `packages/shared/api-contract/package.json`: `"directory": "packages/api-contract"` → `"directory": "packages/shared/api-contract"`.
- `scripts/release/check-api-packages.sh`: `PACKAGES=(packages/api-contract packages/request)` → `PACKAGES=(packages/shared/api-contract packages/request)`.
- `.vscode/settings.json`: `"packages/locales/src/langs",` → `"packages/shell/locales/src/langs",`.

- [ ] **Step 5: Reinstall so pnpm relinks the moved packages**

```bash
pnpm install --no-frozen-lockfile && git diff --stat pnpm-lock.yaml
```
Expected: install succeeds; the lockfile diff only renames importer keys (`packages/db-pg` → `packages/server/db-pg`, etc.).

- [ ] **Step 6: Check path-based configs resolve (Review Focus 2)**

```bash
node -e "const fs=require('fs');for (const p of ['packages/shell/designs/src','packages/server/db-pg/src','apps/better-auth-back/server/auth']) { if(!fs.existsSync(p)) { console.error('MISSING', p); process.exit(1) } } console.log('paths ok')"
git grep -n "packages/effects\|packages/designs\|packages/locales\|packages/stores\|packages/types\|packages/utils\|packages/db-pg\|packages/emails\|packages/api-contract\|packages/rbac\|packages/constants" -- ':!docs/**' ':!**/graphify-out/**' ':!pnpm-lock.yaml' ':!**/README.md'
```
Expected: `paths ok`; the grep prints nothing (fix any hit it finds the same way as Step 4).

- [ ] **Step 7: Type-check, build, test**

```bash
(cd apps/better-auth-front && pnpm build 2>&1 | grep -E "error|✓ built"); git checkout -- apps/better-auth-front/components.d.ts apps/better-auth-front/auto-imports.d.ts 2>/dev/null; rm -f apps/better-auth-front/dist.zip
: > /tmp/taman-template-types-now.txt
for t in $(find apps packages -name tsconfig.json -not -path '*/node_modules/*' -not -path '*/dist/*'); do d=$(dirname $t); (cd $d && npx vue-tsc --noEmit -p tsconfig.json 2>&1 | grep 'error TS' | sed "s|^|$d/|") >> /tmp/taman-template-types-now.txt; done
(cd apps/better-auth-front && pnpm typecheck 2>&1 | grep 'error TS' | sed 's|^|app: |') >> /tmp/taman-template-types-now.txt
sort -u /tmp/taman-template-types-now.txt | grep -v '/tabs/\|layout-core-tabbar'
pnpm test:unit 2>&1 | grep -E "Tests "
```
Expected: `✓ built`; the filtered type list is empty; tests report 7 failed (same names as Task 2).

- [ ] **Step 8: Verify emails codegen at its new location (Review Focus 5)**

```bash
pnpm --filter @taman/emails build:templates && git status --porcelain packages/server/emails/src/generated && pnpm vitest run packages/server/emails
```
Expected: `git status` prints nothing; emails tests pass.

- [ ] **Step 9: Lint and commit**

```bash
npx eslint apps/better-auth-front/uno.config.ts packages/server/db-pg/gen-auth-schema.ts pnpm-workspace.yaml
node .github/scripts/verify-packages.mjs 2>&1 | tail -7
git add -A packages pnpm-workspace.yaml pnpm-lock.yaml apps/better-auth-front/uno.config.ts scripts/release/check-api-packages.sh .vscode/settings.json
git commit -m "refactor: group private packages into shell, server and shared

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```
Expected: eslint clean; verify prints ✓ for all 7 published packages; one commit.

---

### Task 4: Rename the apps and `@taman/api-contract`

**Files:**
- Move (git mv): `apps/better-auth-front` → `apps/web`, `apps/better-auth-back` → `apps/api`
- Modify: `apps/web/package.json` (name, api-contract dep), `apps/api/package.json` (name, api-contract dep), `packages/shared/api-contract/package.json` (name), `packages/shared/api-contract/README.md`, `apps/web/project.json`, `apps/api/project.json`, root `package.json` scripts, `eslint.config.ts:10`, `unocss.config.ts:6`, `packages/server/db-pg/gen-auth-schema.ts`, `packages/server/db-pg/tsconfig.json` (comment), `scripts/release/check-api-packages.sh:33`, `apps/api/scripts/seed-admin.ts`, `apps/api/scripts/seed-todos.ts`, `apps/web/src/auth/auth.client.ts:14` (comment), `apps/web/__tests__/e2e/README.md:25`
- Modify (imports): the 18 source files importing `@vinicunca/taman-api-contract`

**Interfaces:**
- Produces: package names `@taman/web`, `@taman/api`, `@taman/api-contract`; nx projects `web`, `api`; root scripts `dev:web`, `dev:api`.

- [ ] **Step 1: Move the apps and their untracked env/state**

```bash
cd /Users/praburangki/Dev/@vinicunca/taman-template
git mv apps/better-auth-front apps/web
git mv apps/better-auth-back apps/api
for f in .env .env.analyze .env.development .env.production; do [ -f "../taman/apps/better-auth-front/$f" ] && cp "../taman/apps/better-auth-front/$f" "apps/web/$f"; done
[ -f ../taman/apps/better-auth-back/.env ] && cp ../taman/apps/better-auth-back/.env apps/api/.env
rm -rf apps/better-auth-front apps/better-auth-back
/bin/ls apps
```
Expected: `apps` lists `api web`.

- [ ] **Step 2: Rename packages and nx projects**

```bash
sed -i '' 's#"name": "@taman/better-auth-front"#"name": "@taman/web"#' apps/web/package.json
sed -i '' 's#"name": "@taman/better-auth-back"#"name": "@taman/api"#' apps/api/package.json
sed -i '' 's#"name": "@vinicunca/taman-api-contract"#"name": "@taman/api-contract"#' packages/shared/api-contract/package.json
sed -i '' 's#"@vinicunca/taman-api-contract": "workspace:\*"#"@taman/api-contract": "workspace:*"#' apps/web/package.json apps/api/package.json
sed -i '' 's#"name": "better-auth-front"#"name": "web"#; s#apps/better-auth-front#apps/web#g' apps/web/project.json
sed -i '' 's#"name": "better-auth-back"#"name": "api"#; s#apps/better-auth-back#apps/api#g' apps/api/project.json
grep -n '"name"\|api-contract' apps/web/package.json apps/api/package.json packages/shared/api-contract/package.json apps/web/project.json apps/api/project.json
```
Expected: names `@taman/web`, `@taman/api`, `@taman/api-contract`; nx names `web`, `api`; both apps depend on `"@taman/api-contract": "workspace:*"`.

- [ ] **Step 3: Rewrite api-contract imports**

```bash
FILES=$(git grep -l "@vinicunca/taman-api-contract" -- apps packages scripts ':!**/graphify-out/**')
echo "$FILES"
for f in $(echo $FILES); do sed -i '' 's#@vinicunca/taman-api-contract#@taman/api-contract#g' "$f"; done
git grep -n "@vinicunca/taman-api-contract" -- ':!docs/**' ':!**/graphify-out/**' ':!pnpm-lock.yaml'
```
Expected: the list includes the 18 source files plus `scripts/release/check-api-packages.sh` and `packages/shared/api-contract/README.md`; the final grep prints nothing.

- [ ] **Step 4: Update path references to the apps**

- `eslint.config.ts`: `configPath: './apps/better-auth-front/uno.config.ts',` → `configPath: './apps/web/uno.config.ts',`
- `unocss.config.ts`: `import tamanUnoConfig from './apps/better-auth-front/uno.config';` → `import tamanUnoConfig from './apps/web/uno.config';`
- `packages/server/db-pg/gen-auth-schema.ts`: `'../../../apps/better-auth-back/server/auth'` → `'../../../apps/api/server/auth'`
- `packages/server/db-pg/tsconfig.json`: comment `better-auth-back sources` → `apps/api sources`
- `apps/api/scripts/seed-admin.ts` and `apps/api/scripts/seed-todos.ts`: `nx run better-auth-back:` → `nx run api:`, and `apps/better-auth-back/.env` → `apps/api/.env`
- `apps/web/src/auth/auth.client.ts`: comment `` (`apps/better-auth-back`) `` → `` (`apps/api`) ``
- `apps/web/__tests__/e2e/README.md`: ``From `apps/better-auth-front`:`` → ``From `apps/web`:``

Then:
```bash
git grep -n "better-auth-front\|better-auth-back" -- ':!docs/**' ':!**/graphify-out/**' ':!pnpm-lock.yaml' ':!apps/web/components.d.ts' ':!apps/web/auto-imports.d.ts'
```
Expected: the only remaining hit is `apps/api/nitro.config.ts` — `name: 'taman-better-auth-back',` (kept on purpose; see Global Constraints).

- [ ] **Step 5: Fix root scripts and confirm env files moved (Review Focus 1)**

In root `package.json` `scripts`:
- `"dev:better-auth-front": "pnpm nx run better-auth-front:dev",` → `"dev:web": "pnpm nx run web:dev",`
- `"dev:better-auth-back": "pnpm nx run better-auth-back:dev",` → `"dev:api": "pnpm nx run api:dev",`
- delete `"preview": "pnpm --filter @taman/director preview",` (no such package)
- `"db:generate": "pnpm nx run db:generate",` → `"db:generate": "pnpm nx run db-pg:generate",`
- `"db:generate:auth": "pnpm nx run db:generate:auth",` → `"db:generate:auth": "pnpm nx run db-pg:generate:auth",`

Then:
```bash
pnpm install --no-frozen-lockfile >/dev/null
check() { if [ -f "../taman/$1" ]; then [ -f "$2" ] && echo "ok $2" || echo "MISSING $2"; fi; }
check apps/better-auth-back/.env apps/api/.env
check apps/better-auth-front/.env apps/web/.env
check apps/better-auth-front/.env.development apps/web/.env.development
check apps/better-auth-front/.env.production apps/web/.env.production
check apps/better-auth-front/.env.analyze apps/web/.env.analyze
check packages/db-pg/.env packages/server/db-pg/.env
```
Expected: every printed line starts with `ok` (files absent from the main checkout print nothing).

- [ ] **Step 6: Check root scripts only name real nx projects (Review Focus 3)**

```bash
node -e "
const { execSync } = require('child_process');
const projects = new Set(JSON.parse(execSync('pnpm nx show projects --json', { encoding: 'utf8' })));
const scripts = require('./package.json').scripts;
const bad = Object.entries(scripts).flatMap(([k, v]) => [...v.matchAll(/nx run ([\w-]+):/g)].map((m) => m[1]).filter((p) => !projects.has(p)).map((p) => k + ' -> ' + p));
if (bad.length) { console.error(bad.join('\n')); process.exit(1) } console.log('nx scripts ok');
"
```
Expected: `nx scripts ok`.

- [ ] **Step 7: Type-check, build, test, lint**

```bash
(cd apps/web && pnpm build 2>&1 | grep -E "error|✓ built"); git checkout -- apps/web/components.d.ts apps/web/auto-imports.d.ts 2>/dev/null; rm -f apps/web/dist.zip
: > /tmp/taman-template-types-now.txt
for t in $(find apps packages -name tsconfig.json -not -path '*/node_modules/*' -not -path '*/dist/*'); do d=$(dirname $t); (cd $d && npx vue-tsc --noEmit -p tsconfig.json 2>&1 | grep 'error TS' | sed "s|^|$d/|") >> /tmp/taman-template-types-now.txt; done
(cd apps/web && pnpm typecheck 2>&1 | grep 'error TS' | sed 's|^|app: |') >> /tmp/taman-template-types-now.txt
sort -u /tmp/taman-template-types-now.txt | grep -v '/tabs/\|layout-core-tabbar'
pnpm test:unit 2>&1 | grep -E "Tests "
npx eslint eslint.config.ts unocss.config.ts packages/server/db-pg/gen-auth-schema.ts apps/api/scripts apps/web/src/auth/auth.client.ts $(git diff --name-only HEAD -- 'apps/**/*.ts' 'apps/**/*.vue' | tr '\n' ' ')
```
Expected: `✓ built`; filtered type list empty; 7 failed tests (the `error.utils.test.ts` path now reads `apps/api/...`); eslint clean.

- [ ] **Step 8: Commit**

```bash
git add -A apps packages package.json pnpm-lock.yaml eslint.config.ts unocss.config.ts scripts
git commit -m "refactor: rename apps to web and api, api-contract to @taman scope

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 5: Promote todo to the reference feature

The six todo pages live in the gallery (`apps/web/src/views/examples/orpc/{plain,query}`). The **vue-query** variant becomes the reference feature at `/todos`; the **plain-client** variant stays in the gallery as a demo and imports the shared todo pieces from their new home. Plan 2 deletes the gallery; nothing outside it may import from it.

**Files:**
- Move (git mv): `apps/web/src/views/examples/orpc/query/{crud.vue,pagination.vue,live.vue,apply-todo-event.ts,apply-todo-event.test.ts,use-todos-query.ts}` → `apps/web/src/views/todo/`; `apps/web/src/views/examples/orpc/shared/*` → `apps/web/src/views/todo/shared/`
- Create: `apps/web/src/router/routes/modules/todo.ts`, `apps/web/src/router/routes/todo-routes.test.ts`, `apps/web/src/locales/langs/en-US/todo.json`, `apps/web/src/locales/langs/id-ID/todo.json`
- Modify: `apps/web/src/router/routes/index.ts`, `apps/web/src/router/routes/routes.constants.ts`, `apps/web/src/router/routes/modules/dev/examples.ts`, `apps/web/src/preferences.ts`, `apps/web/src/locales/langs/{en-US,id-ID}/examples.json`, `apps/web/src/views/examples/orpc/plain/{crud.vue,live.vue,pagination.vue,use-todos-plain.ts}`, `apps/web/src/views/examples/http/shared/product-list-params.ts:5`, `apps/web/src/views/todo/{crud.vue,pagination.vue,live.vue,use-todos-query.ts}` (imports), `packages/server/db-pg/src/schemas/todo.schema.ts:7`, `apps/api/scripts/seed-todos.ts:3`

**Interfaces:**
- Consumes: `mergeRouteModules(routeModules: Record<string, unknown>): Array<RouteRecordRaw>` from `@taman/utils`; `ROUTE_ORDER` from `routes.constants.ts`; `$t` from `#/locales`.
- Produces: default export `Array<RouteRecordRaw>` from `modules/todo.ts` with root route `{ name: 'Todos', path: '/todos', redirect: '/todos/manage' }` and children `manage` (`TodoManage`), `list` (`TodoList`), `live` (`TodoLive`); `ROUTE_ORDER.TODO = 101`; `overridesPreferences.app.defaultHomePath === '/todos/manage'`.

- [ ] **Step 1: Write the failing tests**

Create `apps/web/src/router/routes/todo-routes.test.ts`:
```ts
import { describe, expect, it, vi } from 'vitest';
import enTodo from '#/locales/langs/en-US/todo.json';
import idTodo from '#/locales/langs/id-ID/todo.json';
import { overridesPreferences } from '#/preferences';

vi.mock('#/locales', () => ({ $t: (key: string) => key }));
vi.mock('./core', () => ({ coreRoutes: [] }));

describe('todo reference feature routes', () => {
  it('registers /todos with manage, list and live pages', async () => {
    const { default: todoRoutes } = await import('./modules/todo');
    const [root] = todoRoutes;

    expect(root?.path).toBe('/todos');
    expect(root?.redirect).toBe('/todos/manage');
    expect(root?.children?.map((route) => route.path)).toEqual(['manage', 'list', 'live']);
  });

  it('loads route modules outside the dev gallery', async () => {
    const { accessRoutes } = await import('./index');

    expect(accessRoutes.map((route) => route.name)).toContain('Todos');
  });

  it('lands on the todo page after login', () => {
    expect(overridesPreferences.app?.defaultHomePath).toBe('/todos/manage');
  });

  it('has the same todo copy keys in every language', () => {
    expect(Object.keys(idTodo).sort()).toEqual(Object.keys(enTodo).sort());
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `cd /Users/praburangki/Dev/@vinicunca/taman-template && pnpm vitest run --dom apps/web/src/router/routes/todo-routes.test.ts`
Expected: FAIL — cannot resolve `#/locales/langs/en-US/todo.json` / `./modules/todo`.

- [ ] **Step 3: Move the todo files**

```bash
cd /Users/praburangki/Dev/@vinicunca/taman-template/apps/web/src/views
mkdir -p todo
for f in crud.vue pagination.vue live.vue apply-todo-event.ts apply-todo-event.test.ts use-todos-query.ts; do git mv examples/orpc/query/$f todo/$f; done
git mv examples/orpc/shared todo/shared
/bin/ls examples/orpc todo todo/shared
```
Expected: `examples/orpc` lists only `plain` (the empty `query` dir is gone or empty — `rmdir examples/orpc/query` if it remains); `todo` lists the six files plus `shared`; `todo/shared` lists the nine shared files.

- [ ] **Step 4: Fix imports**

```bash
cd /Users/praburangki/Dev/@vinicunca/taman-template/apps/web/src/views
sed -i '' "s#from '\.\./shared/#from './shared/#g" todo/crud.vue todo/pagination.vue todo/live.vue todo/use-todos-query.ts
sed -i '' "s#from '\.\./shared/#from '\#/views/todo/shared/#g" examples/orpc/plain/crud.vue examples/orpc/plain/live.vue examples/orpc/plain/pagination.vue examples/orpc/plain/use-todos-plain.ts
sed -i '' "s#from '\.\./\.\./orpc/shared/todo-list-params'#from '\#/views/todo/shared/todo-list-params'#" examples/http/shared/product-list-params.ts
cd .. && git grep -n "\.\./shared/\|orpc/shared\|orpc/query" -- views router
```
Expected: the final grep prints nothing. (Todo files inside `todo/shared/` import each other with `./`, which stays valid.)

- [ ] **Step 5: Add the route module, route order, and loader glob**

In `apps/web/src/router/routes/routes.constants.ts`, add `  TODO: 101,` after `  DASHBOARD: 100,`.

Create `apps/web/src/router/routes/modules/todo.ts`:
```ts
import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';
import { ROUTE_ORDER } from '../routes.constants';

/**
 * Reference feature: one resource across every layer (rbac → schema →
 * contract → procedure → page). Copy this module when adding a feature.
 */
const routes: Array<RouteRecordRaw> = [
  {
    meta: {
      icon: 'lucide:list-todo',
      order: ROUTE_ORDER.TODO,
      title: $t('todo.title'),
    },
    name: 'Todos',
    path: '/todos',
    redirect: '/todos/manage',
    children: [
      {
        name: 'TodoManage',
        path: 'manage',
        component: () => import('#/views/todo/crud.vue'),
        meta: { title: $t('todo.manage') },
      },
      {
        name: 'TodoList',
        path: 'list',
        component: () => import('#/views/todo/pagination.vue'),
        meta: { title: $t('todo.list') },
      },
      {
        name: 'TodoLive',
        path: 'live',
        component: () => import('#/views/todo/live.vue'),
        meta: { title: $t('todo.live') },
      },
    ],
  },
];

export default routes;
```

In `apps/web/src/router/routes/index.ts`, replace:
```ts
const devRouteFiles = import.meta.glob('./modules/dev/**/*.ts', {
  eager: true,
});
```
with:
```ts
/** Feature routes: every `./modules/*.ts` file (not nested folders). */
const routeModuleFiles = import.meta.glob('./modules/*.ts', {
  eager: true,
});

const devRouteFiles = import.meta.glob('./modules/dev/**/*.ts', {
  eager: true,
});
```
then replace:
```ts
const devRoutes: Array<RouteRecordRaw> = mergeRouteModules(devRouteFiles);
```
with:
```ts
const devRoutes: Array<RouteRecordRaw> = mergeRouteModules(devRouteFiles);

const moduleRoutes: Array<RouteRecordRaw> = mergeRouteModules(routeModuleFiles);
```
and replace:
```ts
const accessRoutes = [
  ...devRoutes,
  ...staticRoutes,
];
```
with:
```ts
const accessRoutes = [
  ...moduleRoutes,
  ...devRoutes,
  ...staticRoutes,
];
```

- [ ] **Step 6: Remove the query-variant routes and copy from the gallery**

In `apps/web/src/router/routes/modules/dev/examples.ts`, delete the three route objects named `OrpcQueryCrudExample`, `OrpcQueryPaginationExample` and `OrpcQueryLiveExample` (each is a `{ name, path, component, meta }` block pointing at `#/views/examples/orpc/query/...`).

In both `apps/web/src/locales/langs/en-US/examples.json` and `apps/web/src/locales/langs/id-ID/examples.json`, delete the `queryCrud`, `queryPagination` and `queryLive` keys inside `orpc`.

- [ ] **Step 7: Add the todo locale namespace and home path**

Create `apps/web/src/locales/langs/en-US/todo.json`:
```json
{
  "title": "Todos",
  "manage": "Manage",
  "list": "Browse",
  "live": "Realtime"
}
```
Create `apps/web/src/locales/langs/id-ID/todo.json`:
```json
{
  "title": "Tugas",
  "manage": "Kelola",
  "list": "Telusuri",
  "live": "Realtime"
}
```
In `apps/web/src/preferences.ts`, replace:
```ts
  app: {
    name: import.meta.env.VITE_APP_TITLE,
  },
```
with:
```ts
  app: {
    // Land on the reference feature; the published default `/dashboard` has no page here.
    defaultHomePath: '/todos/manage',
    name: import.meta.env.VITE_APP_TITLE,
  },
```

- [ ] **Step 8: Stop calling todo an example**

- `packages/server/db-pg/src/schemas/todo.schema.ts:7`: ` * Example resource for the oRPC CRUD / pagination / realtime demos.` → ` * Reference resource: the pattern every new feature copies (CRUD, pagination, realtime).`
- `apps/api/scripts/seed-todos.ts:3`: reword `examples have data` to `the todo pages have data` (keep the rest of the sentence).

- [ ] **Step 9: Run the tests to verify they pass**

```bash
cd /Users/praburangki/Dev/@vinicunca/taman-template
pnpm vitest run --dom apps/web/src/router/routes/todo-routes.test.ts apps/web/src/views/todo
```
Expected: PASS — the four new tests plus the moved `apply-todo-event.test.ts` and `shared/todo-list-params.test.ts`.

- [ ] **Step 10: Confirm nothing outside the gallery imports it**

```bash
git grep -n "views/examples" -- apps/web/src ':!apps/web/src/views/examples/**' ':!apps/web/src/router/routes/modules/dev/examples.ts'
```
Expected: prints nothing.

- [ ] **Step 11: Type-check, build, test, lint**

```bash
(cd apps/web && pnpm build 2>&1 | grep -E "error|✓ built"); git checkout -- apps/web/components.d.ts apps/web/auto-imports.d.ts 2>/dev/null; rm -f apps/web/dist.zip
(cd apps/web && pnpm typecheck 2>&1 | grep 'error TS' | grep -v '/tabs/\|layout-core-tabbar')
pnpm test:unit 2>&1 | grep -E "Tests "
npx eslint apps/web/src/router apps/web/src/views/todo apps/web/src/views/examples/orpc apps/web/src/views/examples/http/shared/product-list-params.ts apps/web/src/preferences.ts apps/web/src/locales/langs packages/server/db-pg/src/schemas/todo.schema.ts apps/api/scripts/seed-todos.ts
```
Expected: `✓ built`; no type errors; 7 failed tests (same names), total up by 4; eslint clean.

- [ ] **Step 12: Commit**

```bash
git add -A apps/web apps/api/scripts/seed-todos.ts packages/server/db-pg/src/schemas/todo.schema.ts
git commit -m "feat(web): promote todo to the reference feature at /todos

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 6: Docs, graph refresh, and final verification

**Files:**
- Modify: `packages/taman-ui/src/form/README.md:48`, `packages/shared/api-contract/README.md` (if Task 4 left any old path), `tasks/plan.md:263` (path only), root `CLAUDE.md` only if it names moved paths (it does not today — leave it)
- Regenerate: `graphify-out/` via `graphify update .`

- [ ] **Step 1: Fix remaining path mentions in READMEs**

```bash
cd /Users/praburangki/Dev/@vinicunca/taman-template
git grep -n "better-auth-front\|better-auth-back\|packages/effects\|packages/designs\|packages/locales\|packages/stores\|packages/types\|packages/utils\|packages/db-pg\|packages/api-contract\|packages/rbac\|packages/constants\|taman-api-contract" -- '**/README.md' tasks
```
For each hit, replace the old path/name with the new one from the File Structure table (`apps/web`, `apps/api`, `packages/shell/…`, `packages/server/…`, `packages/shared/…`, `@taman/api-contract`). Do not edit `docs/superpowers/**` (historical plans and specs).

- [ ] **Step 2: Full verification**

```bash
(cd apps/web && pnpm build 2>&1 | grep -E "error|✓ built"); git checkout -- apps/web/components.d.ts apps/web/auto-imports.d.ts 2>/dev/null; rm -f apps/web/dist.zip
: > /tmp/taman-template-types-now.txt
for t in $(find apps packages -name tsconfig.json -not -path '*/node_modules/*' -not -path '*/dist/*'); do d=$(dirname $t); (cd $d && npx vue-tsc --noEmit -p tsconfig.json 2>&1 | grep 'error TS' | sed "s|^|$d/|") >> /tmp/taman-template-types-now.txt; done
(cd apps/web && pnpm typecheck 2>&1 | grep 'error TS' | sed 's|^|app: |') >> /tmp/taman-template-types-now.txt
sort -u /tmp/taman-template-types-now.txt | grep -v '/tabs/\|layout-core-tabbar'
pnpm test:unit 2>&1 | grep -E "^ FAIL|Tests " | sort -u
node .github/scripts/verify-packages.mjs 2>&1 | tail -7
git grep -n -i "talent\|eventCredit\|bookingTalent\|ticket\|ngibur" -- apps packages internal ':!**/graphify-out/**'
```
Expected: `✓ built`; empty type list; exactly the 7 known failures (paths updated to `apps/api`, `packages/shell/utils`); verify ✓ for all 7 published packages; the ngibur grep prints nothing.

- [ ] **Step 3: Refresh the knowledge graph and commit**

```bash
graphify update .
git add -A '**/README.md' tasks graphify-out apps/*/graphify-out packages/**/graphify-out 2>/dev/null
git commit -m "docs: update paths after the template restructure

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
git log --oneline main..HEAD
```
Expected: four commits on `feature/template-shape` (Tasks 2–5) plus this one.

- [ ] **Step 4: Hand off**

Tell the user: branch `feature/template-shape` in `../taman-template` is ready for review; list the 5 commits and the verification results; remind them to copy their `.env` files to the new paths in their own checkout after merging (`apps/web/.env*`, `apps/api/.env`, `packages/server/db-pg/.env`) and to run `pnpm install`. Plan 2 (`create-taman` + CI smoke test) is written next.
