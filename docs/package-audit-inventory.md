# Detailed package audit inventory

Date: 2026-09-25. Read [the assessment](package-reuse-audit.md) before acting on this inventory.

## Compiler-confirmed unused local declarations

These are compiler findings, not automatic deletion instructions. In particular, toCamelCase still has a stale test import, and several unused declarations belong to unfinished UI features.

```text
packages/@core/base/shared/src/utils/letter.ts(27,10): error TS6133: 'toCamelCase' is declared but its value is never read.
packages/@core/ui-kit/popup-ui/src/drawer/drawer.vue(55,7): error TS6133: 'wrapperRef' is declared but its value is never read.
packages/shell/app-ui/src/components/auth/auth-register.vue(48,9): error TS6133: 'valid' is declared but its value is never read.
packages/shell/layouts/src/core/layout-core-header.vue(2,10): error TS6133: 'tamanConfirm' is declared but its value is never read.
packages/shell/layouts/src/core/layout-core-header.vue(14,3): error TS6133: 'LayoutWidgetNotification' is declared but its value is never read.
packages/shell/layouts/src/core/layout-core-header.vue(65,7): error TS6133: 'enableLockScreenShortcutKey' is declared but its value is never read.
packages/shell/layouts/src/core/layout-core-header.vue(69,7): error TS6133: 'enableLogoutShortcutKey' is declared but its value is never read.
packages/shell/layouts/src/widgets/layout-widget-user-dropdown.vue(65,16): error TS6133: 'handleLogout' is declared but its value is never read.
packages/shell/layouts/src/widgets/preferences/blocks/layout/breadcrumb.vue(8,1): error TS6133: 'ToggleItem' is declared but its value is never read.
packages/shell/layouts/src/widgets/preferences/blocks/layout/breadcrumb.vue(21,7): error TS6133: 'typeItems' is declared but its value is never read.
packages/shell/layouts/src/widgets/preferences/blocks/layout/copyright.vue(12,7): error TS6133: 'copyrightIcp' is declared but its value is never read.
packages/shell/layouts/src/widgets/preferences/blocks/layout/copyright.vue(13,7): error TS6133: 'copyrightIcpLink' is declared but its value is never read.
packages/shell/layouts/src/widgets/preferences/blocks/layout/preferences-sidebar.vue(18,7): error TS6133: 'sidebarWidth' is declared but its value is never read.
packages/shell/layouts/src/widgets/preferences/layout-widget-preferences-drawer.vue(51,3): error TS6133: 'customPreferences' is declared but its value is never read.
packages/shell/layouts/src/widgets/preferences/layout-widget-preferences-drawer.vue(52,3): error TS6133: 'diffCustomPreference' is declared but its value is never read.
packages/shell/layouts/src/widgets/preferences/layout-widget-preferences-drawer.vue(53,3): error TS6133: 'diffPreference' is declared but its value is never read.
packages/shell/layouts/src/widgets/preferences/layout-widget-preferences-drawer.vue(54,3): error TS6133: 'isDark' is declared but its value is never read.
packages/shell/layouts/src/widgets/preferences/layout-widget-preferences-drawer.vue(55,3): error TS6133: 'isFullContent' is declared but its value is never read.
packages/shell/layouts/src/widgets/preferences/layout-widget-preferences-drawer.vue(56,3): error TS6133: 'isHeaderNav' is declared but its value is never read.
packages/shell/layouts/src/widgets/preferences/layout-widget-preferences-drawer.vue(57,3): error TS6133: 'isHeaderSidebarNav' is declared but its value is never read.
packages/shell/layouts/src/widgets/preferences/layout-widget-preferences-drawer.vue(58,3): error TS6133: 'isMixedNav' is declared but its value is never read.
packages/shell/layouts/src/widgets/preferences/layout-widget-preferences-drawer.vue(60,3): error TS6133: 'isSideMixedNav' is declared but its value is never read.
packages/shell/layouts/src/widgets/preferences/layout-widget-preferences-drawer.vue(62,3): error TS6133: 'isSideNav' is declared but its value is never read.
```

## Unreachable-file candidates

79 raw file candidates outside apps. Configuration files, database tooling and benchmarks need special handling; they are not established dead code.

| File | Disposition |
| --- | --- |
| `.commitlintrc.js` | Keep: configuration discovery, not a runtime import |
| `unocss.config.ts` | Keep: explicitly documents editor-extension use |
| `packages/shell/layouts/src/widgets/preferences/blocks/block.vue` | Disconnected old preference subtree: finish/retire feature first |
| `packages/shell/layouts/src/widgets/preferences/blocks/checkbox-item.vue` | Disconnected old preference subtree: finish/retire feature first |
| `packages/shell/layouts/src/widgets/preferences/blocks/input-item.vue` | Disconnected old preference subtree: finish/retire feature first |
| `packages/shell/layouts/src/widgets/preferences/blocks/number-field-item.vue` | Disconnected old preference subtree: finish/retire feature first |
| `packages/shell/layouts/src/widgets/preferences/blocks/select-item.vue` | Disconnected old preference subtree: finish/retire feature first |
| `packages/shell/layouts/src/widgets/preferences/blocks/switch-item.vue` | Disconnected old preference subtree: finish/retire feature first |
| `packages/shell/layouts/src/widgets/preferences/blocks/toggle-item.vue` | Disconnected old preference subtree: finish/retire feature first |
| `packages/shell/layouts/src/widgets/preferences/blocks/custom/custom.vue` | Disconnected old preference subtree: finish/retire feature first |
| `packages/shell/layouts/src/widgets/preferences/blocks/general/animation.vue` | Disconnected old preference subtree: finish/retire feature first |
| `packages/shell/layouts/src/widgets/preferences/blocks/general/general.vue` | Disconnected old preference subtree: finish/retire feature first |
| `packages/shell/layouts/src/widgets/preferences/blocks/layout/breadcrumb.vue` | Disconnected old preference subtree: finish/retire feature first |
| `packages/shell/layouts/src/widgets/preferences/blocks/layout/copyright.vue` | Disconnected old preference subtree: finish/retire feature first |
| `packages/shell/layouts/src/widgets/preferences/blocks/layout/footer.vue` | Disconnected old preference subtree: finish/retire feature first |
| `packages/shell/layouts/src/widgets/preferences/blocks/layout/header.vue` | Disconnected old preference subtree: finish/retire feature first |
| `packages/shell/layouts/src/widgets/preferences/blocks/layout/navigation.vue` | Disconnected old preference subtree: finish/retire feature first |
| `packages/shell/layouts/src/widgets/preferences/blocks/layout/sidebar.vue` | Disconnected old preference subtree: finish/retire feature first |
| `packages/shell/layouts/src/widgets/preferences/blocks/layout/tabbar.vue` | Disconnected old preference subtree: finish/retire feature first |
| `packages/shell/layouts/src/widgets/preferences/blocks/layout/widget.vue` | Disconnected old preference subtree: finish/retire feature first |
| `packages/shell/layouts/src/widgets/preferences/blocks/shortcut-keys/global.vue` | Disconnected old preference subtree: finish/retire feature first |
| `packages/shell/layouts/src/widgets/preferences/blocks/theme/builtin.vue` | Disconnected old preference subtree: finish/retire feature first |
| `packages/shell/layouts/src/widgets/preferences/blocks/theme/color-mode.vue` | Disconnected old preference subtree: finish/retire feature first |
| `packages/shell/layouts/src/widgets/preferences/blocks/theme/font-size.vue` | Disconnected old preference subtree: finish/retire feature first |
| `packages/shell/layouts/src/widgets/preferences/blocks/theme/radius.vue` | Disconnected old preference subtree: finish/retire feature first |
| `packages/shell/layouts/src/widgets/preferences/blocks/theme/theme.vue` | Disconnected old preference subtree: finish/retire feature first |
| `packages/@core/ui-kit/form-ui/__tests__/benchmark-fixtures.ts` | Benchmark infrastructure: retain unless intentionally retired; configure entry points |
| `packages/@core/ui-kit/form-ui/__tests__/form-component-performance.benchmark.ts` | Benchmark infrastructure: retain unless intentionally retired; configure entry points |
| `packages/@core/ui-kit/form-ui/__tests__/form-performance.benchmark.ts` | Benchmark infrastructure: retain unless intentionally retired; configure entry points |
| `packages/@core/ui-kit/pohon-ui-theme/src/theme/theme.banner copy.ts` | Cleanup candidate: not registered in explicit theme index |
| `packages/@core/ui-kit/pohon-ui-theme/src/theme/theme.blog.ts` | Optional theme: register intentionally or retire |
| `packages/@core/ui-kit/pohon-ui-theme/src/theme/theme.breadcrumb copy.ts` | Cleanup candidate: not registered in explicit theme index |
| `packages/@core/ui-kit/pohon-ui-theme/src/theme/theme.button copy.ts` | Cleanup candidate: not registered in explicit theme index |
| `packages/@core/ui-kit/pohon-ui-theme/src/theme/theme.calendar copy.ts` | Cleanup candidate: not registered in explicit theme index |
| `packages/@core/ui-kit/pohon-ui-theme/src/theme/theme.card copy.ts` | Cleanup candidate: not registered in explicit theme index |
| `packages/@core/ui-kit/pohon-ui-theme/src/theme/theme.carousel copy.ts` | Cleanup candidate: not registered in explicit theme index |
| `packages/@core/ui-kit/pohon-ui-theme/src/theme/theme.changelog-version copy.ts` | Cleanup candidate: not registered in explicit theme index |
| `packages/@core/ui-kit/pohon-ui-theme/src/theme/theme.changelog-versions copy.ts` | Cleanup candidate: not registered in explicit theme index |
| `packages/@core/ui-kit/pohon-ui-theme/src/theme/theme.chats.ts` | Optional theme: register intentionally or retire |
| `packages/@core/ui-kit/pohon-ui-theme/src/theme/theme.chip copy.ts` | Cleanup candidate: not registered in explicit theme index |
| `packages/@core/ui-kit/pohon-ui-theme/src/theme/theme.collapsible copy.ts` | Cleanup candidate: not registered in explicit theme index |
| `packages/@core/ui-kit/pohon-ui-theme/src/theme/theme.color-picker copy.ts` | Cleanup candidate: not registered in explicit theme index |
| `packages/@core/ui-kit/pohon-ui-theme/src/theme/theme.command-palette copy.ts` | Cleanup candidate: not registered in explicit theme index |
| `packages/@core/ui-kit/pohon-ui-theme/src/theme/theme.context-menu copy.ts` | Cleanup candidate: not registered in explicit theme index |
| `packages/@core/ui-kit/pohon-ui-theme/src/theme/theme.drawer copy.ts` | Cleanup candidate: not registered in explicit theme index |
| `packages/@core/ui-kit/pohon-ui-theme/src/theme/theme.dropdown-menu copy.ts` | Cleanup candidate: not registered in explicit theme index |
| `packages/@core/ui-kit/pohon-ui-theme/src/theme/theme.editor copy.ts` | Cleanup candidate: not registered in explicit theme index |
| `packages/@core/ui-kit/pohon-ui-theme/src/theme/theme.editor-drag-handle copy.ts` | Cleanup candidate: not registered in explicit theme index |
| `packages/@core/ui-kit/pohon-ui-theme/src/theme/theme.editor-suggestion-menu copy.ts` | Cleanup candidate: not registered in explicit theme index |
| `packages/@core/ui-kit/pohon-ui-theme/src/theme/theme.editor-toolbar copy.ts` | Cleanup candidate: not registered in explicit theme index |
| `packages/@core/ui-kit/pohon-ui-theme/src/theme/theme.empty copy.ts` | Cleanup candidate: not registered in explicit theme index |
| `packages/@core/ui-kit/pohon-ui-theme/src/theme/theme.error copy.ts` | Cleanup candidate: not registered in explicit theme index |
| `packages/@core/ui-kit/pohon-ui-theme/src/theme/theme.file-upload copy.ts` | Cleanup candidate: not registered in explicit theme index |
| `packages/@core/ui-kit/pohon-ui-theme/src/theme/theme.footer copy.ts` | Cleanup candidate: not registered in explicit theme index |
| `packages/@core/ui-kit/pohon-ui-theme/src/theme/theme.header copy.ts` | Cleanup candidate: not registered in explicit theme index |
| `packages/@core/ui-kit/pohon-ui-theme/src/theme/theme.kbd copy.ts` | Cleanup candidate: not registered in explicit theme index |
| `packages/@core/ui-kit/pohon-ui-theme/src/theme/theme.link copy.ts` | Cleanup candidate: not registered in explicit theme index |
| `packages/@core/ui-kit/pohon-ui-theme/src/theme/theme.listbox copy.ts` | Cleanup candidate: not registered in explicit theme index |
| `packages/@core/ui-kit/pohon-ui-theme/src/theme/theme.main copy.ts` | Cleanup candidate: not registered in explicit theme index |
| `packages/@core/ui-kit/pohon-ui-theme/src/theme/theme.marquee copy.ts` | Cleanup candidate: not registered in explicit theme index |
| `packages/@core/ui-kit/pohon-ui-theme/src/theme/theme.navigation-menu copy.ts` | Cleanup candidate: not registered in explicit theme index |
| `packages/@core/ui-kit/pohon-ui-theme/src/theme/theme.pagination copy.ts` | Cleanup candidate: not registered in explicit theme index |
| `packages/@core/ui-kit/pohon-ui-theme/src/theme/theme.pin-input copy.ts` | Cleanup candidate: not registered in explicit theme index |
| `packages/@core/ui-kit/pohon-ui-theme/src/theme/theme.popover copy.ts` | Cleanup candidate: not registered in explicit theme index |
| `packages/@core/ui-kit/pohon-ui-theme/src/theme/theme.pricing-plan.ts` | Optional theme: register intentionally or retire |
| `packages/@core/ui-kit/pohon-ui-theme/src/theme/theme.progress-group.ts` | Optional theme: register intentionally or retire |
| `packages/@core/ui-kit/pohon-ui-theme/src/theme/theme.scroll-area copy.ts` | Cleanup candidate: not registered in explicit theme index |
| `packages/@core/ui-kit/pohon-ui-theme/src/theme/theme.separator copy.ts` | Cleanup candidate: not registered in explicit theme index |
| `packages/@core/ui-kit/pohon-ui-theme/src/theme/theme.sidebar copy.ts` | Cleanup candidate: not registered in explicit theme index |
| `packages/@core/ui-kit/pohon-ui-theme/src/theme/theme.slideover copy.ts` | Cleanup candidate: not registered in explicit theme index |
| `packages/@core/ui-kit/pohon-ui-theme/src/theme/theme.splitter.ts` | Optional theme: register intentionally or retire |
| `packages/@core/ui-kit/pohon-ui-theme/src/theme/theme.stepper copy.ts` | Cleanup candidate: not registered in explicit theme index |
| `packages/@core/ui-kit/pohon-ui-theme/src/theme/theme.table copy.ts` | Cleanup candidate: not registered in explicit theme index |
| `packages/@core/ui-kit/pohon-ui-theme/src/theme/theme.tabs copy.ts` | Cleanup candidate: not registered in explicit theme index |
| `packages/@core/ui-kit/pohon-ui-theme/src/theme/theme.timeline copy.ts` | Cleanup candidate: not registered in explicit theme index |
| `packages/@core/ui-kit/pohon-ui-theme/src/theme/theme.tree copy.ts` | Cleanup candidate: not registered in explicit theme index |
| `packages/@core/ui-kit/pohon-ui-theme/src/theme/theme.user copy.ts` | Cleanup candidate: not registered in explicit theme index |
| `packages/db-pg/drizzle.config.ts` | Keep: invoked by Nx/database tooling; Drizzle discovery was disabled |
| `packages/db-pg/gen-auth-schema.ts` | Keep: invoked by Nx/database tooling; Drizzle discovery was disabled |

## Raw export and type candidates — advisory only

175 value-export and 113 type-export occurrences; includes barrel duplicates and known false positives, not a count of removable functions. Full source mappings did not eliminate the observed false positives. Real callers were verified for progress helpers, globalShareState, generatorContentHash, and several VBEN constants. Same-file use, declaration files, generated/built entry points, and public/test-only APIs require manual review.

| File | Kind | Candidate names |
| --- | --- | --- |
| `packages/stores/src/index.ts` | exports | `defineStore` (L3) |
| `packages/@core/ui-kit/form-ui/src/index.ts` | exports | `calendarDateCodec` (L2), `createCalendarDateCodec` (L4), `createCalendarDateTimeCodec` (L5), `createTimeCodec` (L6), `FormCodecError` (L7), `timeCodec` (L8) |
| `packages/@core/ui-kit/form-ui/src/index.ts` | types | `CalendarDateCodecOptions` (L11), `FormCodecPhase` (L11), `BuiltInFormComponentType` (L19), `ExtendedFormApi` (L20), `FormActions` (L21), `FormGroupSchema` (L24), `FormSchemaContext` (L25), `FormValueSnapshot` (L27), `TamanFormActionSlotProps` (L28), `TamanFormComponent` (L29), `TamanFormDefaultSlotProps` (L30), `TamanFormFieldArrayProps` (L31), `TamanFormFieldSchema` (L32), `TamanFormFieldSlotProps` (L33), `TamanFormGroupSchema` (L34), `TamanFormResolvedComponentProps` (L36), `TamanFormSlots` (L38) |
| `packages/locales/src/index.ts` | exports | `$te` (L14), `loadLocalesMap` (L17) |
| `packages/locales/src/index.ts` | types | `ImportLocaleFn` (L22), `CompileError` (L26), `Locale` (L30) |
| `packages/effects/composables/src/use-hover-toggle.ts` | exports | `useHoverToggle` (L27) |
| `packages/effects/composables/src/use-pagination.ts` | exports | `usePagination` (L25) |
| `packages/@core/composables/src/index.ts` | exports | `useEmitAsProps` (L9) |
| `packages/@core/ui-kit/popup-ui/src/alert/index.ts` | exports | `useAlertContext` (L1), `clearAllAlerts` (L9), `Alert` (L14) |
| `packages/@core/ui-kit/popup-ui/src/alert/index.ts` | types | `AlertBeforeCloseScope` (L3), `AlertPromptProps` (L4), `IconType` (L5), `TamanAlertProps` (L6) |
| `packages/@core/ui-kit/popup-ui/src/dialog/index.ts` | exports | `TamanDialog` (L2), `setDefaultDialogProps` (L5) |
| `packages/@core/ui-kit/popup-ui/src/drawer/index.ts` | exports | `TamanDrawer` (L2), `setDefaultDrawerProps` (L5) |
| `packages/@core/ui-kit/popup-ui/src/dialog/use-taman-dialog.ts` | exports | `setDefaultDialogProps` (L52) |
| `packages/@core/ui-kit/popup-ui/src/drawer/use-taman-drawer.ts` | exports | `setDefaultDrawerProps` (L56) |
| `packages/@core/ui-kit/form-ui/src/form.codec.ts` | exports | `createCalendarDateCodec` (L49), `createTimeCodec` (L55), `createCalendarDateTimeCodec` (L59), `timeCodec` (L72) |
| `packages/@core/ui-kit/form-ui/src/form.codec.ts` | types | `CalendarDateCodecOptions` (L8) |
| `packages/@core/ui-kit/form-ui/src/form-render/form-render.schema.ts` | exports | `getFormArraySchemaChildren` (L260), `isFormArraySchema` (L279), `resolveArrayChildFieldName` (L287) |
| `packages/@core/preferences/src/index.ts` | exports | `getPreferences` (L6), `getInitialCustomPreferences` (L8), `getPreferencesExtension` (L9), `resetPreferences` (L12), `clearCache` (L13), `preferencesManager` (L19) |
| `packages/stores/shim-pinia.d.ts` | exports | `acceptHMRUpdate` (L10) |
| `packages/@core/ui-kit/taman-ui/src/index.ts` | exports | `Slot` (L3) |
| `packages/api-contract/src/index.ts` | exports | `contract` (L9) |
| `packages/api-contract/src/index.ts` | types | `TamanContract` (L14), `TamanInputs` (L15), `TamanOutputs` (L16), `TamanClient` (L18) |
| `internal/lint-configs/commitlint-config/index.d.ts` | exports | `default` (L5) |
| `internal/lint-configs/commitlint-config/index.mjs` | exports | `default` (L122) |
| `packages/@core/composables/src/use-priority-value.ts` | exports | `usePriorityValue` (L14) |
| `internal/vite-config/src/config/index.ts` | exports | `defineConfig` (L37) |
| `internal/vite-config/src/plugins/index.ts` | exports | `viteArchiverPlugin` (L244), `viteCompressPlugin` (L245), `viteDtsPlugin` (L246), `viteHtmlPlugin` (L247), `viteVisualizerPlugin` (L248) |
| `internal/vite-config/src/index.ts` | exports | `loadAndConvertEnv` (L5) |
| `packages/constants/src/core.ts` | exports | `ONBOARDING_PATH` (L10) |
| `packages/@core/base/shared/src/global-state.ts` | exports | `globalShareState` (L46) |
| `packages/@core/base/shared/src/global-state.ts` | types | `IGlobalSharedState` (L15) |
| `packages/@core/base/shared/src/cache/indexeddb-driver.ts` | exports | `IndexedDBDriver` (L136) |
| `packages/@core/base/shared/src/cache/indexeddb-driver.ts` | types | `IndexedDBDriverOptions` (L137) |
| `packages/@core/base/shared/src/color/convert.ts` | exports | `convertToHsl` (L56), `convertToHslCssVar` (L57), `convertToRgb` (L58), `isValidColor` (L59), `TinyColor` (L60) |
| `packages/@core/base/shared/src/color/generator.ts` | exports | `generatorColorVariables` (L9) |
| `packages/@core/base/shared/src/constants/constants.taman.ts` | exports | `TAMAN_GITHUB_URL` (L1), `TAMAN_DOC_URL` (L2) |
| `packages/@core/base/shared/src/constants/globals.ts` | exports | `CSS_VARIABLE_LAYOUT_CONTENT_HEIGHT` (L2), `CSS_VARIABLE_LAYOUT_CONTENT_WIDTH` (L4), `CSS_VARIABLE_LAYOUT_HEADER_HEIGHT` (L6), `CSS_VARIABLE_LAYOUT_FOOTER_HEIGHT` (L8), `CSS_VARIABLE_LAYOUT_VIEWPORT_HEIGHT` (L10), `ELEMENT_ID_MAIN_CONTENT` (L13), `DISMISSABLE_DIALOG_ID` (L18), `DISMISSABLE_DRAWER_ID` (L19) |
| `packages/@core/base/shared/src/constants/vben.ts` | exports | `VBEN_DOC_URL` (L4), `VBEN_LOGO_URL` (L9), `VBEN_PREVIEW_URL` (L15), `VBEN_ELE_PREVIEW_URL` (L17), `VBEN_NAIVE_PREVIEW_URL` (L19), `VBEN_TD_PREVIEW_URL` (L21) |
| `packages/@core/base/shared/src/utils/calendar-date-codec.ts` | exports | `CalendarDate` (L12), `createCalendarDateCodec` (L95) |
| `packages/@core/base/shared/src/utils/calendar-date-codec.ts` | types | `CalendarDateCodecOptions` (L14) |
| `packages/@core/base/shared/src/utils/cn.ts` | exports | `cn` (L10) |
| `packages/@core/base/shared/src/utils/diff.ts` | exports | `arraysEqual` (L57) |
| `packages/@core/base/shared/src/utils/dom.ts` | exports | `getScrollbarWidth` (L68), `triggerWindowResize` (L120) |
| `packages/@core/base/shared/src/utils/download.ts` | exports | `downloadFileFromUrl` (L15), `downloadFileFromBase64` (L46), `downloadFileFromImageUrl` (L58), `downloadFileFromBlob` (L69), `downloadFileFromBlobPart` (L84), `urlToBase64` (L103), `triggerDownload` (L130) |
| `packages/@core/base/shared/src/utils/inference.ts` | exports | `getFirstNonNullOrUndefined` (L101), `isFunctionType` (L102), `isHttpUrl` (L103), `isMacOs` (L104), `isUndefined` (L105), `isWindow` (L106), `isWindowsOs` (L107) |
| `packages/@core/base/shared/src/utils/merge.ts` | exports | `createMerge` (L3), `defu` (L3), `mergeWithArrayOverride` (L5) |
| `packages/@core/base/shared/src/utils/nprogress.ts` | exports | `startProgress` (L42), `stopProgress` (L42) |
| `packages/@core/base/shared/src/utils/time-codec.ts` | exports | `createTimeCodec` (L55) |
| `packages/@core/base/shared/src/utils/to.ts` | exports | `to` (L6) |
| `packages/@core/base/shared/src/utils/tree.ts` | exports | `sortTree` (L134) |
| `packages/@core/base/shared/src/utils/window.ts` | exports | `openRouteInNewWindow` (L37) |
| `packages/@core/base/shared/src/utils/index.ts` | exports | `get` (L22), `set` (L22) |
| `packages/api-contract/src/menu/menu.contract.ts` | exports | `menuRecordSchema` (L13) |
| `packages/api-contract/src/shared/pagination.ts` | exports | `PAGE_SIZE_MAX` (L3), `DEFAULT_PAGE_SIZE` (L4) |
| `packages/api-contract/src/todo/todo.schema.ts` | exports | `TODO_TITLE_MAX` (L4) |
| `internal/node-utils/src/constants.ts` | exports | `UNICODE` (L6) |
| `internal/node-utils/src/fs.ts` | exports | `outputJSON` (L4), `ensureFile` (L20), `readJSON` (L31) |
| `internal/node-utils/src/git.ts` | exports | `getStagedFiles` (L38) |
| `internal/node-utils/src/monorepo.ts` | exports | `findMonorepoRoot` (L56), `getPackage` (L56), `getPackages` (L56), `getPackagesSync` (L56) |
| `internal/node-utils/src/spinner.ts` | exports | `spinner` (L10) |
| `internal/node-utils/src/index.ts` | exports | `getStagedFiles` (L5), `generatorContentHash` (L6), `toPosixPath` (L8), `colors` (L11), `consola` (L12), `fs` (L15), `readPackageJSON` (L17), `rimraf` (L18) |
| `internal/node-utils/src/index.ts` | types | `Package` (L10), `PackageJson` (L17) |
| `packages/designs/src/constants.ts` | exports | `POHON_BRANDS` (L1) |
| `packages/db-pg/src/schema/auth.schema.ts` | exports | `accountRelations` (L247), `invitationRelations` (L249), `memberRelations` (L251), `organizationRelations` (L253), `sessionRelations` (L255), `teamMemberRelations` (L257), `teamRelations` (L259), `userRelations` (L261) |
| `packages/@core/ui-kit/popup-ui/src/alert/alert.ts` | exports | `injectAlertContext` (L88), `useAlertContext` (L92) |
| `packages/@core/ui-kit/popup-ui/src/alert/alert.ts` | types | `IconType` (L6) |
| `packages/@core/ui-kit/form-ui/src/form.field-name.ts` | exports | `deleteValueByFieldName` (L3), `getValueByFieldName` (L33), `resolveValueFormatFieldName` (L76), `setValueByFieldName` (L95) |
| `packages/@core/ui-kit/taman-ui/src/components/descriptions/index.ts` | exports | `TamanDescriptionItem` (L1), `TamanDescription` (L4) |
| `packages/@core/ui-kit/taman-ui/src/components/input/index.ts` | exports | `PASSWORD_STRENGTH_CHECKS` (L3), `PASSWORD_STRENGTH_MAX` (L4), `passwordStrengthScore` (L5) |
| `packages/@core/ui-kit/taman-ui/src/ui/alert-dialog/index.ts` | exports | `AlertDialogFooter` (L5), `AlertDialogHeader` (L6), `AlertDialogTrigger` (L9) |
| `packages/@core/ui-kit/taman-ui/src/ui/dialog/index.ts` | exports | `DialogOverlay` (L6), `DialogTrigger` (L9) |
| `packages/@core/ui-kit/taman-ui/src/ui/form/index.ts` | exports | `FORM_FIELD_INJECTION_KEY` (L8), `FORM_ITEM_INJECTION_KEY` (L9) |
| `packages/@core/ui-kit/taman-ui/src/ui/label/index.ts` | exports | `Label` (L1) |
| `packages/@core/ui-kit/taman-ui/src/ui/scroll-area/index.ts` | exports | `AScrollArea` (L1), `AScrollBar` (L2) |
| `packages/utils/src/helpers/get-popup-container.ts` | exports | `getPopupContainer` (L6) |
| `packages/@core/composables/src/use-simple-locale/messages.ts` | exports | `messages` (L3) |
| `packages/@core/ui-kit/form-ui/src/form-render/index.ts` | exports | `FormRenderFormField` (L1), `FormRenderFormLabel` (L2) |
| `packages/@core/ui-kit/taman-ui/src/components/input/password-strength.ts` | exports | `PASSWORD_STRENGTH_CHECKS` (L5), `PASSWORD_STRENGTH_MAX` (L13), `passwordStrengthScore` (L15) |
| `packages/shell/layouts/src/iframe/index.ts` | exports | `LayoutIFrameView` (L2) |
| `packages/@core/ui-kit/taman-ui/src/components/descriptions/use-taman-description.ts` | exports | `DEFAULT_COLUMN_MAP` (L8), `matchScreen` (L42), `useScreens` (L60), `resolveColumn` (L76), `normalizeItems` (L90), `calcRows` (L113), `TAMAN_DESCRIPTIONS_ITEM_NAME` (L166), `parseItemsFromSlot` (L192) |
| `packages/@core/ui-kit/taman-ui/src/ui/dialog/use-dialog-state-events.ts` | exports | `useDialogStateEvents` (L18) |
| `packages/@core/ui-kit/taman-ui/src/ui/form/use-form-field.ts` | exports | `useFormField` (L8) |
| `packages/@core/ui-kit/taman-ui/src/ui/sheet/sheet.variants.ts` | exports | `sheetVariants` (L8) |
| `packages/@core/ui-kit/taman-ui/src/ui/sheet/sheet.variants.ts` | types | `SheetVariants` (L22) |
| `packages/shell/layouts/src/widgets/preferences/blocks/layout/icons/index.ts` | exports | `LayoutContentWide` (L12) |
| `packages/shell/app-ui/src/components/fetch-component/app-fetch-component.types.ts` | types | `ApiComponentLabelFn` (L12) |
| `packages/@core/ui-kit/popup-ui/src/drawer/drawer.types.ts` | types | `CloseIconPlacement` (L8) |
| `packages/@core/ui-kit/form-ui/src/form.types.ts` | types | `BuiltInFormComponentType` (L39), `FormItemClassType` (L53), `FormValidationTrigger` (L72), `FormComponentField` (L100), `MaybeComponentPropKey` (L112), `FormMeta` (L121), `TamanFormActionSlotProps` (L217), `TamanFormDefaultSlotProps` (L227), `TamanFormResolvedComponentProps` (L265), `FormItemDependenciesResolve` (L398), `TamanFormFieldArrayProps` (L662), `FormHandleSubmitFn` (L692), `FormHandleResetFn` (L700) |
| `packages/@core/ui-kit/taman-ui/src/components/button/taman-button-check-group.types.ts` | types | `TamanButtonCheckGroupOption` (L11) |
| `packages/@core/ui-kit/taman-ui/src/components/input-date/format-calendar-input-value.ts` | types | `CalendarDateRange` (L5) |
| `packages/@core/preferences/src/types.ts` | types | `AnyCustomPreferencesField` (L434), `AppPreferences` (L435), `BaseCustomPreferencesField` (L436), `BreadcrumbPreferences` (L437), `CustomPreferencesInputField` (L439), `CustomPreferencesNumberField` (L440), `CustomPreferencesOption` (L441), `CustomPreferencesSelectField` (L443), `CustomPreferencesSwitchField` (L444), `CustomPreferencesValue` (L445), `FooterPreferences` (L446), `HeaderPreferences` (L447), `LogoPreferences` (L449), `NavigationPreferences` (L450), `PreferencesKeys` (L453), `ShortcutKeyPreferences` (L454), `SidebarPreferences` (L455), `SupportedLanguagesType` (L456), `TabbarPreferences` (L457), `ThemeBrandColors` (L458), `ThemePreferences` (L459), `TransitionPreferences` (L460), `WidgetPreferences` (L461) |
| `packages/@core/preferences/src/constants.ts` | types | `BuiltinThemePreset` (L85) |
| `packages/types/global.d.ts` | types | `TamanAdminDevConfigRaw` (L9), `ApplicationConfig` (L13) |
| `packages/@core/base/typings/src/basic.d.ts` | types | `ClassType` (L40), `SelectOption` (L40) |
| `packages/@core/base/typings/src/helper.d.ts` | types | `AnyFunction` (L131), `AnyNormalFunction` (L132), `DeepReadonly` (L134), `IntervalHandle` (L136), `MaybeReadonlyRef` (L139), `Merge` (L140), `MergeAll` (L141), `NonNullable` (L142), `Nullable` (L143), `ReadonlyRecordable` (L144), `TimeoutHandle` (L147) |
| `internal/vite-config/src/typing.ts` | types | `HtmlPluginOptions` (L314), `IImportMap` (L315) |
| `packages/constants/src/types.ts` | types | `NgiburEnv` (L1) |
| `packages/@core/base/shared/src/cache/local-storage-driver.ts` | types | `LocalStorageDriverOptions` (L70) |
| `packages/effects/request/src/client/index.ts` | types | `ApiEnvelope` (L4), `CreateFetchClientOptions` (L5), `FetchClient` (L6) |
| `packages/db-pg/src/types.ts` | types | `Serialized` (L14), `DbUser` (L22) |
| `packages/shell/app-ui/src/components/auth/index.ts` | types | `StrongPasswordMessages` (L4) |
| `packages/@core/ui-kit/taman-ui/src/components/button/index.ts` | types | `TamanButtonCheckGroupOption` (L3) |
| `packages/@core/ui-kit/taman-ui/src/components/loading/index.ts` | types | `TamanLoadingIcon` (L2), `TamanLoadingIconProps` (L2) |
| `packages/@core/ui-kit/taman-ui/src/components/descriptions/taman-description.types.ts` | types | `TamanDescriptionsLayout` (L14), `TamanDescriptionsSize` (L15), `TamanDescriptionsItemSpan` (L23), `TamanDescriptionsRenderNode` (L29), `TamanDescriptionsProps` (L46), `TamanDescriptionsItemProps` (L70) |
| `packages/@core/ui-kit/taman-ui/src/components/loading/types.ts` | types | `TamanLoadingIconProps` (L5), `TamanLoadingIcon` (L13) |

## Raw dependency candidates

14 dependency and 7 devDependency entries outside apps. These are advisory: tooling/configuration dependencies and type-only packages can be required without direct runtime imports. Do not remove an entire package because one consumer no longer needs it.

| Manifest | Kind | Candidates |
| --- | --- | --- |
| `packages/shell/layouts/package.json` | dependencies | `@taman-core/composables`, `@types/sortablejs`, `sortablejs` |
| `packages/@core/ui-kit/form-ui/package.json` | dependencies | `@formkit/auto-animate` |
| `packages/preferences/package.json` | dependencies | `@taman-core/typings` |
| `packages/@core/ui-kit/taman-ui/package.json` | dependencies | `@taman-core/composables` |
| `packages/@core/ui-kit/pohon-ui-theme/package.json` | dependencies | `@taman-core/shared` |
| `internal/lint-configs/commitlint-config/package.json` | dependencies | `@commitlint/cli`, `@commitlint/config-conventional`, `commitlint-plugin-function-rules`, `czg` |
| `packages/db-pg/package.json` | dependencies | `drizzle-zod`, `uuid`, `zod` |
| `package.json` | devDependencies | `@taman/commitlint-config`, `playwright`, `rimraf` |
| `packages/@core/ui-kit/popup-ui/package.json` | devDependencies | `@vue/test-utils` |
| `packages/@core/ui-kit/menu-ui/package.json` | devDependencies | `unplugin-vue` |
| `packages/constants/package.json` | devDependencies | `vitest` |
| `packages/designs/package.json` | devDependencies | `@unocss/preset-wind4` |

## Other compiler diagnostics outside apps

These were found while scanning; no fixes were made. Diagnostic first lines are retained here; repeated transitive diagnostics are deduplicated.

```text
packages/@core/ui-kit/taman-ui/src/components/button/taman-button-check-group.vue(123,23): error TS2722: Cannot invoke an object which is possibly 'undefined'.
packages/@core/ui-kit/taman-ui/src/components/button/taman-button-check-group.vue(133,23): error TS2722: Cannot invoke an object which is possibly 'undefined'.
packages/@core/preferences/__tests__/preferences.test.ts(294,7): error TS2322: Type '{ readonly fields: readonly [{ readonly component: "switch"; readonly defaultValue: true; readonly key: "enableWorkbench"; readonly label: "启用工作台"; }, { readonly component: "select"; readonly defaultValue: "single"; readonly key: "tenantMode"; readonly label: "租户模式"; readonly options: readonly [...]; }]; readonly ta...' is not assignable to type 'PreferencesExtension<CustomPreferencesRecord>'.
packages/@core/preferences/__tests__/preferences.test.ts(325,7): error TS2322: Type '{ readonly fields: readonly [{ readonly component: "number"; readonly componentProps: { readonly max: 10; readonly min: 2; readonly step: 2; }; readonly defaultValue: 4; readonly key: "pageSize"; readonly label: "分页大小"; }]; readonly tabLabel: "扩展"; readonly title: "业务偏好"; }' is not assignable to type 'PreferencesExtension<CustomPreferencesRecord>'.
packages/@core/base/shared/src/utils/__tests__/letter.test.ts(6,3): error TS2459: Module '"../letter"' declares 'toCamelCase' locally, but it is not exported.
packages/@core/base/shared/src/utils/__tests__/resources.test.ts(63,20): error TS2339: Property 'dispatchEvent' does not exist on type 'never'.
packages/shell/layouts/src/widgets/preferences/blocks/layout/sidebar.vue(26,66): error TS2769: No overload matches this call.
packages/shell/layouts/src/widgets/preferences/blocks/layout/sidebar.vue(33,27): error TS2339: Property 'includes' does not exist on type 'T'.
packages/shell/layouts/src/widgets/preferences/blocks/layout/sidebar.vue(35,26): error TS2339: Property 'push' does not exist on type 'T'.
packages/shell/layouts/src/widgets/preferences/blocks/layout/sidebar.vue(37,57): error TS2339: Property 'includes' does not exist on type 'T'.
packages/shell/layouts/src/widgets/preferences/blocks/layout/sidebar.vue(38,26): error TS2339: Property 'push' does not exist on type 'T'.
packages/shell/layouts/src/widgets/preferences/blocks/layout/sidebar.vue(43,57): error TS2339: Property 'includes' does not exist on type 'T'.
packages/shell/layouts/src/widgets/preferences/blocks/layout/sidebar.vue(44,53): error TS2339: Property 'includes' does not exist on type 'T'.
packages/shell/layouts/src/widgets/preferences/blocks/layout/sidebar.vue(90,5): error TS2322: Type 'T' is not assignable to type 'string[] | undefined'.
packages/shell/layouts/src/widgets/preferences/blocks/theme/theme.vue(33,11): error TS2304: Cannot find name 'Sun'.
packages/shell/layouts/src/widgets/preferences/blocks/theme/theme.vue(37,11): error TS2304: Cannot find name 'MoonStar'.
packages/shell/layouts/src/widgets/preferences/blocks/theme/theme.vue(41,11): error TS2304: Cannot find name 'SunMoon'.
packages/utils/src/helpers/__tests__/generate-routes-frontend.test.ts(41,25): error TS2345: Argument of type 'RouteRecordRaw | undefined' is not assignable to parameter of type 'RouteRecordRaw'.
packages/utils/src/helpers/__tests__/generate-routes-frontend.test.ts(45,25): error TS2345: Argument of type 'RouteRecordRaw | undefined' is not assignable to parameter of type 'RouteRecordRaw'.
packages/utils/src/helpers/__tests__/generate-routes-frontend.test.ts(49,25): error TS2345: Argument of type 'RouteRecordRaw | undefined' is not assignable to parameter of type 'RouteRecordRaw'.
packages/db-pg/gen-auth-schema.ts(11,31): error TS2554: Expected 0 arguments, but got 1.
packages/db-pg/src/codes.test.ts(3,99): error TS5097: An import path can only end with a '.ts' extension when 'allowImportingTsExtensions' is enabled.
packages/@core/ui-kit/form-ui/__tests__/form-component-performance.benchmark.ts(4,20): error TS2724: '"vitest"' has no exported member named 'bench'. Did you mean 'Bench'?
packages/@core/ui-kit/form-ui/__tests__/form-performance.benchmark.ts(2,20): error TS2724: '"vitest"' has no exported member named 'bench'. Did you mean 'Bench'?
packages/@core/ui-kit/form-ui/__tests__/taman-file-upload.test.ts(57,13): error TS2769: No overload matches this call.
packages/@core/ui-kit/layout-ui/src/__tests__/layout-sidebar-mobile-hover.test.ts(57,9): error TS2769: No overload matches this call.
```

## Reproduction

Compiler: run the locally installed vue-tsc directly against each tsconfig.json under packages, internal and scripts, with --noEmit --incremental false --pretty false. No aggregate checks or lint commands were run.

Knip: node scripts/tooling/node_modules/knip/bin/knip.js --config /private/tmp/taman-knip-source-config.json --include files,exports,types,dependencies,unresolved --include-entry-exports --reporter json --no-config-hints

Temporary scan configuration: all app src TS/TSX/Vue files and server TS files are conservative entry points, so even dormant app consumers protect shared exports; scripts/tooling/src files are entry points; Drizzle discovery is disabled to avoid loading database environment configuration. Workspace source paths are mapped from manifests. Tests remain included. Graph output, docs, and dist are ignored. No --fix was used.

The temporary configuration and raw JSON are in /private/tmp for this session; this inventory records the findings durably. An exit code of 1 from Knip indicates findings. The compiler results were 11 passing and 18 failing configurations out of 29.
