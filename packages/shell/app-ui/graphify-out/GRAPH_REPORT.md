# Graph Report - app-ui  (2026-09-23)

## Corpus Check
- 24 files · ~3,417 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 118 nodes · 137 edges · 10 communities (9 shown, 1 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 4 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `6b77b529`
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
- app-card.vue
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
Cohesion: 0.16
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

### Community 8 - "app-card.vue"
Cohesion: 0.33
Nodes (3): AppPageProps, slots, {
  title,
  description,
  contentClass,
  headerClass,
  footerClass,
}

### Community 9 - "app-page.vue"
Cohesion: 0.40
Nodes (4): contentStyle, props, slots, AppPageProps

## Knowledge Gaps
- **56 isolated node(s):** `name`, `type`, `version`, `exports`, `@taman-core/form-ui` (+51 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 64 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `dependencies` to `package.json`?**
  _High betweenness centrality (0.042) - this node is a cross-community bridge._
- **Are the 3 inferred relationships involving `useTamanToast()` (e.g. with `error()` and `info()`) actually correct?**
  _`useTamanToast()` has 3 INFERRED edges - model-reasoned connections that need verification._
- **What connects `name`, `type`, `version` to the rest of the system?**
  _56 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `app-fetch-component.vue` be split into smaller, more focused modules?**
  _Cohesion score 0.12380952380952381 - nodes in this community are weakly interconnected._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.10526315789473684 - nodes in this community are weakly interconnected._