# Graph Report - packages/@core/ui-kit  (2026-06-02)

## Corpus Check
- 369 files · ~52,477 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 994 nodes · 1137 edges · 102 communities (87 shown, 15 thin omitted)
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
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 37|Community 37]]
- [[_COMMUNITY_Community 38|Community 38]]
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_Community 42|Community 42]]
- [[_COMMUNITY_Community 43|Community 43]]
- [[_COMMUNITY_Community 44|Community 44]]
- [[_COMMUNITY_Community 50|Community 50]]
- [[_COMMUNITY_Community 51|Community 51]]
- [[_COMMUNITY_Community 52|Community 52]]
- [[_COMMUNITY_Community 53|Community 53]]
- [[_COMMUNITY_Community 54|Community 54]]
- [[_COMMUNITY_Community 55|Community 55]]
- [[_COMMUNITY_Community 56|Community 56]]
- [[_COMMUNITY_Community 57|Community 57]]
- [[_COMMUNITY_Community 58|Community 58]]
- [[_COMMUNITY_Community 60|Community 60]]
- [[_COMMUNITY_Community 63|Community 63]]
- [[_COMMUNITY_Community 65|Community 65]]
- [[_COMMUNITY_Community 66|Community 66]]
- [[_COMMUNITY_Community 67|Community 67]]
- [[_COMMUNITY_Community 70|Community 70]]
- [[_COMMUNITY_Community 78|Community 78]]
- [[_COMMUNITY_Community 83|Community 83]]

## God Nodes (most connected - your core abstractions)
1. `FormApi` - 33 edges
2. `DrawerApi` - 18 edges
3. `ModalApi` - 18 edges
4. `VbenFormProps` - 8 edges
5. `resolveFieldNamePath()` - 7 edges
6. `exports` - 6 edges
7. `exports` - 6 edges
8. `exports` - 6 edges
9. `exports` - 6 edges
10. `exports` - 6 edges

## Surprising Connections (you probably didn't know these)
- `TabsProps` --references--> `IContextMenuItem`  [EXTRACTED]
  tabs-ui/src/types.ts → shadcn-ui/src/components/context-menu/interface.ts
- `ActionItem` --references--> `ButtonVariants`  [EXTRACTED]
  shadcn-ui/src/components/table-action/types.ts → shadcn-ui/src/ui/button/button.ts
- `FormApi` --references--> `VbenFormProps`  [EXTRACTED]
  form-ui/src/form-api.ts → form-ui/src/types.ts
- `resolveValueByFieldName()` --calls--> `resolveFieldNamePath()`  [EXTRACTED]
  form-ui/src/form-render/dependencies.ts → form-ui/src/field-name.ts
- `useSubMenuContext()` --calls--> `findComponentUpward()`  [EXTRACTED]
  menu-ui/src/hooks/use-menu-context.ts → menu-ui/src/utils/index.ts

## Communities (102 total, 15 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.08
Nodes (19): DrawerApi, CloseIconPlacement, DrawerApiOptions, DrawerPlacement, DrawerProps, DrawerState, ExtendedDrawerApi, DEFAULT_DRAWER_PROPS (+11 more)

### Community 1 - "Community 1"
Cohesion: 0.08
Nodes (17): ModalApi, ExtendedModalApi, ModalApiOptions, ModalProps, ModalState, DEFAULT_MODAL_PROPS, { globalEscapeShortcutKey }, setDefaultModalProps() (+9 more)

### Community 2 - "Community 2"
Cohesion: 0.05
Nodes (38): bugs, default, dependencies, @vben-core/composables, @vben-core/icons, @vben-core/shadcn-ui, @vben-core/shared, @vben-core/typings (+30 more)

### Community 3 - "Community 3"
Cohesion: 0.06
Nodes (37): bugs, default, dependencies, qs, @vben-core/composables, @vben-core/design, @vben-core/icons, @vben-core/shadcn-ui (+29 more)

### Community 4 - "Community 4"
Cohesion: 0.09
Nodes (18): AlertContext, AlertProps, BeforeCloseScope, IconType, [injectAlertContext, provideAlertContext], PromptProps, useAlertContext(), alerts (+10 more)

### Community 5 - "Community 5"
Cohesion: 0.06
Nodes (35): bugs, default, dependencies, @vben-core/composables, @vben-core/icons, @vben-core/preferences, @vben-core/shadcn-ui, @vben-core/shared (+27 more)

### Community 6 - "Community 6"
Cohesion: 0.06
Nodes (34): bugs, default, dependencies, @vben-core/composables, @vben-core/icons, @vben-core/shadcn-ui, @vben-core/shared, @vben-core/typings (+26 more)

### Community 7 - "Community 7"
Cohesion: 0.06
Nodes (34): bugs, default, dependencies, @vben-core/composables, @vben-core/design, @vben-core/icons, @vben-core/shadcn-ui, @vben-core/typings (+26 more)

### Community 8 - "Community 8"
Cohesion: 0.06
Nodes (15): ButtonVariants, CustomRenderType, ValueType, VbenButtonGroupProps, VbenButtonProps, alignClass, dropdownOpen, renderedActions (+7 more)

### Community 9 - "Community 9"
Cohesion: 0.06
Nodes (32): bugs, default, dependencies, class-variance-authority, @lucide/vue, reka-ui, @vben-core/composables, @vben-core/design (+24 more)

### Community 10 - "Community 10"
Cohesion: 0.07
Nodes (27): [injectRenderFormProps, provideFormRenderProps], ActionButtonOptions, ArrayToStringFields, Breakpoints, ComponentProps, CustomParamsRenderType, CustomRenderType, FieldMappingTime (+19 more)

### Community 11 - "Community 11"
Cohesion: 0.08
Nodes (22): hasHeader, mergedItems, rows, tableClass, DescriptionsBreakpoint, DescriptionsColumn, DescriptionsItemProps, DescriptionsItemSpan (+14 more)

### Community 12 - "Community 12"
Cohesion: 0.07
Nodes (15): collapseShowTitle, isHttp, isTopLevelMenuItem, menuIcon, MenuItemRegistered, showTooltip, active, contentProps (+7 more)

### Community 13 - "Community 13"
Cohesion: 0.12
Nodes (14): menuContextKey, useSubMenuContext(), useMenu(), MenuItemClicked, MenuItemProps, MenuItemRegistered, MenuProps, MenuProvider (+6 more)

### Community 14 - "Community 14"
Cohesion: 0.14
Nodes (12): calcSliceIndex(), close(), closeMenu(), debounce(), enableScroll, getActivePaths(), getSlot, handleResize() (+4 more)

### Community 20 - "Community 20"
Cohesion: 0.16
Nodes (9): children, currentTreeData, hasSelectedChild, id, index, item, P, TreeProps (+1 more)

### Community 21 - "Community 21"
Cohesion: 0.21
Nodes (9): COMPONENT_BIND_EVENT_MAP, COMPONENT_MAP, DEFAULT_FORM_COMMON_CONFIG, setupVbenForm(), BaseFormComponentType, ExtendedFormApi, FormCommonConfig, FormLayout (+1 more)

### Community 22 - "Community 22"
Cohesion: 0.15
Nodes (8): bodyStyle, collapsibleRows, finalVisibleCount, open, visibleRows, CollapsibleParamOption, CollapsibleParamSchema, CollapsibleParamsProps

### Community 23 - "Community 23"
Cohesion: 0.20
Nodes (6): formattedValue, getDefaultState(), value, values, FormSchema, VbenFormProps

### Community 24 - "Community 24"
Cohesion: 0.17
Nodes (11): aliases, components, utils, $schema, style, tailwind, baseColor, config (+3 more)

### Community 28 - "Community 28"
Cohesion: 0.22
Nodes (5): resolveValueByFieldName(), resolveFieldNamePath(), FormItemDependencies, FormSchemaRuleType, MaybeComponentProps

### Community 29 - "Community 29"
Cohesion: 0.18
Nodes (10): consoleErrorSpy, formActions, handleSubmitMock, newSchema, originalValuesSnapshot, resetFormMock, setFieldValueMock, staleMap (+2 more)

### Community 30 - "Community 30"
Cohesion: 0.18
Nodes (10): collapse, getCollapseShowTitle, hiddenTitle, iconArrowStyle, iconComp, isFirstLevel, mode, nsMenu (+2 more)

### Community 33 - "Community 33"
Cohesion: 0.22
Nodes (5): baseRules, bindEvents, binds, formCollapsed, formComponentProps

### Community 37 - "Community 37"
Cohesion: 0.25
Nodes (4): FormActions, ExtendFormProps, [injectComponentRefMap, provideComponentRefMap], [injectFormProps, provideFormProps]

### Community 38 - "Community 38"
Cohesion: 0.25
Nodes (7): compilerOptions, paths, exclude, extends, include, @vben-core/shadcn-ui/*, $schema

### Community 39 - "Community 39"
Cohesion: 0.29
Nodes (4): computedShadowClasses, showShadowBottom, showShadowLeft, showShadowRight

### Community 44 - "Community 44"
Cohesion: 0.40
Nodes (4): onClick(), onConfirm(), size, variant

### Community 50 - "Community 50"
Cohesion: 0.40
Nodes (4): [], fields, newFieldValue, oldFieldValue

### Community 51 - "Community 51"
Cohesion: 0.40
Nodes (4): exclude, extends, include, $schema

### Community 52 - "Community 52"
Cohesion: 0.40
Nodes (3): DragCallback, DragElements, DragOptions

### Community 53 - "Community 53"
Cohesion: 0.40
Nodes (4): exclude, extends, include, $schema

### Community 54 - "Community 54"
Cohesion: 0.40
Nodes (4): exclude, extends, include, $schema

### Community 55 - "Community 55"
Cohesion: 0.40
Nodes (4): exclude, extends, include, $schema

### Community 58 - "Community 58"
Cohesion: 0.40
Nodes (4): exclude, extends, include, $schema

## Knowledge Gaps
- **379 isolated node(s):** `name`, `version`, `homepage`, `bugs`, `type` (+374 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **15 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `FormApi` connect `Community 15` to `Community 37`, `Community 10`, `Community 21`, `Community 23`, `Community 28`, `Community 29`?**
  _High betweenness centrality (0.034) - this node is a cross-community bridge._
- **What connects `name`, `version`, `homepage` to the rest of the system?**
  _379 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.07549361207897794 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.07804878048780488 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.05398110661268556 - nodes in this community are weakly interconnected._
- **Should `Community 3` be split into smaller, more focused modules?**
  _Cohesion score 0.05547652916073969 - nodes in this community are weakly interconnected._
- **Should `Community 4` be split into smaller, more focused modules?**
  _Cohesion score 0.08888888888888889 - nodes in this community are weakly interconnected._