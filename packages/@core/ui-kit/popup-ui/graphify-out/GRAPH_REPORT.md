# Graph Report - popup-ui  (2026-09-21)

## Corpus Check
- 31 files · ~9,695 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 389 nodes · 573 edges · 17 communities
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 7 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `f1237bb0`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- ModalApi
- package.json
- alert/index.ts
- DrawerApi
- use-taman-drawer.ts
- use-taman-dialog.ts
- alert.vue
- dialog.vue
- tsconfig.json
- package.json
- dependencies
- drawer.vue
- tsconfig.json

## God Nodes (most connected - your core abstractions)
1. `DialogApi` - 19 edges
2. `DrawerApi` - 19 edges
3. `DrawerApi` - 18 edges
4. `ModalApi` - 18 edges
5. `useTamanDialog()` - 13 edges
6. `useTamanDrawer()` - 13 edges
7. `DialogState` - 7 edges
8. `ExtendedDialogApi` - 7 edges
9. `DialogApiOptions` - 7 edges
10. `DrawerState` - 7 edges

## Surprising Connections (you probably didn't know these)
- `mountDialog()` --calls--> `useTamanDialog()`  [EXTRACTED]
  src/dialog/__tests__/dialog.test.ts → src/dialog/use-taman-dialog.ts
- `mountRebindingHarness()` --calls--> `useTamanDialog()`  [EXTRACTED]
  src/dialog/__tests__/use-dialog.test.ts → src/dialog/use-taman-dialog.ts
- `mountPreopenedDrawer()` --calls--> `useTamanDrawer()`  [EXTRACTED]
  src/drawer/__tests__/drawer.test.ts → src/drawer/use-taman-drawer.ts
- `mountRebindingHarness()` --calls--> `useTamanDrawer()`  [EXTRACTED]
  src/drawer/__tests__/use-drawer.test.ts → src/drawer/use-taman-drawer.ts
- `DialogApi` --references--> `DialogApiOptions`  [EXTRACTED]
  src/dialog/dialog.api.ts → src/dialog/dialog.types.ts

## Import Cycles
- None detected.

## Communities (17 total, 0 thin omitted)

### Community 0 - "ModalApi"
Cohesion: 0.08
Nodes (17): ModalApi, ExtendedModalApi, ModalApiOptions, ModalProps, ModalState, DEFAULT_MODAL_PROPS, { globalEscapeShortcutKey }, setDefaultModalProps() (+9 more)

### Community 1 - "package.json"
Cohesion: 0.06
Nodes (35): bugs, default, dependencies, @vben-core/composables, @vben-core/icons, @vben-core/preferences, @vben-core/shadcn-ui, @vben-core/shared (+27 more)

### Community 2 - "alert/index.ts"
Cohesion: 0.22
Nodes (13): AlertContext, AlertProps, BeforeCloseScope, IconType, [injectAlertContext, provideAlertContext], PromptProps, useAlertContext(), alerts (+5 more)

### Community 3 - "DrawerApi"
Cohesion: 0.07
Nodes (19): DrawerApi, CloseIconPlacement, DrawerApiOptions, DrawerPlacement, DrawerProps, DrawerState, ExtendedDrawerApi, DEFAULT_DRAWER_PROPS (+11 more)

### Community 4 - "use-taman-drawer.ts"
Cohesion: 0.06
Nodes (26): DrawerApi, Props, CloseIconPlacement, DrawerApiOptions, DrawerComponentInstance, DrawerPlacement, DrawerProps, DrawerState (+18 more)

### Community 5 - "use-taman-dialog.ts"
Cohesion: 0.07
Nodes (24): DialogApi, Props, DialogApiOptions, DialogComponentInstance, DialogProps, DialogState, ExtendedDialogApi, InferDialogData (+16 more)

### Community 6 - "alert.vue"
Cohesion: 0.10
Nodes (28): AlertBeforeCloseScope, AlertContext, AlertPromptProps, AlertProps, alerts, clearAllAlerts(), { $t }, tamanAlert() (+20 more)

### Community 7 - "dialog.vue"
Cohesion: 0.07
Nodes (18): {
  appendToMain,
  bordered,
  cancelText,
  centered,
  class: dialogClass,
  closable,
  closeOnClickModal,
  closeOnPressEscape,
  confirmDisabled,
  confirmLoading,
  confirmText,
  contentClass,
  description,
  destroyOnClose,
  draggable,
  overflow,
  footer: showFooter,
  footerClass,
  fullscreen: shouldFullscreen,
  fullscreenButton,
  header,
  headerClass,
  loading: showLoading,
  modal,
  openAutoFocus,
  overlayBlur,
  showCancelButton,
  showConfirmButton,
  submitting,
  title,
  titleTooltip,
  animationType,
  zIndex,
}, contentRef, dialogRef, { dragging, transform }, firstOpened, getAppendTo, getForceMount, headerRef (+10 more)

### Community 8 - "tsconfig.json"
Cohesion: 0.40
Nodes (4): exclude, extends, include, $schema

### Community 11 - "package.json"
Cohesion: 0.10
Nodes (20): devDependencies, unplugin-vue, @vue/test-utils, exports, files, license, main, module (+12 more)

### Community 12 - "dependencies"
Cohesion: 0.11
Nodes (19): dependencies, pohon-ui, @taman-core/composables, @taman-core/icons, @taman-core/preferences, @taman-core/shared, @taman-core/taman-ui, @taman-core/typings (+11 more)

### Community 13 - "drawer.vue"
Cohesion: 0.12
Nodes (10): {
  appendToMain,
  cancelText,
  class: drawerClass,
  closable,
  closeIconPlacement,
  closeOnClickModal,
  closeOnPressEscape,
  confirmLoading,
  confirmText,
  contentClass,
  description,
  destroyOnClose,
  footer: showFooter,
  footerClass,
  header: showHeader,
  headerClass,
  loading: showLoading,
  modal,
  openAutoFocus,
  overlayBlur,
  placement,
  showCancelButton,
  showConfirmButton,
  submitting,
  title,
  titleTooltip,
  zIndex,
}, getAppendTo, getForceMount, hasOpened, id, isClosed, { isMobile }, state (+2 more)

### Community 14 - "tsconfig.json"
Cohesion: 0.25
Nodes (7): node_modules, src, @taman/tsconfig/web.json, exclude, extends, include, $schema

## Knowledge Gaps
- **143 isolated node(s):** `name`, `type`, `version`, `license`, `exports` (+138 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 215 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What connects `name`, `type`, `version` to the rest of the system?**
  _143 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `ModalApi` be split into smaller, more focused modules?**
  _Cohesion score 0.08076923076923077 - nodes in this community are weakly interconnected._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.05873015873015873 - nodes in this community are weakly interconnected._
- **Should `DrawerApi` be split into smaller, more focused modules?**
  _Cohesion score 0.07308970099667775 - nodes in this community are weakly interconnected._
- **Should `use-taman-drawer.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06265664160401002 - nodes in this community are weakly interconnected._
- **Should `use-taman-dialog.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06848357791754019 - nodes in this community are weakly interconnected._
- **Should `alert.vue` be split into smaller, more focused modules?**
  _Cohesion score 0.09682539682539683 - nodes in this community are weakly interconnected._