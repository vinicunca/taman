# Graph Report - better-auth-back  (2026-09-01)

## Corpus Check
- 32 files · ~4,713 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 135 nodes · 129 edges · 25 communities (17 shown, 8 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 6 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `5d2c97ec`
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
- [[_COMMUNITY_Community 16|Community 16]]

## God Nodes (most connected - your core abstractions)
1. `jsonError()` - 6 edges
2. `targets` - 4 edges
3. `dev` - 4 edges
4. `build` - 4 edges
5. `seed` - 4 edges
6. `options` - 4 edges
7. `getAuthAccess()` - 4 edges
8. `CoreService` - 4 edges
9. `options` - 3 edges
10. `cwd` - 3 edges

## Surprising Connections (you probably didn't know these)
- `getAuthAccess()` --calls--> `useBetterAuth()`  [INFERRED]
  server/auth/auth.access.ts → server/auth/better-auth.instance.ts
- `isLoggedIn()` --calls--> `httpError()`  [INFERRED]
  server/auth/auth.access.ts → server/lib/http.ts
- `jsonError()` --calls--> `applyCorsToResponse()`  [INFERRED]
  server/errors/error.utils.ts → server/lib/cors.ts
- `resolveContext()` --calls--> `getAuthAccess()`  [INFERRED]
  server/lib/context.ts → server/auth/auth.access.ts
- `createBetterAuth()` --calls--> `resolveTrustedOrigins()`  [INFERRED]
  server/auth/better-auth.instance.ts → server/lib/cors.ts

## Import Cycles
- None detected.

## Communities (25 total, 8 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.12
Nodes (18): cache, command, options, cache, command, options, NODE_OPTIONS, command (+10 more)

### Community 1 - "Community 1"
Cohesion: 0.23
Nodes (4): CONNECTION_ERROR_CODES, ErrorBody, jsonError(), body

### Community 2 - "Community 2"
Cohesion: 0.24
Nodes (7): createBetterAuth(), DirectorAuth, DirectorAuthPayload, useBetterAuth(), applyCorsToResponse(), resolveAllowedOrigin(), resolveTrustedOrigins()

### Community 3 - "Community 3"
Cohesion: 0.18
Nodes (11): dependencies, better-auth, consola, csv, drizzle-orm, @taman/constants, @taman/db-pg, @taman/rbac (+3 more)

### Community 4 - "Community 4"
Cohesion: 0.27
Nodes (8): getAuthAccess(), isLoggedIn(), DirectorMember, KNOWN_ORGANIZATION_ROLES, resolveContext(), resolveMember(), TamanContext, toOrganizationRole()

### Community 5 - "Community 5"
Cohesion: 0.20
Nodes (9): devDependencies, nitro, @types/node, typescript, vitest, imports, name, scripts (+1 more)

### Community 6 - "Community 6"
Cohesion: 0.25
Nodes (5): httpError(), parseContext, readValidatedBody(), readValidatedBodyWithFiles(), ValidatedBodyWithFiles

### Community 8 - "Community 8"
Cohesion: 0.33
Nodes (5): name, projectType, $schema, sourceRoot, tags

### Community 11 - "Community 11"
Cohesion: 0.40
Nodes (4): compilerOptions, paths, extends, #*

## Knowledge Gaps
- **49 isolated node(s):** `name`, `type`, `imports`, `scripts`, `@taman/constants` (+44 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **8 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getAuthAccess()` connect `Community 4` to `Community 2`?**
  _High betweenness centrality (0.055) - this node is a cross-community bridge._
- **Why does `useBetterAuth()` connect `Community 2` to `Community 4`?**
  _High betweenness centrality (0.047) - this node is a cross-community bridge._
- **What connects `name`, `type`, `imports` to the rest of the system?**
  _49 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.12418300653594772 - nodes in this community are weakly interconnected._