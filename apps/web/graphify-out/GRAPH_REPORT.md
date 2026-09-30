# Graph Report - better-auth-front  (2026-09-15)

## Corpus Check
- 231 files · ~49,115 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1135 nodes · 1581 edges · 130 communities (75 shown, 50 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 42 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `07c98859`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- menu/modules/form.vue
- form/basic.vue
- admin-menu-layouts.spec.ts
- component/index.ts
- drawer/index.vue
- collapsible.vue
- guard.ts
- workspace/index.vue
- scripts
- demos.ts
- paginated-queries.vue
- locales/index.ts
- include
- preferences-extension/index.vue
- dialog/index.vue
- form.ts
- profile/index.vue
- dept/modules/form.vue
- user/modules/form.vue
- core.ts
- viewed.vue
- tsconfig.node.json
- vxe-table.ts
- auth.session.ts
- project.json
- concurrency-caching.vue
- use-auth.query.ts
- components.d.ts
- useTamanForm
- tree.vue
- api/index.ts
- dept/list.vue
- user/data.ts
- cropper/index.vue
- merge.vue
- vxe-table/basic.vue
- dependencies
- layouts/index.ts
- request.ts
- system.ts
- access/index.vue
- button-group/index.vue
- slider-captcha.vue
- all-fields.vue
- errors.ts
- getExampleTableApi
- examples.ts
- button-control.vue
- badge/index.vue
- scroll-to-error-test.vue
- motion/index.vue
- edit-row.vue
- core.vue
- tabs/index.vue
- nested-demo.vue
- custom.vue
- dynamic.vue
- json-viewer/index.vue
- code-login.vue
- xlogin.vue
- icons/index.vue
- point-selection-captcha.vue
- count-to/index.vue
- dialog/dynamic-demo.vue
- query.vue
- Menu layout e2e (characterization)
- login.vue
- dialog/auto-height-demo.vue
- form-dialog-demo.vue
- loading/index.vue
- resize/basic.vue
- tiptap/index.vue
- vxe-table/form.vue
- renderTableDefault
- full-screen/index.vue
- tab-detail.vue
- watermark/index.vue
- basic-demo.vue
- dialog/in-content-demo.vue
- dialog/shared-data-demo.vue
- col-page.vue
- fixed.vue
- uno.config.ts
- lateral.vue
- clipboard/index.vue
- context-menu/index.vue
- dialog/base-demo.vue
- blur-demo.vue
- global.d.ts
- vite.config.ts
- ag-grid-vue3
- antdv-next
- dayjs
- @formkit/auto-animate
- json-bigint
- pinia
- pohon-ui
- @taman/access
- @taman/app-ui
- @taman/common-ui
- @taman/composables
- @taman/constants
- @taman-core/form-ui
- @taman-core/menu-ui
- @taman-core/pohon-ui-theme
- @taman/db-pg
- @taman/designs
- @taman/layouts
- @taman/locales
- @taman/rbac
- @taman/request
- @taman/stores
- @taman/types
- @taman/utils
- @tanstack/vue-query
- @vben/plugins
- @vben/request
- @vben/styles
- @vinicunca/perkakas
- vue
- vue-router
- @vueuse/core
- pohon-theme.d.ts
- locales/README.md
- _core/README.md

## God Nodes (most connected - your core abstractions)
1. `useTamanForm()` - 22 edges
2. `useVbenVxeGrid()` - 14 edges
3. `useSessionStore` - 14 edges
4. `requestClient` - 13 edges
5. `@playwright/test` - 11 edges
6. `scripts` - 9 edges
7. `withPreviewUpload()` - 9 edges
8. `getMenuList()` - 9 edges
9. `getExampleTableApi()` - 8 edges
10. `authLogin()` - 7 edges

## Surprising Connections (you probably didn't know these)
- `doReAuthenticate()` --calls--> `useSessionStore`  [EXTRACTED]
  src/api/request.ts → src/auth/session.store.ts
- `useFormSchema()` --indirect_call--> `getDeptList()`  [INFERRED]
  src/views/system/user/data.ts → src/api/system/dept.ts
- `unwrapAuthResult()` --calls--> `getErrors()`  [EXTRACTED]
  src/auth/auth.result.ts → src/api/errors.ts
- `useSessionStore` --calls--> `getErrors()`  [EXTRACTED]
  src/auth/session.store.ts → src/api/errors.ts
- `createRequestClient()` --calls--> `useSessionStore`  [EXTRACTED]
  src/api/request.ts → src/auth/session.store.ts

## Import Cycles
- None detected.

## Communities (130 total, 50 thin omitted)

### Community 0 - "menu/modules/form.vue"
Cohesion: 0.05
Nodes (56): OnActionClickFn, OnActionClickParams, createMenu(), deleteMenu(), getMenuList(), isMenuNameExists(), isMenuPathExists(), SystemMenu (+48 more)

### Community 1 - "form/basic.vue"
Cohesion: 0.06
Nodes (29): buildQueryKey(), QueryParams, useBackstageMutation(), UseBackstageMutationOptions, useBackstageQuery(), UseBackstageQueryOptions, getAllMenusApi(), downloadFile1() (+21 more)

### Community 2 - "admin-menu-layouts.spec.ts"
Cohesion: 0.07
Nodes (37): config, DOM, ESNext, node, ../../playwright.config.ts, @playwright/test, ./**/*.ts, authLogin() (+29 more)

### Community 3 - "component/index.ts"
Cohesion: 0.05
Nodes (40): AdapterUploadProps, AutoComplete, Button, Cascader, Checkbox, CheckboxGroup, createDefaultUploadSlots(), cropImage() (+32 more)

### Community 4 - "drawer/index.vue"
Cohesion: 0.06
Nodes (17): [Drawer, drawerApi], list, [Drawer, drawerApi], [Drawer, drawerApi], [Drawer, drawerApi], [Form, formApi], [Drawer, drawerApi], [Form] (+9 more)

### Community 5 - "collapsible.vue"
Cohesion: 0.07
Nodes (16): props, text, [BaseForm, baseFormApi], [GroupForm, groupFormApi], layout, layouts, paramsSchema, paramsValidator (+8 more)

### Community 6 - "guard.ts"
Cohesion: 0.11
Nodes (22): ensureSession(), AUTH_LAYOUT_ROUTE_NAMES, AuthAllowDecisionType, AuthDecision, AuthRedirectDecisionType, MatchedRouteRecord, resolveAuthDecision(), resolveAuthMetaFromMatched() (+14 more)

### Community 7 - "workspace/index.vue"
Cohesion: 0.07
Nodes (18): chartRef, { renderEcharts }, chartRef, chartRef, { renderEcharts }, { renderEcharts }, chartRef, { renderEcharts } (+10 more)

### Community 8 - "scripts"
Cohesion: 0.07
Nodes (26): add, devDependencies, add, @playwright/test, pnpm, @tanstack/vue-query-devtools, @types/json-bigint, unocss (+18 more)

### Community 9 - "demos.ts"
Cohesion: 0.10
Nodes (3): routes, router, { closeCurrentTab }

### Community 10 - "paginated-queries.vue"
Cohesion: 0.14
Nodes (8): showCaching, {
  data,
  error,
  fetchNextPage,
  hasNextPage,
  isError,
  isFetching,
  isFetchingNextPage,
  isPending,
}, { data, error, isError, isPending, isPlaceholderData }, fetcher(), page, count, { error, isFetching, refetch }, IProducts

### Community 11 - "locales/index.ts"
Cohesion: 0.13
Nodes (11): buttonProps, modelValue, props, loadDayjsLocale(), loadMessages(), loadThirdPartyMessage(), localesMap, modules (+3 more)

### Community 12 - "include"
Cohesion: 0.12
Nodes (16): auto-imports.d.ts, components.d.ts, pohon-theme.d.ts, src/**/*.ts, src/**/*.tsx, src/**/*.vue, @taman/tsconfig/web-app.json, compilerOptions (+8 more)

### Community 13 - "preferences-extension/index.vue"
Cohesion: 0.14
Nodes (12): initApplication(), overridesPreferences, PlaygroundPreferencesExtension, preferencesExtension, DemoTaskItem, demoTasks, formattedPlaygroundPreferences, HighlightTone (+4 more)

### Community 14 - "dialog/index.vue"
Cohesion: 0.12
Nodes (10): dialogAutoHeightApi, dialogBasicApi, dialogBlurApi, dialogDragApi, dialogDynamicApi, dialogFormApi, dialogInContentApi, dialogNestedApi (+2 more)

### Community 15 - "form.ts"
Cohesion: 0.21
Nodes (10): ComponentPropsMap, ComponentType, initComponentAdapter(), LegacyComponentType, withDefaultPlaceholder(), initTamanForm(), TamanFormProps, bootstrap() (+2 more)

### Community 16 - "profile/index.vue"
Cohesion: 0.12
Nodes (10): getUserInfoApi(), formSchema, MOCK_ROLES_OPTIONS, profileBaseSettingRef, tabs, tabsValue, userStore, formSchema (+2 more)

### Community 17 - "dept/modules/form.vue"
Cohesion: 0.19
Nodes (12): createDept(), getDeptList(), SystemDept, SystemDeptApi, updateDept(), useSchema(), [Grid, gridApi], emit (+4 more)

### Community 18 - "user/modules/form.vue"
Cohesion: 0.15
Nodes (11): createUser(), SystemUser, updateUser(), [Drawer, drawerApi], emits, [Form, formApi], formData, getDrawerTitle (+3 more)

### Community 19 - "core.ts"
Cohesion: 0.13
Nodes (8): appName, AuthPageLayout(), AuthPageLayout(), coreRoutes, fallbackNotFoundRoute, formSchema, loading, formSchema

### Community 20 - "viewed.vue"
Cohesion: 0.15
Nodes (10): editRow, [Grid, gridApi], gridOptions, isClassName, isStyle, [Modal, modalApi], onActionClick(), onEdit() (+2 more)

### Community 21 - "tsconfig.node.json"
Cohesion: 0.14
Nodes (13): uno.config.ts, vite.config.ts, compilerOptions, composite, noEmit, paths, tsBuildInfoFile, extends (+5 more)

### Community 22 - "vxe-table.ts"
Cohesion: 0.16
Nodes (10): ComponentPropsMap, ComponentType, useVbenVxeGrid(), VbenTableAction, [Grid], gridOptions, RowType, [Grid, gridApi] (+2 more)

### Community 23 - "auth.session.ts"
Cohesion: 0.25
Nodes (10): { apiUrl }, AppSession, AppSessionUser, authClient, AUTH_QUERY_KEY, clearAuthCache(), refreshSession(), SESSION_QUERY_KEY (+2 more)

### Community 24 - "project.json"
Cohesion: 0.17
Nodes (11): cache, command, options, name, cwd, projectType, $schema, sourceRoot (+3 more)

### Community 25 - "concurrency-caching.vue"
Cohesion: 0.17
Nodes (7): TamanFormSchema, { dataUpdatedAt, promise: fetchDataFn }, [Form], queryKey, schema, [BaseForm, formApi], isReverseActionButtons

### Community 26 - "use-auth.query.ts"
Cohesion: 0.26
Nodes (7): AuthClientResult, AuthError, unwrapAuthResult(), authQueryKeys, useListUsersQuery(), columnDefs, { data: dataUsers }

### Community 27 - "components.d.ts"
Cohesion: 0.18
Nodes (10): GlobalComponents, vue, ./../../node_modules/.pnpm/pohon-ui@2.0.0-rc7.3_c08bbda8172004bd52f76e9b55f9c5df/node_modules/pohon-ui/dist/runtime/components/Slider.vue, ./../../node_modules/.pnpm/pohon-ui@2.0.0-rc7.6_94729d8e300bd9608d7a36eb938da2cc/node_modules/pohon-ui/dist/runtime/components/Card.vue, ./../../node_modules/.pnpm/pohon-ui@2.0.0-rc7.7_94729d8e300bd9608d7a36eb938da2cc/node_modules/pohon-ui/dist/runtime/components/CommandPalette.vue, ./../../node_modules/.pnpm/pohon-ui@2.0.0-rc7.7_bcb3767dc29a07de0b758b3ed4f69159/node_modules/pohon-ui/dist/runtime/components/AuthForm.vue, ./../../node_modules/.pnpm/pohon-ui@2.0.0-rc7.7_bcb3767dc29a07de0b758b3ed4f69159/node_modules/pohon-ui/dist/runtime/components/Avatar.vue, ./../../node_modules/.pnpm/pohon-ui@2.0.0-rc7.7_bcb3767dc29a07de0b758b3ed4f69159/node_modules/pohon-ui/dist/runtime/components/Breadcrumb.vue (+2 more)

### Community 28 - "useTamanForm"
Cohesion: 0.18
Nodes (5): useTamanForm(), [CustomLayoutForm], [Form, formApi], [Form], tippyProps

### Community 29 - "tree.vue"
Cohesion: 0.20
Nodes (7): MOCK_TABLE_DATA, MOCK_TREE_TABLE_DATA, roles, TableRowData, [Grid, gridApi], gridOptions, RowType

### Community 30 - "api/index.ts"
Cohesion: 0.24
Nodes (5): getMockStatusApi(), handleClick(), [Grid, gridApi], gridOptions, RowType

### Community 31 - "dept/list.vue"
Cohesion: 0.31
Nodes (8): deleteDept(), useColumns(), [FormModal, formModalApi], onActionClick(), onAppend(), onDelete(), onEdit(), refreshGrid()

### Community 32 - "user/data.ts"
Cohesion: 0.27
Nodes (6): SystemUserApi, useDescriptionItems(), useFormSchema(), detailData, [Drawer, drawerApi], items

### Community 33 - "cropper/index.vue"
Cohesion: 0.20
Nodes (6): cropLoading, cropperImg, cropperRef, imgUrl, options, validAspectRatio

### Community 34 - "merge.vue"
Cohesion: 0.20
Nodes (5): currentTab, [FirstForm, firstFormApi], needMerge, [SecondForm, secondFormApi], stepsItems

### Community 35 - "vxe-table/basic.vue"
Cohesion: 0.20
Nodes (6): [Grid, gridApi], gridEvents, gridOptions, RowType, showBorder, showStripe

### Community 36 - "dependencies"
Cohesion: 0.22
Nodes (9): ag-grid-community, better-auth, dependencies, ag-grid-community, better-auth, @taman/preferences, @vben/icons, @taman/preferences (+1 more)

### Community 37 - "layouts/index.ts"
Cohesion: 0.39
Nodes (5): CoreLayout(), IFrameView(), forbiddenComponent(), generateAccess(), TODO: Implement fetching menu from backend

### Community 38 - "request.ts"
Cohesion: 0.22
Nodes (5): { apiUrl }, baseRequestClient, createRequestClient(), doReAuthenticate(), PageFetchParams

### Community 39 - "system.ts"
Cohesion: 0.31
Nodes (4): routes, routes, routes, ROUTE_ORDER

### Community 40 - "access/index.vue"
Cohesion: 0.22
Nodes (5): { accessMode, toggleAccessMode }, accounts, router, sessionStore, userStore

### Community 41 - "button-group/index.vue"
Cohesion: 0.22
Nodes (5): checkValue, compProps, [Form], options, radioValue

### Community 42 - "slider-captcha.vue"
Cohesion: 0.22
Nodes (6): el1, el2, el3, el4, el5, el6

### Community 43 - "all-fields.vue"
Cohesion: 0.22
Nodes (6): AllFieldsDateRange, AllFieldsEncodedDateRange, AllFieldsFormValues, AllFieldsSubmitValues, [FormAllFields, formAllFieldsApi], toast

### Community 44 - "errors.ts"
Cohesion: 0.36
Nodes (6): FetchErrorLike, getErrors(), HTTP_STATUS_MESSAGE_KEYS, TODO: move these status numbers into the locale's JSON instead., notifyQueryError(), queryClient

### Community 45 - "getExampleTableApi"
Cohesion: 0.25
Nodes (6): DemoTableApi, getExampleTableApi(), PageFetchParams, [Grid], gridOptions, RowType

### Community 46 - "examples.ts"
Cohesion: 0.25
Nodes (3): routes, avatar, userStore

### Community 47 - "button-control.vue"
Cohesion: 0.25
Nodes (5): { accessMode, hasAccessByCodes }, accounts, router, sessionStore, userStore

### Community 48 - "badge/index.vue"
Cohesion: 0.25
Nodes (6): accessStore, badgeProps, colors, [Form], menu, route

### Community 50 - "motion/index.vue"
Cohesion: 0.25
Nodes (6): motionGroupProps, motionProps, presets, showCard1, showCard2, showCard3

### Community 51 - "edit-row.vue"
Cohesion: 0.25
Nodes (3): [Grid, gridApi], gridOptions, RowType

### Community 52 - "core.vue"
Cohesion: 0.29
Nodes (5): menus, sessionStore, { setMenuList }, { user }, CoreLayout()

### Community 53 - "tabs/index.vue"
Cohesion: 0.29
Nodes (3): {
  closeAllTabs,
  closeCurrentTab,
  closeLeftTabs,
  closeOtherTabs,
  closeRightTabs,
  closeTabByKey,
  refreshTab,
  resetTabTitle,
  setTabTitle,
}, newTabTitle, router

### Community 54 - "nested-demo.vue"
Cohesion: 0.29
Nodes (4): [DialogDrag, dialogDragApi], { toaster }, nestedDialogApi, [ParentDialog]

### Community 55 - "custom.vue"
Cohesion: 0.33
Nodes (4): [Form], emit, modelValue, onChange()

### Community 58 - "code-login.vue"
Cohesion: 0.47
Nodes (4): formSchema, loading, loginRef, sendCodeApi()

### Community 59 - "xlogin.vue"
Cohesion: 0.33
Nodes (4): fields, providers, schema, sessionStore

### Community 60 - "icons/index.vue"
Cohesion: 0.33
Nodes (5): iconValue1, iconValue2, iconValue3, iconValue4, inputComponent

### Community 63 - "dialog/dynamic-demo.vue"
Cohesion: 0.33
Nodes (3): [DialogDynamic, dialogDynamicApi], state, { toaster }

### Community 64 - "query.vue"
Cohesion: 0.33
Nodes (4): [InlineForm], [QueryForm], [QueryForm1], [QueryForm2]

### Community 65 - "Menu layout e2e (characterization)"
Cohesion: 0.33
Nodes (5): Helpers, Menu layout e2e (characterization), Prerequisites, Run, What is intentionally not tested

### Community 67 - "dialog/auto-height-demo.vue"
Cohesion: 0.40
Nodes (3): [DialogAutoHeight, dialogAutoHeightApi], list, { toaster }

### Community 68 - "form-dialog-demo.vue"
Cohesion: 0.40
Nodes (3): [FormDemo, formDemoApi], [Modal, modalApi], { toast }

### Community 69 - "loading/index.vue"
Cohesion: 0.40
Nodes (4): loading, loadingV, spinning, spinningV

### Community 70 - "resize/basic.vue"
Cohesion: 0.40
Nodes (3): colorMap, sizeList, TSize

### Community 71 - "tiptap/index.vue"
Cohesion: 0.40
Nodes (4): content, enableUpload, imageUpload, previewContent

### Community 72 - "vxe-table/form.vue"
Cohesion: 0.40
Nodes (4): formOptions, [Grid], gridOptions, RowType

### Community 73 - "renderTableDefault"
Cohesion: 0.67
Nodes (3): renderTableDefault(), renderBtn(), renderConfirm()

### Community 74 - "full-screen/index.vue"
Cohesion: 0.50
Nodes (3): domRef, { enter, exit, isFullscreen, toggle }, { isFullscreen: isDomFullscreen, toggle: toggleDom }

### Community 75 - "tab-detail.vue"
Cohesion: 0.50
Nodes (3): index, route, { setTabTitle }

### Community 76 - "watermark/index.vue"
Cohesion: 0.67
Nodes (3): createWaterMark(), { destroyWatermark, updateWatermark, watermark }, recreateWaterMark()

### Community 78 - "dialog/in-content-demo.vue"
Cohesion: 0.50
Nodes (3): [DialogInContent, dialogInContentApi], { toaster }, value

### Community 79 - "dialog/shared-data-demo.vue"
Cohesion: 0.50
Nodes (3): data, [DialogSharedData, dialogSharedDataApi], { toaster }

### Community 80 - "col-page.vue"
Cohesion: 0.50
Nodes (3): leftMaxWidth, leftMinWidth, props

### Community 81 - "fixed.vue"
Cohesion: 0.50
Nodes (3): [Grid], gridOptions, RowType

## Knowledge Gaps
- **498 isolated node(s):** `PreferenceUpdates`, `E2eLayoutType`, `PatchPreferencesInput`, `CachedPreferences`, `LayoutWorkerFixtures` (+493 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 687 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **50 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `ROUTE_ORDER` connect `system.ts` to `demos.ts`, `examples.ts`?**
  _High betweenness centrality (0.025) - this node is a cross-community bridge._
- **Why does `useTamanForm()` connect `useTamanForm` to `query.vue`, `form/basic.vue`, `merge.vue`, `menu/modules/form.vue`, `drawer/index.vue`, `collapsible.vue`, `button-group/index.vue`, `all-fields.vue`, `form.ts`, `badge/index.vue`, `scroll-to-error-test.vue`, `dept/modules/form.vue`, `user/modules/form.vue`, `custom.vue`, `dynamic.vue`, `concurrency-caching.vue`?**
  _High betweenness centrality (0.022) - this node is a cross-community bridge._
- **Why does `useSessionStore` connect `auth.session.ts` to `login.vue`, `request.ts`, `access/index.vue`, `errors.ts`, `form.ts`, `button-control.vue`, `core.vue`, `xlogin.vue`?**
  _High betweenness centrality (0.019) - this node is a cross-community bridge._
- **What connects `PreferenceUpdates`, `E2eLayoutType`, `PatchPreferencesInput` to the rest of the system?**
  _498 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `menu/modules/form.vue` be split into smaller, more focused modules?**
  _Cohesion score 0.051360842844600525 - nodes in this community are weakly interconnected._
- **Should `form/basic.vue` be split into smaller, more focused modules?**
  _Cohesion score 0.05731523378582202 - nodes in this community are weakly interconnected._
- **Should `admin-menu-layouts.spec.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07358156028368794 - nodes in this community are weakly interconnected._