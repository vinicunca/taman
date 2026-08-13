# Graph Report - packages/@core/ui-kit/pohon-ui-theme  (2026-06-24)

## Corpus Check
- 125 files · ~20,895 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 159 nodes · 246 edges · 10 communities (5 shown, 5 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `523a3cb5`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]

## God Nodes (most connected - your core abstractions)
1. `BRANDS` - 38 edges
2. `exports` - 4 edges
3. `fieldGroupVariant` - 4 edges
4. `fieldGroupVariantWithRoot` - 3 edges
5. `types` - 2 edges
6. `parseThemeClasses()` - 2 edges
7. `compilerOptions` - 2 edges
8. `development` - 1 edges
9. `default` - 1 edges
10. `main` - 1 edges

## Surprising Connections (you probably didn't know these)
- None detected - all connections are within the same source files.

## Import Cycles
- None detected.

## Communities (10 total, 5 thin omitted)

### Community 2 - "Community 2"
Cohesion: 0.12
Nodes (7): fieldGroupVariant, fieldGroupVariantWithRoot, inputSlots, inputSlots, inputSlots, inputSlots, inputSlots

### Community 3 - "Community 3"
Cohesion: 0.15
Nodes (13): default, dependencies, pohon-ui, unocss, development, exports, files, main (+5 more)

### Community 4 - "Community 4"
Cohesion: 0.29
Nodes (6): compilerOptions, allowImportingTsExtensions, exclude, extends, include, $schema

## Knowledge Gaps
- **23 isolated node(s):** `name`, `type`, `version`, `development`, `default` (+18 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `BRANDS` connect `Community 1` to `Community 2`?**
  _High betweenness centrality (0.029) - this node is a cross-community bridge._
- **What connects `name`, `type`, `version` to the rest of the system?**
  _23 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.027777777777777776 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.11586452762923351 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.12121212121212122 - nodes in this community are weakly interconnected._