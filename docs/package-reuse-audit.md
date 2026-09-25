# Taman package reuse and unused-code audit

Date: 2026-09-25. Scope: findings outside `apps`; app source inspected only to verify consumers. No source fixes, deletions, linting, database operations, or runtime tests performed.

## Conclusion

There is real unused code, but some of it represents unfinished migration behavior. Finish or explicitly retire those features before deleting their implementation. The repository already has useful reusable layers; it is currently better suited to workspace reuse than standalone package distribution.

## Priority findings

| Priority | Location | Evidence and recommended disposition |
| --- | --- | --- |
| Finish or retire | `packages/shell/app-ui/src/components/auth/auth-register.vue:47` | `valid` is ignored; submission retrieves values, logs them, and never emits the commented-out submit event. This is incomplete registration behavior, not just an unused variable. Restore validation gating and the typed submit contract, or retire this component if registration belongs entirely to the app. |
| Finish or retire | `packages/shell/layouts/src/widgets/preferences/layout-widget-preferences-drawer.vue:51` | Ten destructured preference values are unused. Shortcut, general, and custom tab bodies are literal placeholders. Reset, pin, and copy buttons have no click handlers. Finish the supported settings or remove their advertised controls. |
| Finish or retire | `packages/shell/layouts/src/widgets/layout-widget-user-dropdown.vue:65` | `handleLogout` is unreachable because its menu entry is commented out. Decide whether logout is provided by this reusable widget or exclusively by consumer-supplied menu items. |
| Finish or retire | `packages/shell/layouts/src/core/layout-core-header.vue:65` | Both shortcut-enable computed values are unused; the keyboard registration block is commented out. `tamanConfirm` and `LayoutWidgetNotification` imports are also unused. Existing ordinary logout/lock handlers still have separate uses. |
| Resolve stale contract | `packages/@core/base/shared/src/utils/letter.ts:27` | Local `toCamelCase` is unexported and unused, but `utils/__tests__/letter.test.ts:6` still imports it. Either restore the intended export or retire the helper and update its tests together. Do not delete based on TS6133 alone. |
| Cleanup candidate | `packages/@core/ui-kit/popup-ui/src/drawer/drawer.vue:55` | `wrapperRef` is never read or connected to the template. |
| Incomplete control | `packages/shell/layouts/src/widgets/preferences/blocks/layout/preferences-sidebar.vue:18` | The active sidebar preferences component declares `sidebarWidth` but never reads it. Decide whether width adjustment should exist. |
| Legacy subtree | `packages/shell/layouts/src/widgets/preferences/blocks/index.ts:1` | Old block exports are commented out; only five new preference components are exported. Knip reports 24 old block files unreachable from configured entry points. Their internal references do not establish reachability from the current drawer. Some also contain type errors. Archive/delete as a group only after deciding which missing settings to port. |
| Cleanup candidates | `packages/@core/ui-kit/pohon-ui-theme/src/theme/` | 43 `theme.* copy.ts` files are unreferenced by the explicit theme registry. Five other disconnected themes are `theme.blog.ts`, `theme.chats.ts`, `theme.pricing-plan.ts`, `theme.progress-group.ts`, and `theme.splitter.ts`. Retain a theme only if you intend to expose it through the registry. |

## Public APIs: unused here does not mean obsolete

`usePagination`, `useHoverToggle`, `getPopupContainer`, and `IndexedDBDriver` have no non-test implementation callers found in the checked source. They remain exported APIs; IndexedDB also has documentation. Decide whether these belong in the supported toolkit before removing them. Download helpers and optional UI primitives need the same treatment.

Do not delete `startProgress`, `stopProgress`, `globalShareState`, or `generatorContentHash`: direct source inspection finds real consumers. Vben constants also have app-side imports in the existing development route. A scanner can misclassify exports across compiled entry points, barrel re-exports, namespace imports, framework discovery, and test-only usage. The inventory below is triage data, not a deletion manifest.

## Remaining Vben defaults

The port still contains Vben avatar/PWA URLs in `packages/@core/preferences/src/config.ts` and `internal/vite-config/src/options.ts`, a documentation URL in `internal/vite-config/src/config/application.ts`, and the default IndexedDB name `vben-storage`. These are branding/default-configuration decisions rather than unused-code findings. Preserve upstream license attribution in the license plugin when changing branding.

## Reusing the packages

| Layer | Current packages | Suggested ownership |
| --- | --- | --- |
| Foundation | `@taman-core/shared`, typings, composables | Shared utilities and contracts; keep application-specific imports out. |
| UI system | taman-ui, form-ui, popup-ui, layout-ui, menu-ui, tabs-ui, pohon-ui-theme, `@taman/designs` | Shared components, styling, and behavior. Keep the Pohon/Vue integration explicit. |
| Dashboard shell | `@taman/layouts`, app-ui, stores, preferences, locales, effects/composables, access | Reuse as the dashboard platform. Apps supply routes, identity/session behavior, translations, branding, form adapters, and domain pages. |
| Domain/backend | api-contract, db-pg, rbac | Currently includes Todo and organization policy/schema. Adapt per real project, or extract only the genuinely common auth/organization primitives. |
| Tooling | internal/vite-config, node-utils, tsconfig | Shared workspace build tooling. These packages are private and need a distribution strategy for separate-repository reuse. |

### First real project: reuse inside this workspace

1. Create a thin app with direct `workspace:*` dependencies on the packages it imports. Keep new business pages, API client wiring, session/auth behavior, route guards, and app preferences in the app.
2. Use the current frontend bootstrap as an integration reference, not a requirement to copy its demo domains. Initialize preferences with a unique storage namespace; register form adapters, loading/access directives, i18n, stores, and the router. Include query infrastructure only when the project uses it.
3. Carry over the styling integration: `@taman/designs/styles`, `virtual:uno.css`, the Pohon Vue plugin, the theme plugin producing `virtual:pohon-theme`, and the Uno preset. Avoid treating a UI-package import alone as complete setup.
4. Give the new app its own preference overrides and locale loader. Provide its own user menu/session data through component props, events, and access callbacks.
5. Keep the real project's contract, schema/migrations, and RBAC resource statements separate from demo Todo rules. Reuse common code through explicit packages rather than importing the original app.
6. Verify a small consumer flow: shell navigation, a validated form, dialog/drawer, theme persistence, locale switching, login/logout, and the real API call. Run direct typechecks and focused tests; do not use lint-containing aggregate checks.

### Before consumption from a separate repository

- Normalize package exports and build artifacts. Some packages point to raw `.ts`/`.vue`; others default to `dist/index.mjs`. `@taman-core/preferences` has no runtime `default` condition. `menu-ui` and `tabs-ui` advertise `dist` defaults but have no build script/config in their package directories. Define and test one distribution contract.
- Fix the broken `@taman/db-pg/schemas` subpath: its manifest points to `src/schemas/index.ts`, while the source uses `src/schema/index.ts`.
- Remove the reverse dependency from `packages/db-pg/gen-auth-schema.ts` into `apps/better-auth-back/server/auth`. Put generation orchestration in the app or accept an explicit shared auth configuration. This currently pulls app diagnostics into the database package's typecheck.
- Make styling configuration portable. The existing app's Uno configuration walks `../../packages/designs/src`; a separate repository will not have that relative path. Export a supported preset/plugin entry and document theme/style loading.
- Audit peers and singleton state. Vue, router, Pinia, and UI-framework ownership should be explicit for published packages; preferences, stores, i18n, and component registration currently use shared module state. Separate browser apps can reuse them, but multiple independent roots in one runtime need a separate design review.
- Package and install artifacts into a clean consumer fixture before publishing. Verify declarations, CSS/assets, export conditions, runtime dependency availability, and the exact bootstrap recipe. No publishing or install changes were performed in this audit.

## Verification and tooling gaps

Direct `vue-tsc --noEmit --incremental false --pretty false -p <config>` checks ran for all 29 discovered `tsconfig.json` files under packages, internal, and scripts. Eleven passed; eighteen failed, often because the same shared error propagated into multiple projects. There are 23 unique unused-local diagnostics, not 23 separate broken features. Other errors include old preference controls, test typing, potentially undefined button callbacks, and database generation/configuration issues. App diagnostics reached through the database generator are excluded from the findings inventory.

`scripts/tooling/src/check-dep.ts` passes `--include dependencies`; it does not scan unused exports or files. Its error handler reports dependency findings without setting a failing exit status. Most shared packages also lack a `typecheck` package script, so `turbo run typecheck` is not equivalent to checking all 29 configurations.

For a future recurring check, configure app/framework entry points, Nx-invoked scripts, benchmarks, and workspace source mappings explicitly. Keep public API candidates advisory; use compiler diagnostics and verified unreachable private files for actionable cleanup. Never run Knip autofix against this inventory without reviewing each category.

Graphify was used for navigation (queries only, no extraction/API cost); its graph contains removed package paths, so current source was authoritative. No source code was modified, so no graph rebuild was run.
