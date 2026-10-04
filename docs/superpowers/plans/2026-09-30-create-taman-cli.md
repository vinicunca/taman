# create-taman CLI + template smoke test — Implementation Plan (Plan 2 of 2)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `pnpm create taman my-app` produces a renamed, working taman monorepo, and CI proves on every PR that a generated project installs, type-checks, builds, tests and lints.

**Architecture:** A new published package `packages/create-taman` downloads a tagged snapshot of this repo (giget) or archives a local checkout (`git archive`), then applies `template.manifest.ts` — which lives at the repo root and travels with the snapshot — as pure functions over an in-memory file map: remove paths, move published packages to npm catalog versions, explicit renames, the `@taman/` scope rename, root script removal, safety checks. A CI job generates a project from the checkout with published packages packed from the same commit.

**Tech Stack:** Node ≥ 22.18 (native TypeScript type stripping loads the manifest), pnpm 12 catalogs, tsdown, vitest 5, `giget` ^3.3.1, `@clack/prompts` ^1.8.1, GitHub Actions.

**Spec:** `/Users/praburangki/Dev/@vinicunca/taman/docs/superpowers/specs/2026-09-30-taman-template-cli-design.md` (§4 CLI, §5 manifest, §6 testing, §7 steps 6–8). Plan 1 (`docs/superpowers/plans/2026-09-30-taman-template-shape.md`) is merged.

## Global Constraints

- Work in a worktree: `git worktree add -b feature/create-taman ../taman-cli main` from `/Users/praburangki/Dev/@vinicunca/taman`. Never edit, build or run servers in the main checkout (the user runs :8788 / :5556 there). Copy env files with `for f in apps/web/.env apps/web/.env.development apps/web/.env.production apps/web/.env.analyze apps/api/.env packages/server/db-pg/.env; do [ -f "../taman/$f" ] && cp "../taman/$f" "$f"; done`.
- Do **not** touch the user's in-progress tabs work: `packages/taman-ui/src/tabs/**` and `packages/shell/layouts/src/core/tabbar/layout-core-tabbar.vue`. Its known problems (one TS2339 `styleType`, one unused `props`, and `vue/max-attributes-per-line` formatting) are allow-listed in the smoke script and nowhere else.
- `create-taman` runtime dependencies are exactly `giget` and `@clack/prompts` (spec §4). Everything else uses `node:` built-ins.
- Package names: the CLI is `create-taman` (unscoped, so `pnpm create taman` resolves it). Private packages stay `@taman/*`. Published names do not change.
- The manifest must contain no runtime imports: only `import type`, `export default { … } satisfies TemplateManifest`. Node strips the types and runs it.
- Generated projects must never contain `@taman/`, `views/examples`, `talent`, `ticket`, `ngibur` (case-insensitive).
- Commits go on `feature/create-taman` only, each ending with `Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>`; redirect `git commit` output to `/dev/null` (lefthook prints large banners). Never push, merge or publish.
- Shell: `ls`/`ps`/`which` are aliased — use `/bin/ls`, `/bin/ps`; zsh does not word-split unquoted variables.
- Known repo-wide test failures (not regressions, all in published packages that generated projects do not contain): `use-sortable` suite, 3× `form-integration`, `form-validation-loading`, `dialog`. After Task 1 the full suite has exactly these 5 failing tests (6 lines in the FAIL list counting the suite).

## Review Focus

1. **A manifest that drifts from the code it describes** (a renamed file, a changed string an explicit rename targets). Expected: generation fails loudly naming the entry, never silently skips it. Pinned in Task 6 (`applyExplicitRenames` error tests) and Task 9 (real-manifest dry run).
2. **Executable bits lost when writing the generated tree** (`*.sh` scripts called directly by nx). Expected: modes preserved. Pinned in Task 4 (`writeFileMap` mode test) and Task 7 (integration test).
3. **Target folder handling**: a non-empty folder must be refused untouched; a failed generation must not leave a half-written folder the CLI created. Pinned in Task 7.
4. **User-typed scope forms** (`@acme`, `acme/`, `Acme`). Expected: `@acme`/`acme/` normalise to `acme`; uppercase is rejected with a clear message. Pinned in Task 8.
5. **A generated project that only works on the author's machine** (missing env files, lefthook needing git, catalog entry for an unpublished version). Expected: the CI smoke test installs and runs everything from a clean temp folder with `CI=true`. Pinned in Task 10.

---

## File Structure

```
packages/create-taman/
  package.json, tsconfig.json, tsdown.config.ts, README.md
  src/
    types.ts            TemplateManifest, TemplateRename, FileMap, GenerateNames, ApplyResult
    index.ts            public exports (types only + applyManifest)
    glob.ts             globToRegExp, matchesAny
    file-map.ts         decodeFile, readFileMap, writeFileMap (keeps file modes)
    json.ts             readJson, writeJson
    workspace-yaml.ts   addCatalogEntries, removeWorkspacePackages
    remove.ts           removeFiles
    published-deps.ts   listPackages, rewritePublishedDeps
    rename.ts           fillPlaceholders, applyExplicitRenames, renameScope
    scripts.ts          removeRootScripts
    apply.ts            applyManifest, findLeftovers
    names.ts            validateName, normalizeScope, toNames
    env.ts              addEnvFiles
    readme.ts           renderReadme
    sources.ts          fetchFromGithub, fetchFromLocal
    generate.ts         generateProject
    cli.ts              parseCliArgs, main
    bin.ts              #!/usr/bin/env node entry
    __tests__/*.test.ts
template.manifest.ts                     generation rules (repo root)
.github/scripts/template-smoke.mjs       CI smoke test
apps/web/.env.example, apps/web/.env.development.example, apps/web/.env.production.example
apps/api/.env.example, packages/server/db-pg/.env.example
```

---

### Task 1: Fix the two defects that ship to generated projects

`generateRoutesByFrontend` mutates the caller's static route table (swaps in the 403 component and sets `hideInMenu` on the original objects), so after a low-privilege user's session, an admin logging in within the same page load gets 403 pages and hidden menus. The `error.utils` CORS test fails because nitro's runtime config is empty under vitest.

**Files:**
- Modify: `packages/shell/utils/src/helpers/generate-routes-frontend.ts`
- Modify: `packages/shell/utils/src/helpers/__tests__/generate-routes-frontend.test.ts` (replace the last test)
- Modify: `apps/api/server/errors/error.utils.test.ts`

**Interfaces:**
- Produces: `generateRoutesByFrontend(routes, roles, forbiddenComponent?)` — same signature; returns new route objects and never mutates `routes`.

- [ ] **Step 1: Create the worktree and baseline**

```bash
cd /Users/praburangki/Dev/@vinicunca/taman && git worktree add -b feature/create-taman ../taman-cli main
cd ../taman-cli && pnpm install --frozen-lockfile >/dev/null
for f in apps/web/.env apps/web/.env.development apps/web/.env.production apps/web/.env.analyze apps/api/.env packages/server/db-pg/.env; do [ -f "../taman/$f" ] && cp "../taman/$f" "$f"; done
pnpm test:unit 2>&1 | grep -E "^ FAIL|Tests " | sort -u
```
Expected: 7 failed — the 5 listed in Global Constraints plus `error.utils.test.ts` and `generate-routes-frontend.test.ts`.

- [ ] **Step 2: Replace the obsolete route test with the real regression**

In `packages/shell/utils/src/helpers/__tests__/generate-routes-frontend.test.ts`, replace the whole `it('should not corrupt the source route table across repeated generations', …)` block (the last test in the file) with:
```ts
  it('never mutates the source routes, so a later generation with more access is unaffected', async () => {
    const originalComponent = () => Promise.resolve({ default: {} });
    const routes = [
      {
        component: originalComponent,
        meta: { authority: ['admin', 'user'] },
        path: '/dashboard',
        children: [
          { component: originalComponent, meta: { authority: ['admin'] }, path: '/dashboard/overview' },
        ],
      },
    ] as unknown as Array<RouteRecordRaw>;

    await generateRoutesByFrontend(routes, ['user'], forbiddenComponent);
    const asAdmin = await generateRoutesByFrontend(routes, ['admin'], forbiddenComponent);
    const overview = asAdmin[0]?.children?.[0];

    expect(overview?.component).toBe(originalComponent);
    expect(overview?.meta?.hideInMenu).toBeUndefined();
    expect(routes[0]?.children?.[0]?.component).toBe(originalComponent);
    expect(routes[0]?.children?.[0]?.meta?.hideInMenu).toBeUndefined();
  });
```
(`forbiddenComponent` is already declared in the enclosing `describe`.)

- [ ] **Step 3: Run it to verify it fails**

Run: `pnpm vitest run --dom packages/shell/utils/src/helpers/__tests__/generate-routes-frontend.test.ts`
Expected: FAIL — `overview?.component` is the forbidden component.

- [ ] **Step 4: Copy each route before changing it**

In `packages/shell/utils/src/helpers/generate-routes-frontend.ts`, replace:
```ts
  return mapTree(routes, (route) => {
    if (!hasAuthority(route, roles) && forbiddenComponent) {
      route.component = forbiddenComponent;
      if (!menuHasVisibleWithForbidden(route)) {
        if (route.meta) {
          route.meta.hideInMenu = true;
        }
      }
    }
    return route;
  });
```
with:
```ts
  return mapTree(routes, (route) => {
    // Copy before changing anything: `routes` is the app's static route table,
    // and mutating it would leak one user's restrictions into the next login.
    const result = {
      ...route,
      meta: route.meta ? { ...route.meta } : route.meta,
    } as RouteRecordRaw;

    if (!hasAuthority(route, roles) && forbiddenComponent) {
      result.component = forbiddenComponent;
      if (!menuHasVisibleWithForbidden(route) && result.meta) {
        result.meta.hideInMenu = true;
      }
    }
    return result;
  });
```

- [ ] **Step 5: Run the route tests to verify they pass**

Run: `pnpm vitest run --dom packages/shell/utils`
Expected: PASS (all tests in the package).

- [ ] **Step 6: Give the CORS test a trusted origin**

In `apps/api/server/errors/error.utils.test.ts`, replace the first two lines:
```ts
import { describe, expect, it } from 'vitest';
import { jsonError } from './error.utils';
```
with:
```ts
import { describe, expect, it, vi } from 'vitest';
import { jsonError } from './error.utils';

// Nitro's runtime config is empty outside a server; supply the allow-list.
vi.mock('nitro/runtime-config', () => ({
  useRuntimeConfig: () => ({ trustedOrigins: 'http://localhost:5556' }),
}));
```

- [ ] **Step 7: Verify, lint, commit**

```bash
pnpm vitest run --dom apps/api/server/errors packages/shell/utils
(cd apps/api && npx vue-tsc --noEmit -p tsconfig.json) && (cd packages/shell/utils && npx vue-tsc --noEmit -p tsconfig.json)
npx eslint packages/shell/utils/src/helpers apps/api/server/errors
pnpm test:unit 2>&1 | grep -E "Tests "
git add packages/shell/utils apps/api/server/errors/error.utils.test.ts
git commit -m "fix(utils): stop route generation from mutating the route table

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>" >/dev/null 2>&1
```
Expected: both test files pass; type-checks exit 0; eslint clean; full suite reports **5 failed**.

---

### Task 2: Make template code lint-clean

Generated projects get linted in CI, so the ts/vue code that ships must pass `eslint`. 169 errors exist today; all but 6 are auto-fixable (`vue/max-attributes-per-line`, `ts/array-type`, import order).

**Files:**
- Modify (autofix): tracked `*.ts`/`*.vue` under `apps/`, `packages/shell/`, `packages/server/`, `packages/shared/`, `scripts/` — except `packages/shell/layouts/src/core/tabbar/layout-core-tabbar.vue`
- Modify (by hand): `apps/api/scripts/seed-admin.ts:13`, `apps/web/__tests__/e2e/common/layout.ts:1`, `packages/shell/access/src/accessible.ts:1`, `packages/shell/layouts/src/core/content/use-content-spinner.ts:1`, `packages/shell/locales/src/i18n.ts:40`

- [ ] **Step 1: List the files and autofix**

```bash
cd /Users/praburangki/Dev/@vinicunca/taman-cli
git ls-files 'apps/**/*.ts' 'apps/**/*.vue' 'packages/shell/**/*.ts' 'packages/shell/**/*.vue' 'packages/server/**/*.ts' 'packages/shared/**/*.ts' 'scripts/**/*.ts' \
  | grep -v graphify-out | grep -v 'packages/shell/layouts/src/core/tabbar/layout-core-tabbar.vue' > /tmp/template-lint-files.txt
npx eslint --fix $(cat /tmp/template-lint-files.txt | tr '\n' ' ') eslint.config.ts vitest.config.ts unocss.config.ts --no-warn-ignored 2>&1 | grep -E "^/|  error " | sed 's#.*/taman-cli/##'
```
Expected: the remaining errors are exactly the five `Definition for rule 'sonar/…' was not found` lines.

- [ ] **Step 2: Fix the rest by hand**

- The `sonar` ESLint plugin is not installed, so disable comments naming its rules are themselves errors. Delete these comment lines:
  - `apps/api/scripts/seed-admin.ts`: `// eslint-disable-next-line sonar/no-hardcoded-passwords`
  - `apps/web/__tests__/e2e/common/layout.ts`: `/* eslint-disable sonar/no-nested-functions */`
  - `packages/shell/access/src/accessible.ts`: `/* eslint-disable sonar/no-nested-functions */`
  - `packages/shell/layouts/src/core/content/use-content-spinner.ts`: `/* eslint-disable sonar/no-invariant-returns */` (line 1; confirm the exact rule name in the file)
  - `packages/shell/locales/src/i18n.ts`: `// eslint-disable-next-line sonar/super-linear-regex`

- [ ] **Step 3: Verify lint, types, tests, build**

```bash
npx eslint $(cat /tmp/template-lint-files.txt | tr '\n' ' ') eslint.config.ts vitest.config.ts unocss.config.ts --no-warn-ignored
(cd apps/web && pnpm build 2>&1 | grep -E " error|✓ built"); git checkout -- apps/web/components.d.ts apps/web/auto-imports.d.ts 2>/dev/null; rm -f apps/web/dist.zip
for t in $(find apps packages -name tsconfig.json -not -path '*/node_modules/*' -not -path '*/dist/*'); do (cd $(dirname $t) && npx vue-tsc --noEmit -p tsconfig.json 2>&1 | grep 'error TS'); done | sort -u | grep -v '/tabs/\|layout-core-tabbar'
pnpm test:unit 2>&1 | grep -E "Tests "
```
Expected: eslint prints nothing and exits 0; `✓ built`; no type errors outside the tabs files; 5 failed tests.

- [ ] **Step 4: Commit**

```bash
git add -A apps packages/shell packages/server packages/shared scripts eslint.config.ts vitest.config.ts unocss.config.ts
git commit -m "style: make template code lint-clean

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>" >/dev/null 2>&1
```

---

### Task 3: Add `.env.example` files

A generated project gets its `.env` files by copying these (spec §4 step 4). `.gitignore` already allows `.env.example` and `.env.*.example`. Values are safe defaults for local development — no secrets.

**Files:**
- Create: `apps/web/.env.example`, `apps/web/.env.development.example`, `apps/web/.env.production.example`, `apps/api/.env.example`, `packages/server/db-pg/.env.example`

**Interfaces:**
- Produces: exact strings Task 9's manifest renames: `VITE_APP_TITLE=Taman`, `VITE_APP_NAMESPACE=taman` (web `.env.example`) and `taman_db` (api and db-pg).

- [ ] **Step 1: Write the files**

`apps/web/.env.example`:
```
# Shown in the browser tab and the loading screen
VITE_APP_TITLE=Taman
# Prefix for this app's browser storage keys; unique per project
VITE_APP_NAMESPACE=taman
# Encrypts persisted store state; replace for production
VITE_APP_STORE_SECURE_KEY=change-me-in-production
```
`apps/web/.env.development.example`:
```
VITE_PORT=5556
VITE_BASE=/
VITE_API_URL=http://localhost:8788
VITE_NITRO_MOCK=false
VITE_DEVTOOLS=true
VITE_INJECT_APP_LOADING=true
```
`apps/web/.env.production.example`:
```
VITE_BASE=/
# Public URL of apps/api
VITE_API_URL=https://api.example.com
# none, brotli, gzip (comma-separated)
VITE_COMPRESS=none
VITE_PWA=false
# hash or history
VITE_ROUTER_HISTORY=hash
VITE_INJECT_APP_LOADING=true
VITE_ARCHIVER=false
```
`apps/api/.env.example`:
```
# Matches docker-compose.yml (`docker compose up -d`)
NITRO_DATABASE_URL=postgresql://postgres:postgres@localhost:5437/taman_db
# Comma-separated web origins allowed to call the API
NITRO_TRUSTED_ORIGINS=http://localhost:5556
NITRO_BASE_URL=http://localhost:8788
NITRO_APP_URL=http://localhost:5556
# At least 32 random characters, e.g. `openssl rand -base64 32`
NITRO_BETTER_AUTH_SECRET=replace-with-a-random-string-of-32-plus-characters
NITRO_GOOGLE_CLIENT_ID=
NITRO_GOOGLE_CLIENT_SECRET=
NITRO_EMAIL_FROM=no-reply@example.com
NITRO_EMAIL_FROM_NAME=Taman
```
`packages/server/db-pg/.env.example`:
```
DATABASE_URL=postgresql://postgres:postgres@localhost:5437/taman_db
```

- [ ] **Step 2: Verify every runtime key is covered, then commit**

```bash
node -e "
const fs=require('fs');
const keys=(f)=>fs.readFileSync(f,'utf8').split('\n').filter(l=>/^[A-Z_]+=/.test(l)).map(l=>l.split('=')[0]);
const cfg=fs.readFileSync('apps/api/nitro.config.ts','utf8').match(/runtimeConfig: \{([\s\S]*?)\n  \}/)[1];
const need=[...cfg.matchAll(/^\s+(\w+):/gm)].map(m=>'NITRO_'+m[1].replace(/[A-Z]/g,c=>'_'+c).toUpperCase());
const have=keys('apps/api/.env.example'); const miss=need.filter(k=>!have.includes(k));
if(miss.length){console.error('missing',miss);process.exit(1)} console.log('api keys ok:', need.length);
"
git check-ignore apps/web/.env.example apps/api/.env.example packages/server/db-pg/.env.example apps/web/.env.development.example apps/web/.env.production.example; echo "ignored-check rc=$?"
git add apps/web/.env.example apps/web/.env.development.example apps/web/.env.production.example apps/api/.env.example packages/server/db-pg/.env.example
git commit -m "chore: add env examples for generated projects

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>" >/dev/null 2>&1
```
Expected: `api keys ok: 9`; `git check-ignore` prints nothing and `rc=1` (none ignored).

---

### Task 4: `create-taman` package, file map and glob matching

**Files:**
- Create: `packages/create-taman/package.json`, `tsconfig.json`, `tsdown.config.ts`, `src/types.ts`, `src/glob.ts`, `src/file-map.ts`, `src/json.ts`, `src/remove.ts`, `src/index.ts`
- Create tests: `src/__tests__/glob.test.ts`, `src/__tests__/file-map.test.ts`, `src/__tests__/remove.test.ts`
- Modify: `pnpm-workspace.yaml` (catalog: `'@clack/prompts': ^1.8.1`, `giget: ^3.3.1`), `pnpm-lock.yaml`

**Interfaces:**
- Produces (in `src/types.ts`):
```ts
export interface TemplateRename { file: string; from: string; to: string }
export interface TemplateManifest {
  remove: Array<string>;
  workspacePackages: Array<string>;
  scripts: Array<string>;
  scopeFrom: string;
  rename: Array<TemplateRename>;
}
export interface GenerateNames { name: string; scope: string; nameSnake: string }
export type FileMap = Map<string, string | Uint8Array>;
export interface ApplyResult { files: FileMap; errors: Array<string>; warnings: Array<string> }
```
- Produces: `globToRegExp(glob: string): RegExp`, `matchesAny(path: string, globs: Array<string>): boolean`, `decodeFile(bytes: Uint8Array): string | Uint8Array`, `readFileMap(root: string): FileMap`, `writeFileMap(root: string, files: FileMap, modeSource?: string): void`, `readJson<T>(files: FileMap, path: string): T`, `writeJson(files: FileMap, path: string, value: unknown): void`, `removeFiles(files: FileMap, globs: Array<string>): FileMap`.

- [ ] **Step 1: Scaffold the package**

`packages/create-taman/package.json`:
```json
{
  "name": "create-taman",
  "type": "module",
  "version": "0.1.0",
  "description": "Scaffold a taman admin monorepo: pnpm create taman my-app",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/vinicunca/taman.git",
    "directory": "packages/create-taman"
  },
  "sideEffects": false,
  "exports": {
    ".": "./src/index.ts"
  },
  "bin": {
    "create-taman": "./dist/bin.mjs"
  },
  "files": [
    "dist"
  ],
  "engines": {
    "node": ">=22.18.0"
  },
  "publishConfig": {
    "access": "public",
    "exports": {
      ".": {
        "types": "./dist/index.d.mts",
        "default": "./dist/index.mjs"
      }
    }
  },
  "scripts": {
    "build": "tsdown",
    "prepack": "pnpm build",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@clack/prompts": "catalog:",
    "giget": "catalog:"
  },
  "devDependencies": {
    "@types/node": "catalog:",
    "tsdown": "catalog:",
    "typescript": "catalog:",
    "vitest": "catalog:"
  }
}
```
`packages/create-taman/tsconfig.json`:
```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "extends": "@vinicunca/tsconfig/node-bundler.json",
  "include": ["src"],
  "exclude": ["node_modules"]
}
```
`packages/create-taman/tsdown.config.ts`:
```ts
import { defineConfig } from 'tsdown';

export default defineConfig({
  clean: true,
  deps: {
    neverBundle: true,
  },
  dts: true,
  entry: {
    bin: 'src/bin.ts',
    index: 'src/index.ts',
  },
  format: ['esm'],
});
```
In `pnpm-workspace.yaml` `catalog:`, add (keeping alphabetical order) `  '@clack/prompts': ^1.8.1` and `  giget: ^3.3.1`. Then `pnpm install --no-frozen-lockfile`.

Write `src/types.ts` exactly as in **Interfaces** above, with a one-line doc comment on each field (`remove`: globs relative to the repo root; `workspacePackages`: `packages:` entries dropped from pnpm-workspace.yaml; `scripts`: root scripts deleted; `scopeFrom`: prefix replaced by `@<scope>/`; `rename`: exact edits applied before the scope rename, `to` may contain `{{name}}`, `{{scope}}`, `{{nameSnake}}`).

- [ ] **Step 2: Write the failing tests**

`src/__tests__/glob.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { globToRegExp, matchesAny } from '../glob';

describe('globToRegExp', () => {
  it('matches a single path segment with *', () => {
    expect(globToRegExp('apps/*/examples.json').test('apps/web/examples.json')).toBe(true);
    expect(globToRegExp('apps/*/examples.json').test('apps/web/src/examples.json')).toBe(false);
  });

  it('matches any depth with ** and a leading **/', () => {
    expect(globToRegExp('internal/**').test('internal/tsconfig/package.json')).toBe(true);
    expect(globToRegExp('**/graphify-out/**').test('graphify-out/graph.json')).toBe(true);
    expect(globToRegExp('**/graphify-out/**').test('apps/web/graphify-out/graph.json')).toBe(true);
  });

  it('treats dots and other regex characters literally', () => {
    expect(globToRegExp('CLAUDE.md').test('CLAUDExmd')).toBe(false);
    expect(globToRegExp('.github/**').test('.github/workflows/release.yml')).toBe(true);
  });

  it('never matches a prefix of a longer name', () => {
    expect(globToRegExp('packages/request/**').test('packages/request-extra/package.json')).toBe(false);
  });
});

describe('matchesAny', () => {
  it('is true when any glob matches', () => {
    expect(matchesAny('docs/a.md', ['CLAUDE.md', 'docs/**'])).toBe(true);
    expect(matchesAny('src/a.ts', ['docs/**'])).toBe(false);
  });
});
```
`src/__tests__/remove.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { removeFiles } from '../remove';

describe('removeFiles', () => {
  it('drops matching paths and keeps the rest', () => {
    const files = new Map([
      ['internal/tsconfig/package.json', '{}'],
      ['apps/web/package.json', '{}'],
      ['CLAUDE.md', '# x'],
    ]);

    const result = removeFiles(files, ['internal/**', 'CLAUDE.md']);

    expect([...result.keys()]).toEqual(['apps/web/package.json']);
    expect(files.size).toBe(3);
  });
});
```
`src/__tests__/file-map.test.ts`:
```ts
// @vitest-environment node
import { chmodSync, mkdirSync, mkdtempSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { decodeFile, readFileMap, writeFileMap } from '../file-map';

describe('decodeFile', () => {
  it('keeps UTF-8 text as a string and NUL-containing bytes as binary', () => {
    expect(decodeFile(new TextEncoder().encode('héllo'))).toBe('héllo');
    expect(decodeFile(new Uint8Array([0x89, 0x50, 0x00, 0x47]))).toBeInstanceOf(Uint8Array);
  });
});

describe('readFileMap / writeFileMap', () => {
  it('round-trips nested files with posix paths and skips .git', () => {
    const source = mkdtempSync(join(tmpdir(), 'ct-src-'));
    mkdirSync(join(source, 'a/b'), { recursive: true });
    mkdirSync(join(source, '.git'));
    writeFileSync(join(source, 'a/b/c.txt'), 'text');
    writeFileSync(join(source, '.git/HEAD'), 'ref');

    const files = readFileMap(source);
    expect([...files.keys()]).toEqual(['a/b/c.txt']);

    const target = mkdtempSync(join(tmpdir(), 'ct-out-'));
    writeFileMap(target, files, source);
    expect(readFileMap(target).get('a/b/c.txt')).toBe('text');
  });

  it('preserves the executable bit from the source tree', () => {
    const source = mkdtempSync(join(tmpdir(), 'ct-src-'));
    writeFileSync(join(source, 'run.sh'), '#!/bin/sh\n');
    chmodSync(join(source, 'run.sh'), 0o755);

    const target = mkdtempSync(join(tmpdir(), 'ct-out-'));
    writeFileMap(target, readFileMap(source), source);

    expect(statSync(join(target, 'run.sh')).mode & 0o111).not.toBe(0);
  });
});
```

- [ ] **Step 3: Run them to verify they fail**

Run: `pnpm vitest run packages/create-taman`
Expected: FAIL — cannot resolve `../glob`, `../remove`, `../file-map`.

- [ ] **Step 4: Implement**

`src/glob.ts`:
```ts
/**
 * Converts a repo-relative glob into an anchored RegExp. Supports `*` (one
 * path segment), `**` (any depth), `**\/` (zero or more directories) and `?`.
 */
export function globToRegExp(glob: string): RegExp {
  let source = '';

  for (let index = 0; index < glob.length; index++) {
    const char = glob[index]!;

    if (char === '*') {
      if (glob[index + 1] === '*') {
        index++;
        if (glob[index + 1] === '/') {
          index++;
          source += '(?:.*/)?';
        } else {
          source += '.*';
        }
      } else {
        source += '[^/]*';
      }
    } else if (char === '?') {
      source += '[^/]';
    } else {
      source += char.replace(/[.+^${}()|[\]\\]/g, '\\$&');
    }
  }

  return new RegExp(`^${source}$`);
}

export function matchesAny(path: string, globs: Array<string>): boolean {
  return globs.some((glob) => globToRegExp(glob).test(path));
}
```
`src/file-map.ts`:
```ts
import type { FileMap } from './types';
import { chmodSync, existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, sep } from 'node:path';

const decoder = new TextDecoder('utf-8', { fatal: true });

/** Valid UTF-8 without NUL bytes is text; anything else stays as bytes. */
export function decodeFile(bytes: Uint8Array): string | Uint8Array {
  if (bytes.includes(0)) {
    return bytes;
  }
  try {
    return decoder.decode(bytes);
  } catch {
    return bytes;
  }
}

/** Reads every file under `root` (except `.git`) keyed by posix-relative path. */
export function readFileMap(root: string): FileMap {
  const files: FileMap = new Map();

  const walk = (dir: string) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name !== '.git') {
          walk(full);
        }
      } else if (entry.isFile()) {
        files.set(relative(root, full).split(sep).join('/'), decodeFile(readFileSync(full)));
      }
    }
  };

  walk(root);
  return files;
}

/**
 * Writes the map under `root`. When `modeSource` is given, each file copies
 * the permission bits of the same path there, so executable scripts stay
 * executable.
 */
export function writeFileMap(root: string, files: FileMap, modeSource?: string): void {
  for (const [path, contents] of files) {
    const target = join(root, path);
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, contents);

    const source = modeSource ? join(modeSource, path) : undefined;
    if (source && existsSync(source)) {
      chmodSync(target, statSync(source).mode & 0o777);
    }
  }
}
```
`src/json.ts`:
```ts
import type { FileMap } from './types';

export function readJson<T>(files: FileMap, path: string): T {
  const text = files.get(path);
  if (typeof text !== 'string') {
    throw new TypeError(`${path} is missing or not a text file`);
  }
  return JSON.parse(text) as T;
}

/** Writes with the repo's formatting: two-space indent and a trailing newline. */
export function writeJson(files: FileMap, path: string, value: unknown): void {
  files.set(path, `${JSON.stringify(value, null, 2)}\n`);
}
```
`src/remove.ts`:
```ts
import type { FileMap } from './types';
import { globToRegExp } from './glob';

/** Returns a copy of `files` without the paths any glob matches. */
export function removeFiles(files: FileMap, globs: Array<string>): FileMap {
  const patterns = globs.map(globToRegExp);
  return new Map([...files].filter(([path]) => !patterns.some((pattern) => pattern.test(path))));
}
```
`src/index.ts`:
```ts
export type * from './types';
```

- [ ] **Step 5: Run the tests to verify they pass, type-check, commit**

```bash
pnpm vitest run packages/create-taman
(cd packages/create-taman && npx tsc --noEmit -p tsconfig.json)
npx eslint packages/create-taman pnpm-workspace.yaml
git add packages/create-taman pnpm-workspace.yaml pnpm-lock.yaml
git commit -m "feat(create-taman): add package, file map and glob matching

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>" >/dev/null 2>&1
```
Expected: all tests pass; tsc exits 0; eslint clean.

---

### Task 5: Published packages → npm catalog, workspace globs

**Files:**
- Create: `packages/create-taman/src/workspace-yaml.ts`, `src/published-deps.ts`
- Create tests: `src/__tests__/workspace-yaml.test.ts`, `src/__tests__/published-deps.test.ts`

**Interfaces:**
- Consumes: `FileMap`, `readJson`, `writeJson` (Task 4).
- Produces: `addCatalogEntries(yaml: string, entries: Map<string, string>): string`, `removeWorkspacePackages(yaml: string, globs: Array<string>): string`, `listPackages(files: FileMap): Map<string, { path: string; version: string; private: boolean }>`, `rewritePublishedDeps(before: FileMap, after: FileMap): { files: FileMap; errors: Array<string> }`.

- [ ] **Step 1: Write the failing tests**

`src/__tests__/workspace-yaml.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { addCatalogEntries, removeWorkspacePackages } from '../workspace-yaml';

const YAML = [
  'packages:',
  '  - internal/*',
  '  - apps/*',
  '',
  'catalog:',
  "  '@types/node': ^26.6.2",
  '  vue: ^3.5.0',
  '',
  'overrides:',
  "  vue: 'catalog:'",
  '',
].join('\n');

describe('addCatalogEntries', () => {
  it('inserts entries in alphabetical position inside the catalog block', () => {
    const result = addCatalogEntries(YAML, new Map([['@vinicunca/taman-core', '^0.1.0'], ['@acme/a', '^1.0.0']]));

    expect(result.split('\n').slice(4, 9)).toEqual([
      'catalog:',
      "  '@acme/a': ^1.0.0",
      "  '@types/node': ^26.6.2",
      "  '@vinicunca/taman-core': ^0.1.0",
      '  vue: ^3.5.0',
    ]);
  });

  it('replaces an entry that already exists', () => {
    const result = addCatalogEntries(YAML, new Map([['vue', '^3.6.0']]));

    expect(result).toContain('  vue: ^3.6.0');
    expect(result).not.toContain('  vue: ^3.5.0');
  });

  it('fails without a catalog block', () => {
    expect(() => addCatalogEntries('packages:\n  - apps/*\n', new Map([['a', '^1.0.0']]))).toThrow(/catalog/);
  });
});

describe('removeWorkspacePackages', () => {
  it('drops the listed package globs only', () => {
    expect(removeWorkspacePackages(YAML, ['internal/*'])).not.toContain('- internal/*');
    expect(removeWorkspacePackages(YAML, ['internal/*'])).toContain('  - apps/*');
  });
});
```
`src/__tests__/published-deps.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { listPackages, rewritePublishedDeps } from '../published-deps';
import { removeFiles } from '../remove';

const pkg = (value: object) => `${JSON.stringify(value, null, 2)}\n`;

function snapshot() {
  return new Map([
    ['package.json', pkg({ name: '@taman/monorepo', private: true, devDependencies: { '@vinicunca/tsconfig': 'workspace:*' } })],
    ['pnpm-workspace.yaml', 'packages:\n  - apps/*\n\ncatalog:\n  vue: ^3.5.0\n'],
    ['internal/tsconfig/package.json', pkg({ name: '@vinicunca/tsconfig', version: '1.0.1' })],
    ['packages/secret/package.json', pkg({ name: '@taman/secret', version: '1.0.0', private: true })],
    ['apps/web/package.json', pkg({ name: '@taman/web', private: true, dependencies: { '@vinicunca/tsconfig': 'workspace:^', '@taman/api-contract': 'workspace:*', 'vue': 'catalog:' } })],
    ['packages/api-contract/package.json', pkg({ name: '@taman/api-contract', version: '0.1.0', private: true })],
  ]);
}

describe('listPackages', () => {
  it('indexes every package.json by name, skipping node_modules', () => {
    const files = snapshot();
    files.set('node_modules/x/package.json', pkg({ name: 'x', version: '1.0.0' }));

    const packages = listPackages(files);

    expect(packages.get('@vinicunca/tsconfig')).toEqual({ path: 'internal/tsconfig/package.json', private: false, version: '1.0.1' });
    expect(packages.has('x')).toBe(false);
  });
});

describe('rewritePublishedDeps', () => {
  it('moves removed published packages to catalog versions', () => {
    const before = snapshot();
    const after = removeFiles(before, ['internal/**']);

    const { files, errors } = rewritePublishedDeps(before, after);

    expect(errors).toEqual([]);
    expect(JSON.parse(files.get('apps/web/package.json') as string).dependencies).toEqual({
      '@taman/api-contract': 'workspace:*',
      '@vinicunca/tsconfig': 'catalog:',
      'vue': 'catalog:',
    });
    expect(JSON.parse(files.get('package.json') as string).devDependencies['@vinicunca/tsconfig']).toBe('catalog:');
    expect(files.get('pnpm-workspace.yaml')).toContain("  '@vinicunca/tsconfig': ^1.0.1");
  });

  it('reports a workspace dependency on a removed private package', () => {
    const before = snapshot();
    const after = removeFiles(before, ['packages/api-contract/**']);

    const { errors } = rewritePublishedDeps(before, after);

    expect(errors).toEqual([
      'apps/web/package.json: dependencies.@taman/api-contract is "workspace:*" but @taman/api-contract is not in the generated project',
    ]);
  });
});
```

- [ ] **Step 2: Run them to verify they fail**

Run: `pnpm vitest run packages/create-taman`
Expected: FAIL — cannot resolve `../workspace-yaml`, `../published-deps`.

- [ ] **Step 3: Implement**

`src/workspace-yaml.ts`:
```ts
/** The key of a `  key: value` catalog line, without quotes. */
function catalogKey(line: string): string {
  return line.trim().split(': ')[0]!.replace(/^'|'$/g, '');
}

/**
 * Adds or replaces `name: range` lines in the top-level `catalog:` block,
 * inserting each new one in alphabetical position so existing lines keep
 * their order.
 */
export function addCatalogEntries(yaml: string, entries: Map<string, string>): string {
  const lines = yaml.split('\n');
  const start = lines.indexOf('catalog:');
  if (start === -1) {
    throw new Error('pnpm-workspace.yaml has no top-level `catalog:` block');
  }

  for (const [name, range] of [...entries].sort(([a], [b]) => a.localeCompare(b))) {
    const line = `  '${name}': ${range}`;
    let end = start + 1;
    while (end < lines.length && lines[end]!.startsWith('  ')) {
      end++;
    }

    const existing = lines.slice(start + 1, end).findIndex((entry) => catalogKey(entry) === name);
    if (existing !== -1) {
      lines[start + 1 + existing] = line;
      continue;
    }

    const after = lines.slice(start + 1, end).findIndex((entry) => catalogKey(entry) > name);
    lines.splice(after === -1 ? end : start + 1 + after, 0, line);
  }

  return lines.join('\n');
}

/** Removes `  - <glob>` lines (the workspace `packages:` list). */
export function removeWorkspacePackages(yaml: string, globs: Array<string>): string {
  return yaml
    .split('\n')
    .filter((line) => !globs.some((glob) => line.trim() === `- ${glob}`))
    .join('\n');
}
```
`src/published-deps.ts`:
```ts
import type { FileMap } from './types';
import { readJson, writeJson } from './json';
import { addCatalogEntries } from './workspace-yaml';

const DEPENDENCY_FIELDS = ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies'] as const;

interface PackageJson {
  name?: string;
  version?: string;
  private?: boolean;
  [field: string]: unknown;
}

/** Every workspace package.json (outside node_modules) by package name. */
export function listPackages(files: FileMap) {
  const packages = new Map<string, { path: string; version: string; private: boolean }>();

  for (const path of files.keys()) {
    if (!path.endsWith('package.json') || path.includes('node_modules/')) {
      continue;
    }
    const json = readJson<PackageJson>(files, path);
    if (json.name) {
      packages.set(json.name, { path, private: json.private === true, version: json.version ?? '0.0.0' });
    }
  }

  return packages;
}

/**
 * Packages removed from the snapshot that are published (not private) move
 * from `workspace:` to `catalog:` with their snapshot version. A `workspace:`
 * dependency on anything else that was removed is an error.
 */
export function rewritePublishedDeps(before: FileMap, after: FileMap) {
  const remaining = listPackages(after);
  const published = new Map(
    [...listPackages(before)]
      .filter(([name, info]) => !remaining.has(name) && !info.private)
      .map(([name, info]) => [name, info.version]),
  );

  const files: FileMap = new Map(after);
  const errors: Array<string> = [];
  const catalog = new Map<string, string>();

  for (const { path } of remaining.values()) {
    const json = readJson<PackageJson>(files, path);
    let changed = false;

    for (const field of DEPENDENCY_FIELDS) {
      const deps = json[field] as Record<string, string> | undefined;
      for (const [name, range] of Object.entries(deps ?? {})) {
        if (!range.startsWith('workspace:') || remaining.has(name)) {
          continue;
        }
        const version = published.get(name);
        if (version) {
          deps![name] = 'catalog:';
          catalog.set(name, `^${version}`);
          changed = true;
        } else {
          errors.push(`${path}: ${field}.${name} is "${range}" but ${name} is not in the generated project`);
        }
      }
    }

    if (changed) {
      writeJson(files, path, json);
    }
  }

  if (catalog.size > 0) {
    files.set('pnpm-workspace.yaml', addCatalogEntries(files.get('pnpm-workspace.yaml') as string, catalog));
  }

  return { errors, files };
}
```

- [ ] **Step 4: Run the tests to verify they pass, type-check, lint, commit**

```bash
pnpm vitest run packages/create-taman
(cd packages/create-taman && npx tsc --noEmit -p tsconfig.json) && npx eslint packages/create-taman
git add packages/create-taman && git commit -m "feat(create-taman): move published packages to catalog versions

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>" >/dev/null 2>&1
```
Expected: all pass; tsc 0; eslint clean. (Dependency keys are compared as a set via `toEqual`, so insertion order does not matter.)

---

### Task 6: Renames, script removal, safety checks, `applyManifest`

**Files:**
- Create: `packages/create-taman/src/rename.ts`, `src/scripts.ts`, `src/apply.ts`
- Modify: `packages/create-taman/src/index.ts`
- Create tests: `src/__tests__/rename.test.ts`, `src/__tests__/apply.test.ts`

**Interfaces:**
- Consumes: Task 4 and Task 5 functions.
- Produces: `fillPlaceholders(text: string, names: GenerateNames): string`, `applyExplicitRenames(files: FileMap, renames: Array<TemplateRename>, names: GenerateNames): { files: FileMap; errors: Array<string> }`, `renameScope(files: FileMap, from: string, scope: string): FileMap`, `removeRootScripts(files: FileMap, scripts: Array<string>): { files: FileMap; warnings: Array<string> }`, `findLeftovers(files: FileMap, needle: string): Array<string>`, `applyManifest(snapshot: FileMap, manifest: TemplateManifest, names: GenerateNames): ApplyResult`.
- Ruling carried from the spec: explicit renames run **before** the `@taman/` scope rule (spec §5 lists them after), because explicit entries match original text such as `"name": "@taman/monorepo"`.

- [ ] **Step 1: Write the failing tests**

`src/__tests__/rename.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { applyExplicitRenames, fillPlaceholders, renameScope } from '../rename';

const names = { name: 'my-app', nameSnake: 'my_app', scope: 'acme' };

describe('fillPlaceholders', () => {
  it('fills name, scope and nameSnake', () => {
    expect(fillPlaceholders('{{name}}/{{scope}}/{{nameSnake}}', names)).toBe('my-app/acme/my_app');
  });
});

describe('applyExplicitRenames', () => {
  it('replaces every occurrence in the named file', () => {
    const files = new Map([['docker-compose.yml', 'POSTGRES_DB: taman_db\n-d taman_db\n']]);

    const result = applyExplicitRenames(files, [{ file: 'docker-compose.yml', from: 'taman_db', to: '{{nameSnake}}' }], names);

    expect(result.errors).toEqual([]);
    expect(result.files.get('docker-compose.yml')).toBe('POSTGRES_DB: my_app\n-d my_app\n');
  });

  it('reports a missing file and a missing string instead of skipping them', () => {
    const files = new Map([['a.txt', 'hello']]);

    const result = applyExplicitRenames(files, [
      { file: 'missing.txt', from: 'x', to: 'y' },
      { file: 'a.txt', from: 'absent', to: 'y' },
    ], names);

    expect(result.errors).toEqual([
      'rename: missing.txt does not exist',
      'rename: "absent" not found in a.txt',
    ]);
  });
});

describe('renameScope', () => {
  it('rewrites the scope in text files and leaves published names and binaries alone', () => {
    const binary = new Uint8Array([0, 1, 2]);
    const files = new Map<string, string | Uint8Array>([
      ['a.ts', "import { x } from '@taman/utils';\nimport { y } from '@vinicunca/taman-core';\n"],
      ['logo.png', binary],
    ]);

    const result = renameScope(files, '@taman/', 'acme');

    expect(result.get('a.ts')).toBe("import { x } from '@acme/utils';\nimport { y } from '@vinicunca/taman-core';\n");
    expect(result.get('logo.png')).toBe(binary);
  });
});
```
`src/__tests__/apply.test.ts`:
```ts
import type { TemplateManifest } from '../types';
import { describe, expect, it } from 'vitest';
import { applyManifest, findLeftovers } from '../apply';

const pkg = (value: object) => `${JSON.stringify(value, null, 2)}\n`;
const names = { name: 'my-app', nameSnake: 'my_app', scope: 'acme' };

const manifest: TemplateManifest = {
  remove: ['internal/**', 'CLAUDE.md'],
  rename: [{ file: 'package.json', from: '"name": "@taman/monorepo"', to: '"name": "{{name}}"' }],
  scopeFrom: '@taman/',
  scripts: ['publint'],
  workspacePackages: ['internal/*'],
};

function snapshot() {
  return new Map<string, string | Uint8Array>([
    ['package.json', pkg({ name: '@taman/monorepo', private: true, scripts: { dev: 'nx', publint: 'publint' }, devDependencies: { '@vinicunca/tsconfig': 'workspace:*' } })],
    ['pnpm-workspace.yaml', 'packages:\n  - internal/*\n  - apps/*\n\ncatalog:\n  vue: ^3.5.0\n'],
    ['internal/tsconfig/package.json', pkg({ name: '@vinicunca/tsconfig', version: '1.0.1' })],
    ['apps/web/package.json', pkg({ name: '@taman/web', private: true })],
    ['apps/web/src/main.ts', "import '@taman/web';\n"],
    ['CLAUDE.md', '# repo notes'],
  ]);
}

describe('applyManifest', () => {
  it('produces a renamed project without the removed parts', () => {
    const { files, errors, warnings } = applyManifest(snapshot(), manifest, names);

    expect(errors).toEqual([]);
    expect(warnings).toEqual([]);
    expect([...files.keys()].sort()).toEqual(['apps/web/package.json', 'apps/web/src/main.ts', 'package.json', 'pnpm-workspace.yaml']);

    const root = JSON.parse(files.get('package.json') as string);
    expect(root.name).toBe('my-app');
    expect(root.scripts).toEqual({ dev: 'nx' });
    expect(root.devDependencies['@vinicunca/tsconfig']).toBe('catalog:');

    expect(JSON.parse(files.get('apps/web/package.json') as string).name).toBe('@acme/web');
    expect(files.get('apps/web/src/main.ts')).toBe("import '@acme/web';\n");
    expect(files.get('pnpm-workspace.yaml')).not.toContain('internal/*');
    expect(files.get('pnpm-workspace.yaml')).toContain("  '@vinicunca/tsconfig': ^1.0.1");
  });

  it('collects manifest drift as errors', () => {
    const drifted = { ...manifest, rename: [{ file: 'package.json', from: '"name": "@taman/other"', to: 'x' }] };

    expect(applyManifest(snapshot(), drifted, names).errors).toEqual(['rename: ""name": "@taman/other"" not found in package.json']);
  });

  it('reports text files where the old scope survives', () => {
    const files = new Map<string, string | Uint8Array>([
      ['a.ts', "import '@taman/web';\n"],
      ['b.ts', "import '@acme/web';\n"],
      ['c.bin', new Uint8Array([64, 116, 97])],
    ]);

    expect(findLeftovers(files, '@taman/')).toEqual(['a.ts']);
  });
});
```

- [ ] **Step 2: Run them to verify they fail**

Run: `pnpm vitest run packages/create-taman`
Expected: FAIL — cannot resolve `../rename`, `../apply`.

- [ ] **Step 3: Implement**

`src/rename.ts`:
```ts
import type { FileMap, GenerateNames, TemplateRename } from './types';

export function fillPlaceholders(text: string, names: GenerateNames): string {
  return text
    .replaceAll('{{name}}', names.name)
    .replaceAll('{{scope}}', names.scope)
    .replaceAll('{{nameSnake}}', names.nameSnake);
}

/**
 * Exact edits from the manifest. A missing file or string is an error, never
 * a silent skip: it means the manifest no longer matches the code.
 */
export function applyExplicitRenames(files: FileMap, renames: Array<TemplateRename>, names: GenerateNames) {
  const result: FileMap = new Map(files);
  const errors: Array<string> = [];

  for (const { file, from, to } of renames) {
    const text = result.get(file);
    if (typeof text !== 'string') {
      errors.push(`rename: ${file} does not exist`);
    } else if (!text.includes(from)) {
      errors.push(`rename: "${from}" not found in ${file}`);
    } else {
      result.set(file, text.replaceAll(from, fillPlaceholders(to, names)));
    }
  }

  return { errors, files: result };
}

/** Replaces the template scope (e.g. `@taman/`) with `@<scope>/` in every text file. */
export function renameScope(files: FileMap, from: string, scope: string): FileMap {
  return new Map(
    [...files].map(([path, contents]) => [
      path,
      typeof contents === 'string' ? contents.replaceAll(from, `@${scope}/`) : contents,
    ]),
  );
}
```
`src/scripts.ts`:
```ts
import type { FileMap } from './types';
import { readJson, writeJson } from './json';

/** Deletes root package.json scripts that only make sense in the taman repo. */
export function removeRootScripts(files: FileMap, scripts: Array<string>) {
  const result: FileMap = new Map(files);
  const warnings: Array<string> = [];
  const json = readJson<{ scripts?: Record<string, string> }>(result, 'package.json');

  for (const name of scripts) {
    if (json.scripts && name in json.scripts) {
      delete json.scripts[name];
    } else {
      warnings.push(`scripts: root package.json has no "${name}" script`);
    }
  }

  writeJson(result, 'package.json', json);
  return { files: result, warnings };
}
```
`src/apply.ts`:
```ts
import type { ApplyResult, FileMap, GenerateNames, TemplateManifest } from './types';
import { rewritePublishedDeps } from './published-deps';
import { removeFiles } from './remove';
import { applyExplicitRenames, renameScope } from './rename';
import { removeRootScripts } from './scripts';
import { removeWorkspacePackages } from './workspace-yaml';

/** Paths of text files that still contain `needle`. */
export function findLeftovers(files: FileMap, needle: string): Array<string> {
  return [...files]
    .filter(([, contents]) => typeof contents === 'string' && contents.includes(needle))
    .map(([path]) => path);
}

/**
 * Turns a repo snapshot into a project. Explicit renames run before the
 * scope rename because they match the original text.
 */
export function applyManifest(snapshot: FileMap, manifest: TemplateManifest, names: GenerateNames): ApplyResult {
  let files = removeFiles(snapshot, manifest.remove);

  const deps = rewritePublishedDeps(snapshot, files);
  files = deps.files;
  files.set('pnpm-workspace.yaml', removeWorkspacePackages(files.get('pnpm-workspace.yaml') as string, manifest.workspacePackages));

  const explicit = applyExplicitRenames(files, manifest.rename, names);
  files = renameScope(explicit.files, manifest.scopeFrom, names.scope);

  const scripts = removeRootScripts(files, manifest.scripts);
  files = scripts.files;

  return {
    errors: [...deps.errors, ...explicit.errors],
    files,
    warnings: [
      ...scripts.warnings,
      ...findLeftovers(files, manifest.scopeFrom).map((path) => `${manifest.scopeFrom} still appears in ${path}`),
    ],
  };
}
```
Replace `src/index.ts` with:
```ts
export { applyManifest } from './apply';
export type * from './types';
```

- [ ] **Step 4: Run the tests to verify they pass, type-check, lint, commit**

```bash
pnpm vitest run packages/create-taman
(cd packages/create-taman && npx tsc --noEmit -p tsconfig.json) && npx eslint packages/create-taman
git add packages/create-taman && git commit -m "feat(create-taman): apply manifest renames, scripts and safety checks

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>" >/dev/null 2>&1
```
Expected: all pass; tsc 0; eslint clean.

---

### Task 7: Sources, env files, README and `generateProject`

**Files:**
- Create: `packages/create-taman/src/names.ts`, `src/env.ts`, `src/readme.ts`, `src/sources.ts`, `src/generate.ts`
- Create tests: `src/__tests__/env.test.ts`, `src/__tests__/generate.test.ts`

**Interfaces:**
- Consumes: `applyManifest`, `readFileMap`, `writeFileMap`.
- Produces:
```ts
export function validateName(value: string, label: string): string | undefined;
export function normalizeScope(value: string): string;           // strips a leading "@" and trailing "/"
export function toNames(name: string, scope: string): GenerateNames;
export function addEnvFiles(files: FileMap): FileMap;
export function renderReadme(names: GenerateNames): string;
export async function fetchFromGithub(ref: string, dir: string): Promise<void>;
export function fetchFromLocal(repo: string, dir: string): void;
export type TemplateSource = { type: 'github'; ref: string } | { type: 'local'; repo: string };
export interface GenerateOptions { dir: string; names: GenerateNames; source: TemplateSource; git: boolean }
export interface GenerateResult { warnings: Array<string> }
export async function generateProject(options: GenerateOptions): Promise<GenerateResult>;
```

- [ ] **Step 1: Write the failing tests**

`src/__tests__/env.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { addEnvFiles } from '../env';

describe('addEnvFiles', () => {
  it('copies every .env example to its real name without overwriting', () => {
    const files = new Map([
      ['apps/web/.env.example', 'A=1\n'],
      ['apps/web/.env.development.example', 'B=2\n'],
      ['apps/api/.env.example', 'C=3\n'],
      ['apps/api/.env', 'KEEP=1\n'],
      ['docs/config.example', 'not env\n'],
    ]);

    const result = addEnvFiles(files);

    expect(result.get('apps/web/.env')).toBe('A=1\n');
    expect(result.get('apps/web/.env.development')).toBe('B=2\n');
    expect(result.get('apps/api/.env')).toBe('KEEP=1\n');
    expect(result.has('docs/config')).toBe(false);
  });
});
```
`src/__tests__/generate.test.ts`:
```ts
// @vitest-environment node
import { execFileSync } from 'node:child_process';
import { chmodSync, existsSync, mkdirSync, mkdtempSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { generateProject } from '../generate';
import { toNames } from '../names';

const GIT_ENV = {
  ...process.env,
  GIT_AUTHOR_EMAIL: 'test@example.com',
  GIT_AUTHOR_NAME: 'test',
  GIT_COMMITTER_EMAIL: 'test@example.com',
  GIT_COMMITTER_NAME: 'test',
};

const MANIFEST = `export default {
  remove: ['internal/**', 'CLAUDE.md', 'template.manifest.ts'],
  workspacePackages: ['internal/*'],
  scripts: ['publint'],
  scopeFrom: '@taman/',
  rename: [{ file: 'package.json', from: '"name": "@taman/monorepo"', to: '"name": "{{name}}"' }],
};
`;

function fixtureRepo(manifest = MANIFEST): string {
  const repo = mkdtempSync(join(tmpdir(), 'ct-repo-'));
  const files: Record<string, string> = {
    'package.json': `${JSON.stringify({ name: '@taman/monorepo', private: true, scripts: { publint: 'x' }, devDependencies: { '@vinicunca/tsconfig': 'workspace:*' } }, null, 2)}\n`,
    'pnpm-workspace.yaml': 'packages:\n  - internal/*\n  - apps/*\n\ncatalog:\n  vue: ^3.5.0\n',
    'internal/tsconfig/package.json': '{ "name": "@vinicunca/tsconfig", "version": "1.0.1" }\n',
    'apps/web/package.json': '{ "name": "@taman/web", "private": true }\n',
    'apps/web/.env.example': 'VITE_APP_TITLE=Taman\n',
    'apps/web/src/main.ts': "import '@taman/web';\n",
    'scripts/run.sh': '#!/bin/sh\necho ok\n',
    'CLAUDE.md': '# notes\n',
    'template.manifest.ts': manifest,
  };
  for (const [path, contents] of Object.entries(files)) {
    mkdirSync(dirname(join(repo, path)), { recursive: true });
    writeFileSync(join(repo, path), contents);
  }
  chmodSync(join(repo, 'scripts/run.sh'), 0o755);
  execFileSync('git', ['init', '-q'], { cwd: repo });
  execFileSync('git', ['add', '-A'], { cwd: repo });
  execFileSync('git', ['commit', '-q', '-m', 'fixture'], { cwd: repo, env: GIT_ENV });
  return repo;
}

describe('generateProject', () => {
  it('generates a renamed project from a local checkout', async () => {
    const repo = fixtureRepo();
    const dir = join(mkdtempSync(join(tmpdir(), 'ct-out-')), 'my-app');

    await generateProject({ dir, git: true, names: toNames('my-app', 'acme'), source: { repo, type: 'local' } });

    const read = (path: string) => readFileSync(join(dir, path), 'utf8');
    expect(JSON.parse(read('package.json')).name).toBe('my-app');
    expect(JSON.parse(read('apps/web/package.json')).name).toBe('@acme/web');
    expect(read('apps/web/src/main.ts')).toBe("import '@acme/web';\n");
    expect(read('apps/web/.env')).toBe('VITE_APP_TITLE=Taman\n');
    expect(read('README.md')).toContain('my-app');
    expect(existsSync(join(dir, 'CLAUDE.md'))).toBe(false);
    expect(existsSync(join(dir, 'template.manifest.ts'))).toBe(false);
    expect(existsSync(join(dir, 'internal'))).toBe(false);
    expect(statSync(join(dir, 'scripts/run.sh')).mode & 0o111).not.toBe(0);
    expect(execFileSync('git', ['log', '--oneline'], { cwd: dir, encoding: 'utf8' })).toContain('Initial commit from create-taman');
  });

  it('refuses a non-empty folder and leaves it untouched', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'ct-busy-'));
    writeFileSync(join(dir, 'keep.txt'), 'mine');

    await expect(generateProject({ dir, git: false, names: toNames('busy', 'busy'), source: { repo: fixtureRepo(), type: 'local' } }))
      .rejects.toThrow(/not empty/);
    expect(readFileSync(join(dir, 'keep.txt'), 'utf8')).toBe('mine');
  });

  it('removes the folder it created when the manifest has drifted', async () => {
    const drifted = MANIFEST.replace('"name": "@taman/monorepo"', '"name": "@taman/other"');
    const dir = join(mkdtempSync(join(tmpdir(), 'ct-out-')), 'my-app');

    await expect(generateProject({ dir, git: false, names: toNames('my-app', 'acme'), source: { repo: fixtureRepo(drifted), type: 'local' } }))
      .rejects.toThrow(/out of date/);
    expect(existsSync(dir)).toBe(false);
  });
});
```

- [ ] **Step 2: Run them to verify they fail**

Run: `pnpm vitest run packages/create-taman`
Expected: FAIL — cannot resolve `../env`, `../generate`, `../names`.

- [ ] **Step 3: Implement**

`src/names.ts`:
```ts
import type { GenerateNames } from './types';

const NPM_NAME = /^[a-z0-9][a-z0-9._-]*$/;

/** Returns an error message, or undefined when `value` is a valid npm name part. */
export function validateName(value: string, label: string): string | undefined {
  if (!value) {
    return `${label} is required`;
  }
  if (value.length > 214) {
    return `${label} must be at most 214 characters`;
  }
  if (!NPM_NAME.test(value)) {
    return `${label} may only use lowercase letters, digits, "-", "." and "_", and must start with a letter or digit`;
  }
  return undefined;
}

/** Accepts `acme`, `@acme` or `@acme/` and returns `acme`. */
export function normalizeScope(value: string): string {
  return value.trim().replace(/^@/, '').replace(/\/$/, '');
}

export function toNames(name: string, scope: string): GenerateNames {
  return { name, nameSnake: name.replace(/[^a-z0-9]+/g, '_'), scope };
}
```
`src/env.ts`:
```ts
import type { FileMap } from './types';

const ENV_EXAMPLE = /(?:^|\/)\.env(?:\.[\w-]+)?\.example$/;

/** Adds `.env*` files from their `.example` copies, never overwriting. */
export function addEnvFiles(files: FileMap): FileMap {
  const result: FileMap = new Map(files);
  for (const [path, contents] of files) {
    if (ENV_EXAMPLE.test(path)) {
      const target = path.slice(0, -'.example'.length);
      if (!result.has(target)) {
        result.set(target, contents);
      }
    }
  }
  return result;
}
```
`src/readme.ts`:
```ts
import type { GenerateNames } from './types';

export function renderReadme({ name, scope }: GenerateNames): string {
  return `# ${name}

Generated with [create-taman](https://github.com/vinicunca/taman). The code is
yours: change anything. Only the \`@vinicunca/*\` packages receive updates, via
\`pnpm update\`.

## Getting started

\`\`\`bash
docker compose up -d     # Postgres on localhost:5437
pnpm db-pg:migrate:dev   # create the tables
pnpm dev:api             # API on http://localhost:8788
pnpm dev:web             # app on http://localhost:5556
\`\`\`

Each app has a \`.env\` copied from its \`.env.example\`; review them before
deploying.

## Layout

- \`apps/web\`: Vue admin app. \`apps/api\`: Nitro API (Cloudflare Workers).
- \`packages/shell\`: browser-only packages (\`@${scope}/layouts\`, \`@${scope}/app-ui\`, ...).
- \`packages/server\`: database (\`@${scope}/db-pg\`) and emails.
- \`packages/shared\`: code used by both apps (\`@${scope}/api-contract\`, \`@${scope}/rbac\`).

## Adding a feature

Copy the todo feature, one layer at a time: permissions in
\`packages/shared/rbac\`, schema in \`packages/server/db-pg\`, contract in
\`packages/shared/api-contract\`, procedures in \`apps/api/server/domains/todo\`,
pages in \`apps/web/src/views/todo\` with the route in
\`apps/web/src/router/routes/modules/todo.ts\`.
`;
}
```
`src/sources.ts`:
```ts
import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

export const TEMPLATE_REPO = 'github:vinicunca/taman';

export type TemplateSource = { type: 'github'; ref: string } | { type: 'local'; repo: string };

/** Downloads the repo tarball at `ref` into `dir` (public repo, no token). */
export async function fetchFromGithub(ref: string, dir: string): Promise<void> {
  const { downloadTemplate } = await import('giget');
  await downloadTemplate(`${TEMPLATE_REPO}#${ref}`, { dir, force: true, forceClean: true });
}

/** Extracts the committed files of a local checkout, exactly like a GitHub tarball. */
export function fetchFromLocal(repo: string, dir: string): void {
  const scratch = mkdtempSync(join(tmpdir(), 'create-taman-archive-'));
  const tarball = join(scratch, 'template.tar');
  try {
    execFileSync('git', ['-C', repo, 'archive', '--format=tar', '-o', tarball, 'HEAD']);
    execFileSync('tar', ['-xf', tarball, '-C', dir]);
  } finally {
    rmSync(scratch, { force: true, recursive: true });
  }
}
```
`src/generate.ts`:
```ts
import type { GenerateNames, TemplateManifest } from './types';
import type { TemplateSource } from './sources';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { applyManifest } from './apply';
import { addEnvFiles } from './env';
import { readFileMap, writeFileMap } from './file-map';
import { renderReadme } from './readme';
import { fetchFromGithub, fetchFromLocal } from './sources';

export interface GenerateOptions {
  dir: string;
  names: GenerateNames;
  source: TemplateSource;
  git: boolean;
}

export interface GenerateResult {
  warnings: Array<string>;
}

function gitCommit(dir: string): void {
  const hasIdentity = (() => {
    try {
      return execFileSync('git', ['config', 'user.email'], { cwd: dir, encoding: 'utf8' }).trim() !== '';
    } catch {
      return false;
    }
  })();
  const identity = hasIdentity ? [] : ['-c', 'user.name=create-taman', '-c', 'user.email=create-taman@users.noreply.github.com'];

  execFileSync('git', ['init', '-q'], { cwd: dir });
  execFileSync('git', ['add', '-A'], { cwd: dir });
  execFileSync('git', [...identity, 'commit', '-q', '--no-verify', '-m', 'Initial commit from create-taman'], { cwd: dir });
}

/**
 * Fetches the template, applies its manifest and writes the project to
 * `dir`. Refuses a non-empty folder; removes a folder it created if anything
 * fails before the project is complete.
 */
export async function generateProject({ dir, git, names, source }: GenerateOptions): Promise<GenerateResult> {
  if (existsSync(dir) && readdirSync(dir).length > 0) {
    throw new Error(`${dir} is not empty`);
  }

  const createdDir = !existsSync(dir);
  const staging = mkdtempSync(join(tmpdir(), 'create-taman-'));

  try {
    if (source.type === 'github') {
      await fetchFromGithub(source.ref, staging);
    } else {
      fetchFromLocal(source.repo, staging);
    }

    const manifestPath = join(staging, 'template.manifest.ts');
    if (!existsSync(manifestPath)) {
      throw new Error('The template has no template.manifest.ts; is the ref older than create-taman?');
    }
    const manifest = (await import(pathToFileURL(manifestPath).href)).default as TemplateManifest;

    const result = applyManifest(readFileMap(staging), manifest, names);
    if (result.errors.length > 0) {
      throw new Error(`The template manifest is out of date:\n- ${result.errors.join('\n- ')}`);
    }

    const files = addEnvFiles(result.files);
    files.set('README.md', renderReadme(names));

    mkdirSync(dir, { recursive: true });
    writeFileMap(dir, files, staging);

    if (git) {
      gitCommit(dir);
    }

    return { warnings: result.warnings };
  } catch (error) {
    if (createdDir) {
      rmSync(dir, { force: true, recursive: true });
    }
    throw error;
  } finally {
    rmSync(staging, { force: true, recursive: true });
  }
}
```

- [ ] **Step 4: Run the tests to verify they pass, type-check, lint, commit**

```bash
pnpm vitest run packages/create-taman
(cd packages/create-taman && npx tsc --noEmit -p tsconfig.json) && npx eslint packages/create-taman
git add packages/create-taman && git commit -m "feat(create-taman): generate a project from a local or GitHub source

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>" >/dev/null 2>&1
```
Expected: all pass (the generate tests need `git` and `tar` on PATH); tsc 0; eslint clean.

---

### Task 8: CLI entry

**Files:**
- Create: `packages/create-taman/src/cli.ts`, `src/bin.ts`, `packages/create-taman/README.md`
- Create tests: `src/__tests__/cli.test.ts`, `src/__tests__/names.test.ts`

**Interfaces:**
- Consumes: `generateProject`, `validateName`, `normalizeScope`, `toNames`.
- Produces: `parseCliArgs(argv: Array<string>): CliArgs` with `CliArgs = { dir?: string; scope?: string; ref?: string; from?: string; yes: boolean; install: boolean; git: boolean; help: boolean }`; `main(argv?: Array<string>): Promise<void>`; `defaultRef(): string` returning `create-taman@<package version>`.

- [ ] **Step 1: Write the failing tests**

`src/__tests__/names.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { normalizeScope, toNames, validateName } from '../names';

describe('names', () => {
  it('accepts lowercase npm names and rejects the rest with a reason', () => {
    expect(validateName('my-app', 'Project name')).toBeUndefined();
    expect(validateName('', 'Scope')).toBe('Scope is required');
    expect(validateName('Acme', 'Scope')).toMatch(/lowercase/);
    expect(validateName('_acme', 'Scope')).toMatch(/start with a letter or digit/);
  });

  it('normalises typed scope forms', () => {
    expect(normalizeScope('@acme')).toBe('acme');
    expect(normalizeScope('@acme/')).toBe('acme');
    expect(normalizeScope(' acme ')).toBe('acme');
  });

  it('derives a database-safe name', () => {
    expect(toNames('my-app.v2', 'acme').nameSnake).toBe('my_app_v2');
  });
});
```
`src/__tests__/cli.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { defaultRef, parseCliArgs } from '../cli';

describe('parseCliArgs', () => {
  it('reads the folder and flags', () => {
    expect(parseCliArgs(['my-app', '--scope', '@acme', '--ref', 'main', '--yes', '--no-install', '--no-git'])).toEqual({
      dir: 'my-app',
      from: undefined,
      git: false,
      help: false,
      install: false,
      ref: 'main',
      scope: '@acme',
      yes: true,
    });
  });

  it('defaults to installing and committing', () => {
    expect(parseCliArgs([])).toMatchObject({ git: true, install: true, yes: false });
  });
});

describe('defaultRef', () => {
  it('pins the template to this CLI release tag', () => {
    expect(defaultRef()).toMatch(/^create-taman@\d+\.\d+\.\d+/);
  });
});
```

- [ ] **Step 2: Run them to verify they fail**

Run: `pnpm vitest run packages/create-taman`
Expected: FAIL — cannot resolve `../cli`.

- [ ] **Step 3: Implement**

`src/cli.ts`:
```ts
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { basename, relative, resolve } from 'node:path';
import process from 'node:process';
import { parseArgs } from 'node:util';
import * as prompts from '@clack/prompts';
import { generateProject } from './generate';
import { normalizeScope, toNames, validateName } from './names';

const HELP = `Usage: create-taman <folder> [options]

  --scope <name>   npm scope for workspace packages (default: folder name)
  --ref <ref>      git ref of vinicunca/taman to generate from
                   (default: this CLI's release tag)
  --no-install     skip pnpm install
  --no-git         skip git init and the first commit
  -y, --yes        accept defaults without prompting
  -h, --help       show this help
`;

export interface CliArgs {
  dir?: string;
  scope?: string;
  ref?: string;
  from?: string;
  yes: boolean;
  install: boolean;
  git: boolean;
  help: boolean;
}

export function parseCliArgs(argv: Array<string>): CliArgs {
  const { positionals, values } = parseArgs({
    allowPositionals: true,
    args: argv,
    options: {
      'from': { type: 'string' },
      'help': { default: false, short: 'h', type: 'boolean' },
      'no-git': { default: false, type: 'boolean' },
      'no-install': { default: false, type: 'boolean' },
      'ref': { type: 'string' },
      'scope': { type: 'string' },
      'yes': { default: false, short: 'y', type: 'boolean' },
    },
  });

  return {
    dir: positionals[0],
    from: values.from,
    git: !values['no-git'],
    help: values.help,
    install: !values['no-install'],
    ref: values.ref,
    scope: values.scope,
    yes: values.yes,
  };
}

/** The template ref matching this CLI release, so output is what was tested. */
export function defaultRef(): string {
  const { version } = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8')) as { version: string };
  return `create-taman@${version}`;
}

function exit(message: string): never {
  prompts.cancel(message);
  process.exit(1);
}

async function ask(message: string, initialValue: string | undefined, validate: (value: string) => string | undefined): Promise<string> {
  const answer = await prompts.text({ initialValue, message, validate: (value) => validate(value ?? '') });
  if (prompts.isCancel(answer)) {
    exit('Cancelled');
  }
  return answer;
}

export async function main(argv: Array<string> = process.argv.slice(2)): Promise<void> {
  const args = parseCliArgs(argv);
  if (args.help) {
    console.log(HELP);
    return;
  }

  prompts.intro('create-taman');

  const folder = args.dir
    ?? (args.yes ? exit('Pass a project folder, e.g. `create-taman my-app`') : await ask('Project folder', 'my-app', (value) => validateName(basename(value), 'Project name')));
  const dir = resolve(folder);
  const name = basename(dir);
  const nameError = validateName(name, 'Project name');
  if (nameError) {
    exit(nameError);
  }

  const scope = normalizeScope(
    args.scope ?? (args.yes ? name : await ask('npm scope for workspace packages', name, (value) => validateName(normalizeScope(value), 'Scope'))),
  );
  const scopeError = validateName(scope, 'Scope');
  if (scopeError) {
    exit(scopeError);
  }

  const source = args.from
    ? { repo: resolve(args.from), type: 'local' as const }
    : { ref: args.ref ?? defaultRef(), type: 'github' as const };

  const spinner = prompts.spinner();
  spinner.start(source.type === 'github' ? `Downloading taman (${source.ref})` : `Copying ${source.repo}`);
  try {
    const { warnings } = await generateProject({ dir, git: args.git, names: toNames(name, scope), source });
    spinner.stop(`Created ${name}`);
    for (const warning of warnings) {
      prompts.log.warn(warning);
    }
  } catch (error) {
    spinner.stop('Generation failed');
    exit(error instanceof Error ? error.message : String(error));
  }

  if (args.install) {
    try {
      execFileSync('pnpm', ['install'], { cwd: dir, stdio: 'inherit' });
    } catch {
      prompts.log.error(`pnpm install failed. The project is ready; run \`pnpm install\` in ${relative(process.cwd(), dir) || '.'} again.`);
    }
  }

  prompts.outro(`Next steps:
  cd ${relative(process.cwd(), dir) || '.'}
  docker compose up -d
  pnpm db-pg:migrate:dev
  pnpm dev:api   # and in another terminal: pnpm dev:web`);
}
```
`src/bin.ts`:
```ts
#!/usr/bin/env node
import { main } from './cli';

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
```
`packages/create-taman/README.md`:
```md
# create-taman

Scaffold a [taman](https://github.com/vinicunca/taman) admin monorepo: a Vue
admin app, a Nitro API on Cloudflare Workers, Postgres with drizzle,
better-auth, RBAC and transactional email.

    pnpm create taman my-app

Options: `--scope <name>` (npm scope for workspace packages, default: the
folder name), `--ref <git ref>`, `--no-install`, `--no-git`, `--yes`.

The generated code is yours. Only the published `@vinicunca/*` packages
receive updates.
```

- [ ] **Step 4: Run the tests, build the bin, smoke the help, commit**

```bash
pnpm vitest run packages/create-taman
(cd packages/create-taman && npx tsc --noEmit -p tsconfig.json && pnpm build >/dev/null && node dist/bin.mjs --help | head -3 && head -1 dist/bin.mjs)
npx eslint packages/create-taman
git add packages/create-taman && git commit -m "feat(create-taman): add the CLI

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>" >/dev/null 2>&1
```
Expected: all tests pass; `--help` prints `Usage: create-taman <folder> [options]`; the first line of `dist/bin.mjs` is `#!/usr/bin/env node`; eslint clean. (`dist/` is gitignored.)

---

### Task 9: The real `template.manifest.ts`

**Files:**
- Create: `template.manifest.ts` (repo root)
- Create test: `packages/create-taman/src/__tests__/manifest.test.ts`

**Interfaces:**
- Consumes: `TemplateManifest` type (imported with a type-only relative path, so the manifest has no runtime imports), `applyManifest`, `readFileMap`, `toNames`.
- Produces: the default export Task 10's smoke test and every real generation use.

- [ ] **Step 1: Write the failing test**

`packages/create-taman/src/__tests__/manifest.test.ts`:
```ts
// @vitest-environment node
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { applyManifest } from '../apply';
import { readFileMap } from '../file-map';
import { toNames } from '../names';
import { fetchFromLocal } from '../sources';

const repoRoot = resolve(import.meta.dirname, '../../../..');

describe('template.manifest.ts', () => {
  it('applies cleanly to this repository and leaves no template leftovers', async () => {
    const staging = mkdtempSync(join(tmpdir(), 'ct-manifest-'));
    fetchFromLocal(repoRoot, staging);
    const manifest = (await import(join(staging, 'template.manifest.ts'))).default;

    const { errors, files, warnings } = applyManifest(readFileMap(staging), manifest, toNames('acme-app', 'acme'));

    expect(errors).toEqual([]);
    expect(warnings).toEqual([]);

    const paths = [...files.keys()];
    expect(paths.filter((path) => /(?:^|\/)(?:internal|docs|\.github|\.changeset|graphify-out)\//.test(path))).toEqual([]);
    expect(paths.filter((path) => path.includes('views/examples'))).toEqual([]);
    expect(paths.filter((path) => /^packages\/(?:taman-core|taman-ui|request|create-taman)\//.test(path))).toEqual([]);
    expect(paths).toContain('apps/web/src/views/todo/crud.vue');

    const text = [...files].filter(([, contents]) => typeof contents === 'string');
    expect(text.filter(([, contents]) => /talent|ticket|ngibur/i.test(contents as string)).map(([path]) => path)).toEqual([]);
    expect(JSON.parse(files.get('package.json') as string).name).toBe('acme-app');
    expect(files.get('apps/api/nitro.config.ts')).toContain("name: 'acme-app-api'");
    expect(files.get('docker-compose.yml')).toContain('POSTGRES_DB: acme_app');
    expect(files.get('pnpm-workspace.yaml')).toContain("'@vinicunca/taman-core': ^");
    expect(readdirSync(staging).length).toBeGreaterThan(0);
  });
});
```
This test archives `HEAD`, so **commit the manifest before running it green** (Step 4).

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm vitest run packages/create-taman/src/__tests__/manifest.test.ts`
Expected: FAIL — `template.manifest.ts` does not exist in the archive.

- [ ] **Step 3: Write the manifest**

`template.manifest.ts`:
```ts
import type { TemplateManifest } from './packages/create-taman/src/types.ts';

/**
 * What `create-taman` turns this repository into. The CLI reads this file
 * from the downloaded snapshot, so it always matches the code it describes.
 * No runtime imports: Node strips the types and runs it as-is.
 */
export default {
  remove: [
    // Published packages: generated projects install these from npm
    'packages/taman-core/**',
    'packages/taman-ui/**',
    'packages/request/**',
    'packages/create-taman/**',
    'internal/**',
    // Only meaningful in this repository
    '.github/**',
    '.changeset/**',
    'scripts/release/**',
    'scripts/deploy/**',
    'docs/**',
    'tasks/**',
    '**/graphify-out/**',
    'CLAUDE.md',
    'AGENTS.md',
    '.codex/**',
    '.cursor/**',
    '.gitpod.yml',
    'template.manifest.ts',
    'pnpm-lock.yaml',
    // Example gallery; the todo feature stays as the reference
    'apps/web/src/views/examples/**',
    'apps/web/src/router/routes/modules/dev/examples.ts',
    'apps/web/src/locales/langs/*/examples.json',
  ],
  workspacePackages: ['internal/*', 'internal/lint-configs/*'],
  scripts: ['build:docker', 'check:api-packages', 'publint'],
  scopeFrom: '@taman/',
  rename: [
    { file: 'package.json', from: '"name": "@taman/monorepo"', to: '"name": "{{name}}"' },
    // Kept as-is in this repo: renaming it creates a new Cloudflare worker
    { file: 'apps/api/nitro.config.ts', from: 'name: \'taman-better-auth-back\'', to: 'name: \'{{name}}-api\'' },
    { file: 'docker-compose.yml', from: 'container_name: taman-postgres', to: 'container_name: {{name}}-postgres' },
    { file: 'docker-compose.yml', from: 'taman_data', to: '{{nameSnake}}_data' },
    { file: 'docker-compose.yml', from: 'taman_db', to: '{{nameSnake}}' },
    { file: 'apps/web/.env.example', from: 'VITE_APP_TITLE=Taman', to: 'VITE_APP_TITLE={{name}}' },
    { file: 'apps/web/.env.example', from: 'VITE_APP_NAMESPACE=taman', to: 'VITE_APP_NAMESPACE={{name}}' },
    { file: 'apps/api/.env.example', from: 'taman_db', to: '{{nameSnake}}' },
    { file: 'packages/server/db-pg/.env.example', from: 'taman_db', to: '{{nameSnake}}' },
  ],
} satisfies TemplateManifest;
```
Also add a one-line comment above `name: 'taman-better-auth-back',` in `apps/api/nitro.config.ts`:
```ts
      // Deployed worker name: renaming creates a new worker. Generated projects get `<name>-api` (template.manifest.ts).
```
Keep the comment on its own line so the manifest's `from` string still matches.

- [ ] **Step 4: Commit, then run the test green**

```bash
npx eslint template.manifest.ts apps/api/nitro.config.ts
git add template.manifest.ts apps/api/nitro.config.ts packages/create-taman/src/__tests__/manifest.test.ts
git commit -m "feat: add template.manifest.ts for create-taman

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>" >/dev/null 2>&1
pnpm vitest run packages/create-taman
```
Expected: eslint clean; every create-taman test passes, including the manifest test. If it reports `warnings` (a surviving `@taman/`) or leftover words, fix the source or add a `remove`/`rename` entry, commit, and re-run — never loosen the test.

---

### Task 10: CI smoke test

**Files:**
- Create: `.github/scripts/template-smoke.mjs`
- Modify: `.github/workflows/release.yml` (new `template-smoke` job; `select-mode` needs it)

**Interfaces:**
- Consumes: the built `packages/create-taman/dist/bin.mjs` (built by `pnpm pack`'s `prepack`), `template.manifest.ts`, `--from`.

- [ ] **Step 1: Write the smoke script**

`.github/scripts/template-smoke.mjs`:
```js
// Generates a project from this checkout the way `create-taman` does, then
// proves it installs, builds, type-checks, tests and lints. Published
// packages are packed from this commit, so unpublished changes are covered.
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, relative } from 'node:path';
import process from 'node:process';

// Problems in the user's in-progress tabs work. Remove each entry when that
// work lands; the script fails if an entry no longer occurs, so this list
// cannot go stale.
const KNOWN_TYPE_ERRORS = [
  'packages/shell/layouts/src/core/tabbar/layout-core-tabbar.vue(58,37): error TS2339: Property \'styleType\' does not exist on type \'TabbarPreferences\'.',
];
const LINT_SKIP = ['packages/shell/layouts/src/core/tabbar/layout-core-tabbar.vue'];

const root = process.cwd();
const work = mkdtempSync(join(tmpdir(), 'template-smoke-'));
const packs = join(work, 'packs');
const project = join(work, 'acme-app');
const env = { ...process.env, CI: 'true' };

function run(command, args, cwd = root, options = {}) {
  console.log(`\n$ ${command} ${args.join(' ')}  (in ${relative(root, cwd) || '.'})`);
  return execFileSync(command, args, { cwd, encoding: 'utf8', env, stdio: 'inherit', ...options });
}

function capture(command, args, cwd) {
  try {
    return execFileSync(command, args, { cwd, encoding: 'utf8', env, stdio: ['ignore', 'pipe', 'pipe'] });
  } catch (error) {
    return `${error.stdout ?? ''}${error.stderr ?? ''}`;
  }
}

function walk(dir, visit) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (['node_modules', 'dist', '.output', '.nx', '.git', '.pohon-ui'].includes(entry.name)) {
      continue;
    }
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, visit);
    } else {
      visit(full);
    }
  }
}

// 1. Pack every publishable package (each builds in `prepack`)
mkdirSync(packs);
const publishable = JSON.parse(execFileSync('pnpm', ['ls', '-r', '--depth', '-1', '--json'], { cwd: root, encoding: 'utf8' }))
  .filter((pkg) => pkg.name && !pkg.private);
for (const pkg of publishable) {
  run('pnpm', ['pack', '--pack-destination', packs], pkg.path, { stdio: ['ignore', 'ignore', 'inherit'] });
}
const tarballs = readdirSync(packs).map((file) => {
  const manifest = JSON.parse(execFileSync('tar', ['-xzOf', join(packs, file), 'package/package.json'], { encoding: 'utf8' }));
  return [manifest.name, join(packs, file)];
});

// 2. Generate from the committed HEAD
run('node', [join(root, 'packages/create-taman/dist/bin.mjs'), project, '--from', root, '--scope', 'acme', '--yes', '--no-install', '--no-git']);

// 3. Resolve published packages from the tarballs instead of npm
const workspaceFile = join(project, 'pnpm-workspace.yaml');
const overrides = tarballs.map(([name, file]) => `  '${name}': file:${file}`).join('\n');
writeFileSync(workspaceFile, readFileSync(workspaceFile, 'utf8').replace(/^overrides:\n/m, `overrides:\n${overrides}\n`));

// 4. Install, build (web first: it generates the types vue-tsc needs)
run('pnpm', ['install'], project);
run('pnpm', ['--filter', '@acme/web', 'build'], project);
run('pnpm', ['nx', 'run', 'api:build'], project);

// 5. Type-check every tsconfig
const tsconfigs = [];
walk(project, (file) => file.endsWith('/tsconfig.json') && tsconfigs.push(file));
const typeErrors = new Set();
for (const tsconfig of tsconfigs) {
  const output = capture(join(project, 'node_modules/.bin/vue-tsc'), ['--noEmit', '-p', tsconfig], project);
  for (const line of output.split('\n')) {
    if (line.includes('error TS')) {
      typeErrors.add(line.trim().replace(/^(?:\.\.\/)+/, ''));
    }
  }
}
const unexpected = [...typeErrors].filter((line) => !KNOWN_TYPE_ERRORS.includes(line));
const stale = KNOWN_TYPE_ERRORS.filter((line) => !typeErrors.has(line));

// 6. Unit tests and lint (ts/vue only; the Markdown linter crashes on this ESLint version)
run('pnpm', ['test:unit'], project);
const lintFiles = [];
walk(project, (file) => /\.(?:ts|vue)$/.test(file) && !file.endsWith('.d.ts') && lintFiles.push(relative(project, file)));
run(join(project, 'node_modules/.bin/eslint'), ['--no-warn-ignored', ...lintFiles.filter((file) => !LINT_SKIP.includes(file))], project);

// 7. Nothing template-only may leak into the project
const leaks = [];
walk(project, (file) => {
  if (statSync(file).size > 2_000_000) {
    return;
  }
  const text = readFileSync(file, 'utf8');
  const path = relative(project, file);
  if (text.includes('@taman/')) {
    leaks.push(`${path}: @taman/`);
  }
  if (/talent|ticket|ngibur/i.test(text)) {
    leaks.push(`${path}: ngibur domain word`);
  }
  if (path.includes('views/examples')) {
    leaks.push(`${path}: example gallery`);
  }
});

const failures = [
  ...unexpected.map((line) => `type error: ${line}`),
  ...stale.map((line) => `KNOWN_TYPE_ERRORS entry no longer occurs, remove it: ${line}`),
  ...leaks,
];
if (failures.length > 0) {
  console.error(`\n✗ template smoke test failed:\n  - ${failures.join('\n  - ')}`);
  process.exit(1);
}
console.log(`\n✓ generated project (${project}) installs, builds, type-checks, tests and lints`);
```

- [ ] **Step 2: Run it locally**

```bash
cd /Users/praburangki/Dev/@vinicunca/taman-cli && node .github/scripts/template-smoke.mjs 2>&1 | tail -25
```
Expected: ends with `✓ generated project … installs, builds, type-checks, tests and lints`. If a step fails, fix the template (or manifest) rather than the script; the only permitted allow-list entries are the tabs ones above. Record anything else as a ruling.

- [ ] **Step 3: Add the CI job**

In `.github/workflows/release.yml`, add after the `verify` job:
```yaml
  template-smoke:
    name: Generate and verify a template project
    runs-on: ubuntu-latest
    permissions:
      contents: read
    steps:
      - uses: actions/checkout@v7
        with:
          persist-credentials: false
      - uses: pnpm/action-setup@v6
      - uses: actions/setup-node@v7
        with:
          node-version: 24
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: node .github/scripts/template-smoke.mjs
```
and change the `select-mode` job's `needs: verify` to `needs: [verify, template-smoke]` so a broken template blocks releases. Update the file's header comment: add a line `# - Every push and pull request: \`template-smoke\` generates a project with create-taman and proves it installs, builds, type-checks, tests and lints.`

- [ ] **Step 4: Verify and commit**

```bash
node -e "const y=require('fs').readFileSync('.github/workflows/release.yml','utf8'); if(!/template-smoke:/.test(y)||!/needs: \[verify, template-smoke\]/.test(y)) process.exit(1); console.log('workflow ok')"
git add .github/scripts/template-smoke.mjs .github/workflows/release.yml
git commit -m "ci: generate and verify a template project on every PR

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>" >/dev/null 2>&1
```
Expected: `workflow ok`.

---

### Task 11: Final verification and hand-off

- [ ] **Step 1: Full verification**

```bash
cd /Users/praburangki/Dev/@vinicunca/taman-cli
pnpm vitest run packages/create-taman 2>&1 | grep -E "Test Files|Tests "
pnpm test:unit 2>&1 | grep -E "^ FAIL|Tests " | sort -u
node .github/scripts/verify-packages.mjs 2>&1 | tail -8
(cd apps/web && pnpm build 2>&1 | grep -E " error|✓ built"); git checkout -- apps/web/components.d.ts apps/web/auto-imports.d.ts 2>/dev/null; rm -f apps/web/dist.zip
for t in $(find apps packages -name tsconfig.json -not -path '*/node_modules/*' -not -path '*/dist/*'); do (cd $(dirname $t) && npx vue-tsc --noEmit -p tsconfig.json 2>&1 | grep 'error TS'); done | sort -u | grep -v '/tabs/\|layout-core-tabbar'
graphify update . >/dev/null 2>&1 && git add -A graphify-out $(git ls-files -m -o --exclude-standard | grep graphify-out | tr '\n' ' ') 2>/dev/null && git commit -m "chore: refresh knowledge graph

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>" >/dev/null 2>&1
git log --oneline main..HEAD
```
Expected: create-taman tests all pass; full suite shows only the 5 known failures; verify prints ✓ for **8** packages (the 7 plus `create-taman@0.1.0`); `✓ built`; no type errors outside the tabs files.

- [ ] **Step 2: Hand off**

Tell the user the branch is ready and what remains before `pnpm create taman` works for real, in order:
1. Publish `@vinicunca/taman-core` and `@vinicunca/taman-ui` (not on npm yet), then `create-taman`, each once locally (`pnpm publish --access public` from the package folder after `pnpm install`), then `npm trust github <pkg> --file release.yml --repo vinicunca/taman --env npm --allow-publish` for each.
2. Tag the commit those versions were published from: `git tag create-taman@0.1.0 && git push origin create-taman@0.1.0` — the CLI downloads this tag by default. Later releases get tags from changesets automatically.
3. Until then, `node packages/create-taman/dist/bin.mjs my-app --from .` (or `--ref main`) works locally.
