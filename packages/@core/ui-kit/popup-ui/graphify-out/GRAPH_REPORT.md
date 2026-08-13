# Graph Report - packages/@core/ui-kit/popup-ui  (2026-06-02)

## Corpus Check
- 21 files · ~7,183 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 145 nodes · 206 edges · 11 communities
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `5d654b8c`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]

## God Nodes (most connected - your core abstractions)
1. `DrawerApi` - 18 edges
2. `ModalApi` - 18 edges
3. `exports` - 6 edges
4. `DrawerState` - 5 edges
5. `DrawerApiOptions` - 5 edges
6. `ModalState` - 5 edges
7. `ModalApiOptions` - 5 edges
8. `repository` - 4 edges
9. `vbenConfirm()` - 4 edges
10. `scripts` - 3 edges

## Surprising Connections (you probably didn't know these)
- `DrawerApi` --references--> `DrawerApiOptions`  [EXTRACTED]
  src/drawer/drawer-api.ts → src/drawer/drawer.ts
- `DrawerApi` --references--> `DrawerState`  [EXTRACTED]
  src/drawer/drawer-api.ts → src/drawer/drawer.ts
- `ModalApi` --references--> `ModalApiOptions`  [EXTRACTED]
  src/modal/modal-api.ts → src/modal/modal.ts
- `ModalApi` --references--> `ModalState`  [EXTRACTED]
  src/modal/modal-api.ts → src/modal/modal.ts

## Communities (11 total, 0 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.13
Nodes (10): ModalApi, ExtendedModalApi, ModalApiOptions, ModalProps, ModalState, DEFAULT_MODAL_PROPS, { globalEscapeShortcutKey }, setDefaultModalProps() (+2 more)

### Community 1 - "Community 1"
Cohesion: 0.08
Nodes (26): bugs, default, devDependencies, unplugin-vue, development, exports, files, homepage (+18 more)

### Community 2 - "Community 2"
Cohesion: 0.22
Nodes (13): AlertContext, AlertProps, BeforeCloseScope, IconType, [injectAlertContext, provideAlertContext], PromptProps, useAlertContext(), alerts (+5 more)

### Community 3 - "Community 3"
Cohesion: 0.20
Nodes (3): DrawerApi, DrawerApiOptions, DrawerState

### Community 4 - "Community 4"
Cohesion: 0.19
Nodes (9): CloseIconPlacement, DrawerPlacement, DrawerProps, ExtendedDrawerApi, DEFAULT_DRAWER_PROPS, { globalEscapeShortcutKey }, setDefaultDrawerProps(), USER_DRAWER_INJECT_KEY (+1 more)

### Community 5 - "Community 5"
Cohesion: 0.17
Nodes (7): drawerApiWithHook, onBeforeClose, onCancel, onClosed, onOpenChange, onOpened, testData

### Community 6 - "Community 6"
Cohesion: 0.17
Nodes (7): modalApiWithHook, onBeforeClose, onCancel, onClosed, onOpenChange, onOpened, testData

### Community 7 - "Community 7"
Cohesion: 0.22
Nodes (9): dependencies, @vben-core/composables, @vben-core/icons, @vben-core/preferences, @vben-core/shadcn-ui, @vben-core/shared, @vben-core/typings, vue (+1 more)

### Community 8 - "Community 8"
Cohesion: 0.40
Nodes (4): exclude, extends, include, $schema

## Knowledge Gaps
- **57 isolated node(s):** `name`, `version`, `homepage`, `bugs`, `type` (+52 more)
  These have ≤1 connection - possible missing edges or undocumented components.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `ModalApi` connect `Community 0` to `Community 6`?**
  _High betweenness centrality (0.105) - this node is a cross-community bridge._
- **Why does `DrawerApi` connect `Community 3` to `Community 4`, `Community 5`?**
  _High betweenness centrality (0.105) - this node is a cross-community bridge._
- **Why does `dependencies` connect `Community 7` to `Community 1`?**
  _High betweenness centrality (0.024) - this node is a cross-community bridge._
- **What connects `name`, `version`, `homepage` to the rest of the system?**
  _57 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.12698412698412698 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.07977207977207977 - nodes in this community are weakly interconnected._