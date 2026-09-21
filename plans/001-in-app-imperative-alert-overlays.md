# Plan 001: Mount imperative alerts through Pohon's in-app overlay host

> **Executor instructions**: Follow this plan step by step. Run every verification command and confirm the expected result before moving to the next step. Do not run linting, do not create a Git commit, and do not push. If anything in the "STOP conditions" section occurs, stop and report — do not improvise. When done, update this plan's status row in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat e8f1659..HEAD -- apps/better-auth-front/src/bootstrap.ts apps/better-auth-front/src/views/examples/dialog/index.vue packages/@core/base/shared/src/global-state.ts packages/@core/ui-kit/popup-ui/src/alert packages/@core/ui-kit/taman-ui/src/components/button/taman-button-icon.vue packages/shell/layouts/src/widgets/layout-widget-user-dropdown.vue`
> If any in-scope file changed since this plan was written, compare the "Current state" excerpts against the live code before proceeding; on a mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: MED — the feature is used by global prompts and confirmation flows; an incorrect bridge could leave an overlay mounted or settle a promise at the wrong time.
- **Depends on**: none
- **Category**: tech-debt
- **Planned at**: commit `e8f1659`, 2026-09-21

## Why this matters

`tamanAlert`, `tamanConfirm`, and `tamanPrompt` currently create a DOM element and call Vue's imperative `render()` outside the application tree. This forces `bootstrap.ts` to copy `app._context` into a global singleton, and it still does not inherit providers established inside `<PApp>` (notably Pohon's tooltip provider). Pohon already supplies a persistent, in-tree overlay host through `<PApp>`; moving the alert family onto that host removes the manual mount/context workaround while retaining the existing Taman alert UX and the richer, view-owned `useTamanDialog` mechanism.

This plan intentionally preserves the existing public cancellation semantics: confirmation or prompt cancellation rejects with `Error('dialog cancelled')`; confirmation resolves; and prompt confirmation resolves to its value. A later, explicit API decision may replace cancellation rejection with a result value.

## Current state

- `apps/better-auth-front/src/app.vue` mounts `<PApp>` around `<RouterView>`. Pohon's `PApp` internally mounts `POverlayProvider`, so an overlay created with `useOverlay()` is rendered as a normal descendant of the app.
- `/Users/praburangki/Dev/@vinicunca/pohon/src/runtime/components/OverlayProvider.vue:20-29` renders every managed overlay with `v-model:open`, listens for `close` to settle the promise, and listens for `after:leave` to unmount it. Its protocol must be followed exactly.
- `/Users/praburangki/Dev/@vinicunca/pohon/src/runtime/composables/useOverlay.ts:65-175` provides the shared overlay registry. `create(component, { destroyOnClose: true })` creates an entry; `open()` returns a promise; `close(id, value)` settles it; and `unmount(id)` removes a closed entry when `destroyOnClose` is true.
- `packages/@core/ui-kit/popup-ui/src/alert/alert-builder.ts` is the current imperative implementation. Its load-bearing behavior is:

  ```ts
  // alert-builder.ts:55-102
  const container = document.createElement('div');
  document.body.append(container);
  const props = {
    onClosed: (isConfirm: boolean) => {
      render(null, container);
      container.remove();
      if (isConfirm) resolve();
      else reject(new Error('dialog cancelled'));
    },
    ...options,
    open: true,
  };
  const vnode = h(Alert, props);
  vnode.appContext = globalShareState.getAppContext();
  render(vnode, container);
  ```

  `tamanConfirm()` is a `showCancel: true` wrapper around this function (lines 106-138). `tamanPrompt()` delegates to `tamanConfirm()` after constructing an input-content renderer and autofocus hook (lines 140-238). Preserve those behaviors.

- `packages/@core/ui-kit/popup-ui/src/alert/alert.vue:41-50,143-157` owns `v-model:open`, async `beforeClose`, loading state, and emits `closed(isConfirm)` only after its `AlertDialogContent` finishes closing. It is the source of truth for whether the user confirmed.
- `packages/@core/ui-kit/popup-ui/src/alert/alert-builder.ts:240-248` currently unmounts DOM nodes directly. It does **not** resolve or reject outstanding promises. Forced cleanup in the new design must settle every managed alert as cancellation before removing it.
- `apps/better-auth-front/src/bootstrap.ts:1-3,88-92` imports `globalShareState` solely to install the imperative-alert app context. Repository search found no remaining caller of `getAppContext` or `setAppContext` outside this alert implementation and its test.
- `packages/@core/ui-kit/taman-ui/src/components/button/taman-button-icon.vue:24-31` contains a comment explaining its conditional tooltip mount as an alert-outside-app workaround. The conditional itself remains useful (do not mount a tooltip without text); update only the stale alert-specific rationale.
- Existing popup tests use Vitest + `happy-dom` and explicit `createApp()` mount/teardown. Follow `packages/@core/ui-kit/popup-ui/src/alert/__tests__/alert.test.ts:25-64` for this pattern.

## Commands you will need

| Purpose | Command | Expected on success |
|---|---|---|
| Drift check | `git diff --stat e8f1659..HEAD -- apps/better-auth-front/src/bootstrap.ts apps/better-auth-front/src/views/examples/dialog/index.vue packages/@core/base/shared/src/global-state.ts packages/@core/ui-kit/popup-ui/src/alert packages/@core/ui-kit/taman-ui/src/components/button/taman-button-icon.vue packages/shell/layouts/src/widgets/layout-widget-user-dropdown.vue` | No unexpected in-scope drift, or it has been reviewed and approved by the operator. |
| Focused tests | `pnpm vitest run --dom packages/@core/ui-kit/popup-ui/src/alert` | Exit 0; all alert tests pass. |
| Typecheck | `pnpm check:type` | Exit 0 with no TypeScript errors. |

Do not run `pnpm lint`, `pnpm run check`, formatters, Git commit commands, or dependency installation as part of this plan.

## Scope

**In scope** (only these files may change):

- `packages/@core/ui-kit/popup-ui/src/alert/alert-overlay.vue` — create the in-app overlay protocol adapter.
- `packages/@core/ui-kit/popup-ui/src/alert/alert-builder.ts` — replace manual DOM rendering with `useOverlay` while preserving public functions.
- `packages/@core/ui-kit/popup-ui/src/alert/alert.ts` — add only internal result types needed by the adapter, if needed.
- `packages/@core/ui-kit/popup-ui/src/alert/__tests__/alert-builder.test.ts` — replace the app-context implementation test with integration/cleanup coverage.
- `packages/@core/ui-kit/popup-ui/src/alert/__tests__/alert-overlay.test.ts` — create if a focused bridge-protocol test is clearer than extending the builder test.
- `apps/better-auth-front/src/bootstrap.ts` — remove the imperative-alert app-context import and registration.
- `apps/better-auth-front/src/views/examples/dialog/index.vue` — remove the page-owned `clearAllAlerts()` cleanup and guard its informational alert cancellation so it does not create an unhandled rejection.
- `packages/shell/layouts/src/widgets/layout-widget-user-dropdown.vue` — handle the existing cancellation rejection from `tamanConfirm()` explicitly.
- `packages/@core/ui-kit/taman-ui/src/components/button/taman-button-icon.vue` — remove or generalize only the stale outside-app comment; preserve its tooltip behavior.
- `packages/@core/base/shared/src/global-state.ts` — remove `AppContext`, `appContext`, `getAppContext`, and `setAppContext` only after repository search confirms no consumers remain.
- `plans/README.md` — update this plan's status when complete.

**Out of scope**:

- `packages/@core/ui-kit/popup-ui/src/dialog/**` and `drawer/**`. Do not change `useTamanDialog`, `DialogApi`, or their declared-component API.
- Pohon source. Consume `useOverlay` as shipped; do not change `/Users/praburangki/Dev/@vinicunca/pohon`.
- Redesigning public return types or changing cancellation from rejection to `false`/`undefined`.
- Broad cleanup of `globalShareState` component/message registries.
- Any linting, formatting-only pass, dependency changes, commit, push, or pull request.

## Git workflow

- Work on the operator's current branch; do not create a branch unless they ask.
- Do **not** create a commit, push, or open a pull request.
- Preserve unrelated dirty worktree changes. Inspect `git status --short` before and after work and report only files in scope that changed.

## Steps

### Step 1: Add a bridge component that speaks Pohon's overlay protocol

Create `packages/@core/ui-kit/popup-ui/src/alert/alert-overlay.vue`. It is a thin adapter, not a replacement dialog UI:

1. Render the existing `Alert` component and forward every `AlertProps` value, the controlled `open` model, and ordinary event/listener attributes.
2. Define its own `v-model:open` so Pohon's `POverlayProvider` can bind `overlay.isOpen` to it.
3. On `Alert`'s `closed(isConfirm)` event, emit `close` with an internal result object containing `isConfirm`, then emit `after:leave`. `Alert` emits `closed` after its close transition/fallback; that is the point at which Pohon should settle and remove the entry.
4. Do not forward the host protocol listeners (`onClose`, `onAfterLeave`) back into `Alert`; keep them on the adapter. Forward ordinary listeners such as the prompt's generated `onOpened` hook.
5. Keep `Alert` responsible for `beforeClose`, loading, accessibility, portal behavior, and the user decision. The adapter must not duplicate that logic or call `beforeClose` itself.

Use explicit emitted event types. If an internal result type is needed, add an unexported `AlertOverlayResult` type to `alert.ts`; do not expose a new public API in this step.

**Verify**: `pnpm vitest run --dom packages/@core/ui-kit/popup-ui/src/alert` → the suite passes after the corresponding tests in Step 3 are added. Do not run linting.

### Step 2: Replace manual DOM rendering with per-alert overlay entries

Refactor `packages/@core/ui-kit/popup-ui/src/alert/alert-builder.ts`:

1. Remove `document.createElement`, `document.body.append`, Vue `h`/`render`, the `alerts` container list, and `globalShareState` app-context copying.
2. Import Pohon's public `useOverlay` composable and the new `AlertOverlay` adapter. For every `tamanAlert()` call, create a fresh overlay with `destroyOnClose: true`; do not reuse one instance across concurrent alerts.
3. Maintain a module-private set of only the IDs created by this alert builder. Never call Pohon's global `closeAll()`, because it could close another feature's overlay.
4. Open the overlay with the same normalized props currently passed to `Alert` (`open` is controlled by the provider, so do not supply a competing hard-coded prop). Await the adapter result and map `isConfirm: true` to resolve; map all other outcomes to `reject(new Error('dialog cancelled'))`, preserving the current observable contract.
5. Use `finally` to remove the ID from the private set regardless of confirmation, cancellation, or forced cleanup.
6. Implement `clearAllAlerts()` by iterating a snapshot of the private IDs. For each one, call the overlay manager's `close(id, { isConfirm: false })` and then `unmount(id)`. This is forced teardown, so it may skip animation; importantly, it must settle each caller as cancellation and remove the entry from the provider rather than leaving a hanging promise.
7. Leave the argument overload normalization, locale title default, `tamanConfirm` wrapper, and `tamanPrompt` dynamic input/focus behavior unchanged.

**Verify**: `rg -n 'document\.createElement|document\.body\.append|\brender\(|getAppContext|setAppContext' packages/@core/ui-kit/popup-ui/src/alert apps/better-auth-front/src/bootstrap.ts` → no matches. `rg -n 'useOverlay\(' packages/@core/ui-kit/popup-ui/src/alert/alert-builder.ts` → one managed-overlay integration exists.

### Step 3: Replace context-copy testing with real in-app host coverage

Rewrite `packages/@core/ui-kit/popup-ui/src/alert/__tests__/alert-builder.test.ts` using the existing explicit app mount/teardown convention:

1. Mount a minimal app whose root renders Pohon's `PApp`; this supplies the real `POverlayProvider` used by production `apps/better-auth-front/src/app.vue`.
2. Test confirmation: call `tamanConfirm`, trigger the confirm action, and assert the returned promise resolves.
3. Test cancellation: call `tamanConfirm`, trigger cancel, and assert rejection has the existing `dialog cancelled` message. This is characterization coverage, not an endorsement of the long-term API.
4. Test prompt: call `tamanPrompt` with a default value, confirm it, and assert that value is returned. Retain or add a focused test that its generated `onOpened` hook can run after mounting.
5. Test forced cleanup: start an alert/confirm, call `clearAllAlerts()`, assert its promise rejects as cancellation, and assert no overlay entries created by the builder remain mounted. This is the regression test for the previously hanging cleanup path.
6. Ensure `afterEach` awaits/flushes Vue updates as necessary, invokes `clearAllAlerts()`, unmounts the app, and cleans `document.body`. Do not mock Vue `render()` or `globalShareState`; those are intentionally absent from the new architecture.

If direct interaction with the real Pohon transition is unreliable in `happy-dom`, add a small unit test for `alert-overlay.vue` that emits `closed` from a stubbed `Alert` and asserts the adapter emits `close` followed by `after:leave`. Keep one builder-level test mounted through real `PApp` to prove the provider registry path still works.

**Verify**: `pnpm vitest run --dom packages/@core/ui-kit/popup-ui/src/alert` → exit 0, including confirmation, cancellation, prompt, forced-cleanup, and bridge-protocol coverage.

### Step 4: Remove the application-context workaround and stale call-site hazards

1. In `apps/better-auth-front/src/bootstrap.ts`, remove the `globalShareState` import and the `setAppContext(app._context)` comment/block. The app still installs Pohon before mounting, and `<PApp>` supplies the overlay host.
2. In `packages/@core/base/shared/src/global-state.ts`, remove the app-context type, private field, interface property, and accessor methods only after an `rg` search confirms the new alert implementation no longer references them. Leave component and message state untouched.
3. In `apps/better-auth-front/src/views/examples/dialog/index.vue`, remove the `clearAllAlerts` import and route `onBeforeUnmount` cleanup. An overlay is now owned by the app-level host, not the route component. Add an explicit no-op cancellation handler to the informational `tamanAlert(...).then(...)` demo so Escape/dismiss does not yield an unhandled rejection under the preserved contract.
4. In `packages/shell/layouts/src/widgets/layout-widget-user-dropdown.vue`, make `handleLogout` explicitly swallow normal cancellation after its success handler. Do not emit logout after cancellation.
5. In `taman-button-icon.vue`, retain the conditional tooltip rendering but change the comment to describe its general purpose; remove the assertion that the alert is rendered outside the base app.

**Verify**: `rg -n 'getAppContext|setAppContext|appContext' apps packages --glob '*.{ts,vue}'` → no matches. `rg -n 'clearAllAlerts' apps/better-auth-front/src/views/examples/dialog/index.vue` → no matches. Review `git diff --check` → no whitespace errors (this is a diff integrity check, not linting).

### Step 5: Run focused verification and record the result

1. Run the alert suite first, then the repository typecheck.
2. Inspect the diff and status; verify every changed file is in the scope list and unrelated user work remains untouched.
3. Update Plan 001 to `DONE` in `plans/README.md` only after both commands succeed. Do not create a commit.

**Verify**:

```sh
pnpm vitest run --dom packages/@core/ui-kit/popup-ui/src/alert
pnpm check:type
git status --short
```

Expected: both verification commands exit 0; `git status --short` contains only the expected in-scope changes in addition to pre-existing user changes.

## Test plan

- Follow `packages/@core/ui-kit/popup-ui/src/alert/__tests__/alert.test.ts` for Vue app mount/teardown style.
- Add coverage for the adapter's `closed → close → after:leave` protocol, either directly or through a stable provider-host integration test.
- Add builder-level coverage for confirm resolve, cancel rejection, prompt value propagation, and `clearAllAlerts()` settling a pending promise.
- Retain the existing Alert component tests for button, cancel, and Escape behavior; they validate the underlying UI that the adapter delegates to.
- Verify with `pnpm vitest run --dom packages/@core/ui-kit/popup-ui/src/alert` and `pnpm check:type`; do not run linting.

## Done criteria

- [ ] The imperative alert builder contains no manual DOM container, Vue `render()`, or copied app context.
- [ ] Every alert instance is rendered by Pohon's in-app `POverlayProvider` through `useOverlay`.
- [ ] `tamanAlert`, `tamanConfirm`, and `tamanPrompt` preserve their existing overloads, rendering, async close guard, focus behavior, and cancellation contract.
- [ ] `clearAllAlerts()` settles pending calls as cancellation and removes only entries created by the alert builder.
- [ ] `useTamanDialog` and drawer files are untouched.
- [ ] `globalShareState` no longer has an app-context responsibility, and the bootstrap workaround is gone.
- [ ] The focused alert tests and `pnpm check:type` pass.
- [ ] No linting, commits, pushes, or dependency installation occurred.
- [ ] `plans/README.md` marks Plan 001 as DONE.

## STOP conditions

Stop and report back rather than improvising if:

- `<PApp>` does not mount `POverlayProvider` in the version of `pohon-ui` resolved by this workspace, or the builder and host receive different `useOverlay` singleton instances.
- Pohon's provider protocol differs from `v-model:open`, `close`, and `after:leave` in the installed package.
- Moving `Alert` under the host changes its `beforeClose`, focus, portal, or `closed` event timing in a way that prevents preserving the existing promise contract.
- Repository search finds a consumer of `getAppContext` or `setAppContext` outside the planned alert migration, especially a published-package or runtime consumer.
- A test requires changing Pohon source, dialog/drawer code, or unrelated app infrastructure.
- The focused alert suite or typecheck fails twice after a reasonable in-scope correction.

## Maintenance notes

- The `AlertOverlay` adapter is the sole translation boundary between Taman's confirmation semantics and Pohon's generic overlay protocol. Future imperative overlays should either reuse this pattern or intentionally define their own result mapping; do not reintroduce direct `render()` calls.
- Keep the private alert-ID set: using `useOverlay().closeAll()` would make alert cleanup affect unrelated overlay consumers.
- Reviewers should pay particular attention to settling exactly once during normal transition completion and forced cleanup, and to forwarding the prompt's `onOpened` autofocus listener.
- A future API plan may make cancellation a resolved result (`false`/`undefined`) rather than a rejected promise. That should be a dedicated breaking-change decision with a call-site migration, not folded into this rendering refactor.
