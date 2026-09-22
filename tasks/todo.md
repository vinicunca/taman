# Native TanStack Form Validation

## Phase 1: Contract

- [x] Task 1: Expand validation regression coverage.

## Phase 2: Native validator execution

- [x] Task 2: Add typed `formFieldProps.validators` pass-through.
- [x] Task 3: Make `rules` a synchronous native shorthand.
- [x] Checkpoint: verify flicker, triggers, sync state, and public types.

## Phase 3: Native error state

- [x] Task 4: Derive messages and issues from TanStack metadata.
- [x] Task 5: Move imperative errors into TanStack `errorMap.onServer`.

## Phase 4: Runtime cleanup

- [ ] Task 6: Remove the custom async-validator wrapper and duplicate counters.
- [ ] Task 7: Remove compatibility code (async consumers are migrated).
- [ ] Checkpoint: focused tests, form-ui suite, typecheck, package build.
- [ ] Run `graphify update .` after source changes.

## Decisions required before implementation

- [x] Approve `rules` as synchronous-only; use native validators for async work.
- [x] Approve the reduced `clearValidation()` contract for in-flight validators.

## Standing constraints

- [ ] Do not modify schema rendering, codecs, layout, groups, arrays, or the
  public `FormApi` facade beyond its validation implementation.
- [ ] Do not run linting unless explicitly requested.
- [x] Preserve unrelated working-tree changes.
