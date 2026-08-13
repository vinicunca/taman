# Graph Report - packages/@core/preferences  (2026-06-02)

## Corpus Check
- 12 files · ~5,559 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 112 nodes · 152 edges · 10 communities (9 shown, 1 thin omitted)
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
- [[_COMMUNITY_Community 9|Community 9]]

## God Nodes (most connected - your core abstractions)
1. `PreferenceManager` - 19 edges
2. `Preferences` - 9 edges
3. `exports` - 6 edges
4. `CustomPreferencesRecord` - 6 edges
5. `updateCSSVariables()` - 5 edges
6. `isDarkTheme()` - 5 edges
7. `repository` - 4 edges
8. `PreferencesExtension` - 4 edges
9. `defaultPreferences` - 4 edges
10. `CustomPreferencesField` - 3 edges

## Surprising Connections (you probably didn't know these)
- `usePreferences()` --calls--> `isDarkTheme()`  [EXTRACTED]
  src/use-preferences.ts → src/update-css-variables.ts
- `PreferenceManager` --references--> `CustomPreferencesRecord`  [EXTRACTED]
  src/preferences.ts → src/types.ts
- `PreferenceManager` --references--> `PreferencesExtension`  [EXTRACTED]
  src/preferences.ts → src/types.ts
- `PreferenceManager` --references--> `Preferences`  [EXTRACTED]
  src/preferences.ts → src/types.ts

## Communities (10 total, 1 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.08
Nodes (23): AnyCustomPreferencesField, AppPreferences, BaseCustomPreferencesField, BreadcrumbPreferences, CopyrightPreferences, CustomPreferencesInputField, CustomPreferencesNumberField, CustomPreferencesOption (+15 more)

### Community 1 - "Community 1"
Cohesion: 0.15
Nodes (16): BUILT_IN_THEME_PRESETS, BuiltinThemePreset, COLOR_PRESETS, DEFAULT_TIME_ZONE_OPTIONS, preferences, mergedPreference, mergedState, preferencesManager (+8 more)

### Community 2 - "Community 2"
Cohesion: 0.11
Nodes (19): bugs, default, development, exports, files, homepage, license, main (+11 more)

### Community 3 - "Community 3"
Cohesion: 0.17
Nodes (4): PreferenceManager, CustomPreferencesRecord, Preferences, PreferencesExtension

### Community 4 - "Community 4"
Cohesion: 0.20
Nodes (9): defaultPreferences, expected, extension, initialCustomPreferences, originalCustomPreferences, originalPreferences, overrides, preferences (+1 more)

### Community 5 - "Community 5"
Cohesion: 0.40
Nodes (5): dependencies, @vben-core/shared, @vben-core/typings, vue, @vueuse/core

### Community 6 - "Community 6"
Cohesion: 0.40
Nodes (4): exclude, extends, include, $schema

### Community 7 - "Community 7"
Cohesion: 0.50
Nodes (4): repository, directory, type, url

## Knowledge Gaps
- **65 isolated node(s):** `name`, `version`, `homepage`, `bugs`, `type` (+60 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `PreferenceManager` connect `Community 3` to `Community 1`?**
  _High betweenness centrality (0.101) - this node is a cross-community bridge._
- **Why does `Preferences` connect `Community 3` to `Community 0`, `Community 1`, `Community 4`?**
  _High betweenness centrality (0.048) - this node is a cross-community bridge._
- **Why does `CustomPreferencesRecord` connect `Community 3` to `Community 0`, `Community 1`?**
  _High betweenness centrality (0.027) - this node is a cross-community bridge._
- **What connects `name`, `version`, `homepage` to the rest of the system?**
  _65 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.08333333333333333 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.14761904761904762 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.11052631578947368 - nodes in this community are weakly interconnected._