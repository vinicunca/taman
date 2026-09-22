# Implementation Plan: Native TanStack Form Validation

## Overview

Refactor only `packages/@core/ui-kit/form-ui`'s validation plumbing so TanStack
Form owns validator execution, error sources, schema issues, cancellation, and
validation state. Preserve the schema renderer, codecs, groups, arrays,
dependencies, component registry, and public `FormApi` facade.

The migration is compatibility-first. Existing synchronous `rules` remain the
common shorthand. Genuine asynchronous validation moves to a direct TanStack
validator configuration instead of being inferred from a Zod schema at runtime.

## Architecture Decisions

- Keep `rules` for synchronous Zod schemas and registered synchronous named
  rules. Map them directly to TanStack's synchronous validator slots.
- Add `formFieldProps.validators` as a direct pass-through for native TanStack
  validators, including `onChangeAsync`, `onBlurAsync`, and their debounce
  options. An explicit native validator wins when it overlaps a generated
  `rules` validator.
- Preserve `validateOn`; it controls which native synchronous slots receive the
  `rules` shorthand. Submission continues to validate the configured slots via
  TanStack's submission lifecycle.
- Derive `error` and `issues` from TanStack field metadata. Do not maintain a
  second `fieldIssues` store.
- Represent imperative errors from `setFieldError` as TanStack `onServer`
  errors. Do not maintain a separate `manualErrors` map.
- Use TanStack's field-level `isValidating` and cancellation. If the aggregate
  form flag is insufficient, derive it from native field metadata rather than
  wrapping validators.
- Keep the delayed 150 ms loading indicator; it is presentation behavior, not
  form state.
- Recommended `clearValidation` contract: clear the errors currently stored in
  TanStack metadata, but do not promise cancellation of already-running work.
  A validator that legitimately finishes afterward may publish its result.
- Do not change default validation timing in this refactor. A separate product
  decision can later adopt submit/blur-first revalidation using TanStack's
  `revalidateLogic`.

## Dependency Flow

```text
Contract tests
    -> native validator pass-through
        -> synchronous rules migration
            -> native issues and server errors
                -> remove async wrapper and duplicate state
                    -> consumer migration and cleanup
```

## Task List

### Phase 1: Lock the Behavioral Contract

#### Task 1: Expand validation regression coverage

**Description:** Turn the known flicker reproduction into the primary contract
and add focused cases for native error sources, async races, full Zod issue
lists, manual errors, and validation loading.

**Acceptance criteria:**

- The skipped flicker test is enabled and fails against the current code.
- Tests distinguish an unchanged invalid message from a genuinely cleared error.
- Tests cover latest-async-result-wins, imperative error clearing, and composite
  issue paths without asserting private implementation details.

**Verification:**

- `pnpm exec vitest run --dom packages/@core/ui-kit/form-ui/__tests__/form-validation-flicker.test.ts packages/@core/ui-kit/form-ui/__tests__/form-composite-errors.test.ts packages/@core/ui-kit/form-ui/__tests__/form-validation-loading.test.ts`

**Dependencies:** None

**Files likely touched:**

- `packages/@core/ui-kit/form-ui/__tests__/form-validation-flicker.test.ts`
- `packages/@core/ui-kit/form-ui/__tests__/form-composite-errors.test.ts`
- `packages/@core/ui-kit/form-ui/__tests__/form-validation-loading.test.ts`

**Estimated scope:** Medium

### Phase 2: Move Validator Execution to TanStack

#### Task 2: Add the native validator escape hatch

**Description:** Extend `FormFieldOptions` with a typed TanStack validator map
and pass it through to the rendered field. Define deterministic merging so an
explicit native validator overrides a shorthand-generated validator for the
same validation cause.

**Acceptance criteria:**

- A field accepts native synchronous and asynchronous TanStack validators.
- Native debounce properties reach TanStack unchanged.
- Existing `rules` and `validateOn` consumers behave unchanged.

**Verification:**

- `pnpm exec vitest run --dom packages/@core/ui-kit/form-ui/__tests__/form-types.test.ts packages/@core/ui-kit/form-ui/__tests__/form-integration.test.ts`
- `pnpm exec vue-tsc --noEmit --skipLibCheck -p packages/@core/ui-kit/form-ui/tsconfig.json`

**Dependencies:** Task 1

**Files likely touched:**

- `packages/@core/ui-kit/form-ui/src/form.types.ts`
- `packages/@core/ui-kit/form-ui/src/form-render/form-render-form-field.vue`
- `packages/@core/ui-kit/form-ui/__tests__/form-types.test.ts`
- `packages/@core/ui-kit/form-ui/__tests__/form-integration.test.ts`

**Estimated scope:** Medium

#### Task 3: Make `rules` a synchronous native shorthand

**Description:** Pass Zod schemas directly to TanStack Standard Schema
validators and adapt registered named rules without `safeParseAsync`. Stop
registering every rule as `onChangeAsync`, `onBlurAsync`, and `onSubmitAsync`.

**Acceptance criteria:**

- Synchronous Zod errors update atomically without an empty intermediate state.
- Named `required` and `selectRequired` rules remain compatible.
- `validateOn: ['blur']`, `validateOn: ['change']`, and the default retain their
  existing trigger behavior.

**Verification:**

- `pnpm exec vitest run --dom packages/@core/ui-kit/form-ui/__tests__/form-validation-flicker.test.ts packages/@core/ui-kit/form-ui/__tests__/form-integration.test.ts packages/@core/ui-kit/form-ui/__tests__/zod-v4-schema.test.ts`

**Dependencies:** Task 2

**Files likely touched:**

- `packages/@core/ui-kit/form-ui/src/form-render/form-render-form-field.vue`
- `packages/@core/ui-kit/form-ui/src/form.types.ts`
- `packages/@core/ui-kit/form-ui/src/form.rule-registry.ts`
- `packages/@core/ui-kit/form-ui/__tests__/form-validation-flicker.test.ts`
- `packages/@core/ui-kit/form-ui/__tests__/form-integration.test.ts`

**Estimated scope:** Medium

### Checkpoint: Native Validator Execution

- All validation-trigger tests pass.
- The flicker regression test is green and no longer skipped.
- Synchronous validation does not enter `isValidating`.
- Review the public typing change before removing compatibility machinery.

### Phase 3: Consolidate Error State

#### Task 4: Derive messages and issues from TanStack metadata

**Description:** Replace the field-local `fieldIssues` ref and watcher with a
pure normalization of the native field `errorMap`/`errors`. Preserve the slot's
`error` and `issues` surface, including composite issue paths and named-rule
messages.

**Acceptance criteria:**

- Composite slots receive all unique Zod issues and their paths.
- Clearing a native error immediately yields `error === undefined` and
  `issues === []`.
- No watcher or mutable issue cache is required.

**Verification:**

- `pnpm exec vitest run --dom packages/@core/ui-kit/form-ui/__tests__/form-composite-errors.test.ts packages/@core/ui-kit/form-ui/__tests__/form-integration.test.ts`

**Dependencies:** Task 3

**Files likely touched:**

- `packages/@core/ui-kit/form-ui/src/form-render/form-render-form-field.vue`
- `packages/@core/ui-kit/form-ui/src/form.types.ts`
- `packages/@core/ui-kit/form-ui/src/form.runtime.ts`
- `packages/@core/ui-kit/form-ui/__tests__/form-composite-errors.test.ts`

**Estimated scope:** Medium

#### Task 5: Move imperative errors into TanStack `errorMap`

**Description:** Implement `setFieldError` with the native `onServer` error
source, remove `manualErrors`, and make all selectors and validity calculations
read one source of truth.

**Acceptance criteria:**

- The lock-screen invalid-password message still appears and clears on edit.
- `errors`, `meta.valid`, `getFieldError`, and `useFieldError` reflect native
  metadata only.
- Reset and targeted `clearValidation` clear the intended native error entries.

**Verification:**

- `pnpm exec vitest run --dom packages/@core/ui-kit/form-ui/__tests__/form-runtime.test.ts packages/@core/ui-kit/form-ui/__tests__/form-api.test.ts packages/@core/ui-kit/form-ui/__tests__/form-validation-flicker.test.ts`

**Dependencies:** Task 4

**Files likely touched:**

- `packages/@core/ui-kit/form-ui/src/form.runtime.ts`
- `packages/@core/ui-kit/form-ui/__tests__/form-runtime.test.ts`
- `packages/@core/ui-kit/form-ui/__tests__/form-api.test.ts`
- `packages/@core/ui-kit/form-ui/__tests__/form-validation-flicker.test.ts`

**Estimated scope:** Medium

### Phase 4: Delete the Superseded Runtime Layer

#### Task 6: Remove custom async-validator wrapping

**Description:** Use `rawForm.Field` directly, rely on TanStack's native
per-cause cancellation, and derive aggregate validating state from native form
or field metadata. Delete the custom runtime field component when tests prove
behavioral parity.

**Acceptance criteria:**

- A stale async validation cannot overwrite a newer result.
- Field and form loading states settle correctly after success, failure, reset,
  and unmount.
- `form.runtime-field.ts`, validation invalidators, and manual pending counters
  are removed.

**Verification:**

- `pnpm exec vitest run --dom packages/@core/ui-kit/form-ui/__tests__/form-runtime.test.ts packages/@core/ui-kit/form-ui/__tests__/form-validation-loading.test.ts packages/@core/ui-kit/form-ui/__tests__/form-validation-flicker.test.ts`

**Dependencies:** Task 5

**Files likely touched:**

- `packages/@core/ui-kit/form-ui/src/form.runtime.ts`
- `packages/@core/ui-kit/form-ui/src/form.runtime-field.ts` (delete)
- `packages/@core/ui-kit/form-ui/__tests__/form-runtime.test.ts`
- `packages/@core/ui-kit/form-ui/__tests__/form-validation-loading.test.ts`

**Estimated scope:** Medium

#### Task 7: Migrate the async example and clean compatibility code

**Description:** Move the single known async Zod example to native async
validators, update comments and public documentation, and remove obsolete
helpers and tests that describe the previous implementation.

**Acceptance criteria:**

- The async username example uses a native async validator and debounce.
- All production `rules` consumers are synchronous.
- No comments or types claim that all rules are automatically async.

**Verification:**

- `pnpm exec vitest run --dom packages/@core/ui-kit/form-ui --exclude packages/@core/ui-kit/form-ui/__tests__/taman-file-upload.test.ts`
- `pnpm -C packages/@core/ui-kit/form-ui build`
- `graphify update .`

**Dependencies:** Task 6

**Files likely touched:**

- `apps/better-auth-front/src/views/examples/form/rules.vue`
- `packages/@core/ui-kit/form-ui/src/form.types.ts`
- `packages/@core/ui-kit/form-ui/src/form-render/form-render-form-field.vue`
- `packages/@core/ui-kit/form-ui/__tests__/form-deprecation-removal.test.ts`

**Estimated scope:** Medium

### Checkpoint: Complete

- All form-ui tests pass except the pre-existing FileUpload fixture failure.
- The package build and focused Vue typecheck pass.
- No validation error unmounts while an unchanged error remains applicable.
- Async validation uses TanStack cancellation and debounce.
- No linting is run unless explicitly requested.
- Graphify is updated after source changes.

## Risks and Mitigations

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Async Zod schemas are passed through `rules` by an unknown external consumer | High | Document `rules` as synchronous, provide native validators first, and consider one release of a development warning before enforcing it. |
| TanStack produces duplicate issues when the same shorthand is attached to multiple causes | Medium | Normalize from `errorMap` and deduplicate issues by message plus path; do not create another state store. |
| Native aggregate `isValidating` misses a field state | Medium | Derive `some(fieldMeta.isValidating)` from native metadata rather than wrapping validators. |
| `clearValidation` currently suppresses in-flight results | Medium | Make the reduced contract explicit and test it; retain custom cancellation only if a real production consumer requires it. |
| Imperative server errors clear differently | High | Add an integration test matching the lock-screen flow before removing `manualErrors`. |
| The published package may have consumers outside this repository | Medium | Keep the public method names and stage the async-rule contract change with documentation or a deprecation window. |

## Review Gate Before Implementation

Confirm these two API decisions:

1. `rules` becomes explicitly synchronous; async work uses
   `formFieldProps.validators.onChangeAsync`/`onBlurAsync`.
2. `clearValidation()` clears stored errors but no longer guarantees that an
   already-running validator cannot publish a later result.

Once accepted, implement Tasks 1-3 first and stop at the native-validator
checkpoint for review before deleting runtime machinery.
