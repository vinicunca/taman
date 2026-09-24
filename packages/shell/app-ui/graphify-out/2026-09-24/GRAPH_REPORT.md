# Graph Report - app-ui  (2026-09-24)

## Corpus Check
- 26 files · ~3,670 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 125 nodes · 144 edges · 10 communities (9 shown, 1 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 4 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `3ae81f17`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- app-fetch-component.vue
- dependencies
- auth-login.vue
- count-to.vue
- api-component.test.ts
- package.json
- tsconfig.json
- useTamanToast
- components/index.ts
- app-page.vue

## God Nodes (most connected - your core abstractions)
1. `emitChange()` - 4 edges
2. `useTamanToast()` - 4 edges
3. `AuthLoginValues` - 3 edges
4. `AppFetchComponentSharedProps` - 3 edges
5. `bindProps` - 3 edges
6. `updateModelValue()` - 3 edges
7. `handleFetchForVisible()` - 3 edges
8. `fetchApi()` - 3 edges
9. `@taman-core/form-ui` - 2 edges
10. `@taman-core/popup-ui` - 2 edges

## Surprising Connections (you probably didn't know these)
- None detected - all connections are within the same source files.

## Import Cycles
- None detected.

## Communities (10 total, 1 thin omitted)

### Community 0 - "app-fetch-component.vue"
Cohesion: 0.12
Nodes (19): attrs, bindProps, componentRef, currentModelValue, emitChange(), emits, fetchApi(), getOptions (+11 more)

### Community 1 - "dependencies"
Cohesion: 0.11
Nodes (19): dependencies, pohon-ui, @taman-core/form-ui, @taman-core/popup-ui, @taman-core/shared, @taman-core/taman-ui, @taman/locales, @taman/types (+11 more)

### Community 2 - "auth-login.vue"
Cohesion: 0.17
Nodes (11): emits, [FormAuth, formAuthApi], props, providers, rememberMe, createStrongPasswordSchema(), StrongPasswordMessages, emits (+3 more)

### Community 3 - "count-to.vue"
Cohesion: 0.20
Nodes (9): currentValue, emit, lastValue, numDec, numMain, props, CountToProps, TransitionPresets (+1 more)

### Community 4 - "api-component.test.ts"
Cohesion: 0.20
Nodes (7): ApiComponentLabelFn, AppFetchComponentOptionsItem, AppFetchComponentProps, AppFetchComponentSharedProps, KebabModelInput, ModelValueInput, ValueInput

### Community 5 - "package.json"
Cohesion: 0.25
Nodes (7): devDependencies, @vue/test-utils, exports, name, type, version, @vue/test-utils

### Community 6 - "tsconfig.json"
Cohesion: 0.25
Nodes (7): node_modules, src, @taman/tsconfig/web.json, exclude, extends, include, $schema

### Community 8 - "components/index.ts"
Cohesion: 0.13
Nodes (6): AppPageProps, slots, {
  title,
  description,
  contentClass,
  headerClass,
  footerClass,
}, LOADING_INSTANCE_KEY, loadingDirective, LoadingDirectiveParams

### Community 9 - "app-page.vue"
Cohesion: 0.40
Nodes (4): contentStyle, props, slots, AppPageProps

## Knowledge Gaps
- **59 isolated node(s):** `name`, `type`, `version`, `exports`, `@taman-core/form-ui` (+54 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 69 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `dependencies` to `package.json`?**
  _High betweenness centrality (0.038) - this node is a cross-community bridge._
- **Are the 3 inferred relationships involving `useTamanToast()` (e.g. with `error()` and `info()`) actually correct?**
  _`useTamanToast()` has 3 INFERRED edges - model-reasoned connections that need verification._
- **What connects `name`, `type`, `version` to the rest of the system?**
  _59 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `app-fetch-component.vue` be split into smaller, more focused modules?**
  _Cohesion score 0.12380952380952381 - nodes in this community are weakly interconnected._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.10526315789473684 - nodes in this community are weakly interconnected._
- **Should `components/index.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.13333333333333333 - nodes in this community are weakly interconnected._