# Graph Report - packages/stores  (2026-06-03)

## Corpus Check
- 13 files · ~4,346 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 82 nodes · 85 edges · 10 communities
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `c4852f32`
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
1. `repository` - 4 edges
2. `exports` - 3 edges
3. `getTabKey()` - 3 edges
4. `getTabKeyFromTab()` - 3 edges
5. `getDefaultTimezoneHandler()` - 2 edges
6. `getTimezoneHandler()` - 2 edges
7. `useTabbarStore` - 2 edges
8. `equalTab()` - 2 edges
9. `routeToTab()` - 2 edges
10. `useAccessStore` - 2 edges

## Surprising Connections (you probably didn't know these)
- None detected - all connections are within the same source files.

## Communities (10 total, 0 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.13
Nodes (14): bugs, default, exports, homepage, license, name, repository, directory (+6 more)

### Community 1 - "Community 1"
Cohesion: 0.14
Nodes (13): addNewTab, addTargetTab, affixTab, currentTab, initialTab, newTab, normalTab, router (+5 more)

### Community 2 - "Community 2"
Cohesion: 0.24
Nodes (6): equalTab(), getTabKey(), getTabKeyFromTab(), RouteCached, routeToTab(), TabbarState

### Community 3 - "Community 3"
Cohesion: 0.22
Nodes (4): InitStoreOptions, SecureLSCtor, secureLSModule, SecureLSStorage

### Community 4 - "Community 4"
Cohesion: 0.22
Nodes (9): dependencies, pinia, pinia-plugin-persistedstate, secure-ls, @vben-core/preferences, @vben-core/shared, @vben-core/typings, vue (+1 more)

### Community 5 - "Community 5"
Cohesion: 0.33
Nodes (5): AccessState, BasicUserInfo, store, userInfo, useUserStore

### Community 6 - "Community 6"
Cohesion: 0.40
Nodes (4): AccessState, AccessToken, store, useAccessStore

### Community 7 - "Community 7"
Cohesion: 0.40
Nodes (4): getDefaultTimezoneHandler(), getTimezoneHandler(), TimezoneHandler, useTimezoneStore

### Community 8 - "Community 8"
Cohesion: 0.50
Nodes (3): extends, include, $schema

## Knowledge Gaps
- **50 isolated node(s):** `name`, `version`, `homepage`, `bugs`, `type` (+45 more)
  These have ≤1 connection - possible missing edges or undocumented components.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `Community 4` to `Community 0`?**
  _High betweenness centrality (0.046) - this node is a cross-community bridge._
- **What connects `name`, `version`, `homepage` to the rest of the system?**
  _50 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.13333333333333333 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.14285714285714285 - nodes in this community are weakly interconnected._