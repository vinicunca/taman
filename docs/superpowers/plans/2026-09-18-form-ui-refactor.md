# Form UI Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the form UI's collapsing explicit and opt-in, delete its deprecated API surface and horizontal-layout machinery, and fix four behavior defects — without regressing any existing form in the repo.

**Architecture:** `packages/@core/ui-kit/form-ui` renders a schema array through `form-render-form.vue` → `form-render-form-field.vue` (single fields) or `form-render-group.vue` (groups). State lives in a `FormApi` class backed by TanStack Form. This refactor removes two whole subsystems (`form.value-transform.ts`, `form-render.expandable.ts`), removes the `layout` dimension so every field stacks, and adds three small opt-in surfaces: schema `collapsed`, schema `hideMessage`, and a form-level `disabled`.

**Tech Stack:** Vue 3.5 (`<script setup>`), TypeScript 6.0, TanStack Form + Store, Zod, `pohon-ui` components, UnoCSS utilities, Vitest 4 with `happy-dom` and `@vue/test-utils`.

**Spec:** `docs/superpowers/specs/2026-09-18-form-ui-refactor-design.md`

## Global Constraints

- **Do not run `git commit` at any point.** The user will review the entire
  working tree when the plan is complete. The only committed file is the spec,
  which is already committed. Every task below ends in verification, not a
  commit. This overrides the writing-plans skill's default commit step.
- **Test command:** `pnpm vitest run --dom packages/@core/ui-kit/form-ui`
- **Single-file test command:** `pnpm vitest run --dom packages/@core/ui-kit/form-ui/__tests__/<name>.test.ts`
- **Typecheck command:** ~~`pnpm check:type`~~ — **unusable.** `turbo.json` was
  deleted in commit 75f71c9 and is absent from HEAD, so `turbo run typecheck`
  cannot resolve. This is pre-existing and unrelated to this plan. Substitute:
  `npx vue-tsc --noEmit --skipLibCheck -p packages/@core/ui-kit/form-ui/tsconfig.json`,
  filtered to lines starting `packages/@core/ui-kit/form-ui/`. The unfiltered
  output carries pre-existing errors from `@taman-core/shared` and `taman-ui`
  that belong to the user's own in-flight refactor.
- **Baseline:** 6 tests fail before any work starts (3 in the deprecated
  `valueFormat` path, 3 in `form-group.test.ts`). Tasks 2 and 10 resolve them.
  Never treat these 6 as "already broken, therefore ignorable" once their
  owning task has run.
- **Known-red, out of scope, never to be "fixed" by a task in this plan:**
  `__tests__/taman-file-upload.test.ts` — "keeps a selected file on the parent
  model" — plus the single form-ui type error at `taman-file-upload.test.ts(57,13)`.
  Both are collateral from the user's in-flight `pohon-ui` dependency change: the
  test passes `class: 'select-file'` into pohon-ui's FileUpload and asserts on it,
  and the component no longer renders that class. From Batch A onward the expected
  failure count is **4** (3 form-group + this one), dropping to **1** after
  Task 10.
- **Exit criterion:** the full form-ui suite green, plus `pnpm check:type` clean.
- Tests use `setupTamanForm({ config: {} })` in `beforeAll` and push wrappers
  into a `wrappers` array unmounted in `afterEach` — follow
  `__tests__/form-group.test.ts` exactly.
- Schemas in tests use a local `TestInput` component, not a string component
  name, unless the test is specifically about the component registry.

## Deviation from the spec

Spec section B3 says to implement the collapse toggle with
`TamanExpandableArrow`. On reading that component
(`packages/@core/ui-kit/shadcn-ui/src/components/expandable-arrow/expandable-arrow.vue`)
it is a `<div>` with a bare `@click` — not focusable, not keyboard-operable, no
`aria-expanded` — carries a stale `vben-link` class, and its default slot
fallback renders the raw boolean. Task 9 therefore builds the toggle as a real
`<button>` in `form-actions.vue`, consistent with the chevron already in
`form-render-group.vue`. `TamanExpandableArrow` stays untouched and its unused
import is removed.

## File Structure

**Deleted outright**

| File | Reason |
| --- | --- |
| `src/form.value-transform.ts` | legacy `valueFormat` / `fieldMappingTime` / `arrayToStringFields` pipeline |
| `src/form.deprecation.ts` | unreferenced once the warnings are gone |
| `src/form-render/form-render.expandable.ts` | runtime row measuring, replaced by explicit `collapsed` |
| `src/form-render/form-render.utils.ts` | label-width machinery, meaningless without horizontal layout |
| `__tests__/form-compatibility.test.ts` | tests only deprecated APIs |
| `__tests__/form-value-transform.test.ts` | tests only the deleted pipeline |
| `__tests__/label-width.test.ts` | tests only the deleted machinery |

**Created**

| File | Responsibility |
| --- | --- |
| `src/form-render/form-render-field-control.vue` | the control block (FormControl + slot + suffix), so the collapsible wrapper can be conditional without duplicating markup |
| `src/form.use-delayed-flag.ts` | `useDelayedFlag(source, delayMs)` — sustained-truthy debounce, no render-time mutation |
| `__tests__/form-layout.test.ts` | vertical-only rendering |
| `__tests__/form-label.test.ts` | asterisk pseudo-class, no colon |
| `__tests__/form-collapse.test.ts` | schema `collapsed` and toggle visibility |
| `__tests__/form-field-collapsible.test.ts` | per-field collapsible opt-in |
| `__tests__/form-validation-loading.test.ts` | `useDelayedFlag` + field integration |
| `__tests__/form-disabled.test.ts` | form-level `disabled` |
| `__tests__/form-composite-errors.test.ts` | slot `issues`, `hideMessage` |

**Heavily modified**

`src/form.types.ts` (type removals), `src/form.api.ts` (alias + scan removal,
`disabled`), `src/form.runtime.ts` (alias removal, `useFieldValidating`),
`src/form-render/form-render-form.vue` (layout, collapse), `src/form-render/form-render-form-field.vue`
(control extraction, loading, issues), `src/form-render/form-render-form-label.vue`
(asterisk, colon), `src/form-render/form-render-group.vue` (class hooks),
`src/components/form-actions.vue` (layout, toggle, disabled).

---

## Phase 1 — Deprecation removal

### Task 1: Remove deprecated `formApi` method aliases

**Files:**
- Modify: `src/form.api.ts` (lines ~415-431, ~595-599, ~653-657)
- Modify: `src/form.runtime.ts` (the `resetForm` / `submitForm` entries on the returned object)
- Modify: `src/form.types.ts:175`, `src/form.types.ts:191` (`FormActions.resetForm`, `FormActions.submitForm`)
- Modify: `src/form.types.ts:209` (`FormContextApi` alias)
- Modify: `src/index.ts` (drop the `FormContextApi` export)
- Test: `__tests__/form-compatibility.test.ts` (delete later, in Task 4)

**Interfaces:**
- Consumes: nothing.
- Produces: `FormActions` and `ExtendedFormApi` no longer carry `resetForm`,
  `resetValidate`, `submitForm`, `validateAndSubmitForm`. Callers use `reset`,
  `clearValidation`, `submit`, `validateAndSubmit`.

- [ ] **Step 1: Write the failing test**

Create `__tests__/form-deprecation-removal.test.ts`:

```ts
import { beforeAll, describe, expect, it } from 'vitest';

import { setupTamanForm } from '../src/form.config';
import { useTamanForm } from '../src/form.use-taman-form';

beforeAll(() => {
  setupTamanForm({ config: {} });
});

describe('removed deprecated form api aliases', () => {
  it('no longer exposes the legacy method names', () => {
    const [, formApi] = useTamanForm({ schema: [] });

    expect((formApi as Record<string, unknown>).resetForm).toBeUndefined();
    expect((formApi as Record<string, unknown>).resetValidate).toBeUndefined();
    expect((formApi as Record<string, unknown>).submitForm).toBeUndefined();
    expect(
      (formApi as Record<string, unknown>).validateAndSubmitForm,
    ).toBeUndefined();
  });

  it('still exposes the canonical method names', () => {
    const [, formApi] = useTamanForm({ schema: [] });

    expect(typeof formApi.reset).toBe('function');
    expect(typeof formApi.clearValidation).toBe('function');
    expect(typeof formApi.submit).toBe('function');
    expect(typeof formApi.validateAndSubmit).toBe('function');
  });
});
```

- [ ] **Step 2: Run it and confirm it fails**

Run: `pnpm vitest run --dom packages/@core/ui-kit/form-ui/__tests__/form-deprecation-removal.test.ts`
Expected: FAIL — the first test reports `resetForm` is a function, not undefined.

- [ ] **Step 3: Delete the aliases**

In `src/form.api.ts`, delete the four alias methods. Each looks like:

```ts
  /** @deprecated Use `reset` instead. */
  async resetForm(...) {
    warnDeprecatedOnce(
      'formApi.resetForm',
      '[Taman Form] `formApi.resetForm()` is deprecated. Use `formApi.reset()` instead.',
    );
    return this.reset(...);
  }
```

Delete the method bodies and their JSDoc. In `src/form.runtime.ts`, remove the
`resetForm: reset,` and `submitForm: submit,` entries from the returned object.
In `src/form.types.ts`, delete the `resetForm` and `submitForm` members of
`FormActions` and the whole `FormContextApi` alias. Remove `FormContextApi` from
the `export type { ... }` block in `src/index.ts`.

Leave the `warnDeprecatedOnce` import in `form.api.ts` for now — Task 2 still
uses it, and Task 4 removes it.

- [ ] **Step 4: Run the test and confirm it passes**

Run: `pnpm vitest run --dom packages/@core/ui-kit/form-ui/__tests__/form-deprecation-removal.test.ts`
Expected: PASS, 2 tests.

- [ ] **Step 5: Migrate the one app consumer**

`apps/better-auth-front/src/views/examples/form/scroll-to-error-test.vue`:
- line 94: `await formApi.validateAndSubmitForm();` → `await formApi.validateAndSubmit();`
- line 114: `await formApi.resetForm();` → `await formApi.reset();`
- line 179: `@click="() => formApi.resetForm()"` → `@click="() => formApi.reset()"`
- lines 92, 155, 165: update the comment and the two user-visible strings that
  name `validateAndSubmitForm()` to `validateAndSubmit()`.

- [ ] **Step 6: Verify nothing else references the old names**

Run:
```bash
grep -rn "resetForm\|resetValidate\|submitForm\|validateAndSubmitForm" apps packages --include='*.ts' --include='*.vue' | grep -v node_modules
```
Expected: no output.

---

### Task 2: Delete the legacy value-transform pipeline

This task resolves 3 of the 6 baseline failures by deleting the code and tests
that produce them.

**Files:**
- Delete: `src/form.value-transform.ts`
- Delete: `__tests__/form-value-transform.test.ts`
- Modify: `src/form.api.ts` (the deprecated-transform scan, ~lines 745-780, and all `applyFormValueFormats` / `arrayToStringFields` / `fieldMappingTime` call sites)
- Modify: `src/form.types.ts` — remove `FormValueFormat` (~588), `ArrayToStringFields` (~783-798), `FormFieldMappingTime` (~795-798), and the `valueFormat` / `fieldMappingTime` / `arrayToStringFields` members (~625, ~822, ~858, ~917, ~929)
- Modify: `src/index.ts` (drop any of those type exports)
- Modify: `__tests__/form-api.test.ts` — delete `should format schema values when getting values`, `should fall back to raw values when the initial codec encode fails`, `should format child schema values inside array fields`, `should scan deprecated schema transforms once for unchanged state`
- Modify: `__tests__/form-integration.test.ts` — delete `does not expose raw values through native form submit events` and any other test whose schema sets `valueFormat`

**Interfaces:**
- Consumes: Task 1's cleaned `form.api.ts`.
- Produces: `codec` is the only value-transform mechanism. `FormCodec<TFormValues, TSubmitValues>` with `encode` / `decode` is unchanged and remains exported.

- [ ] **Step 1: Find every reference before deleting**

Run:
```bash
cd packages/@core/ui-kit/form-ui
grep -rn "valueFormat\|fieldMappingTime\|arrayToStringFields\|value-transform\|applyFormValueFormats" src __tests__
```
Record the list. Every hit must be gone by Step 5.

- [ ] **Step 2: Delete the module and its test**

```bash
rm packages/@core/ui-kit/form-ui/src/form.value-transform.ts
rm packages/@core/ui-kit/form-ui/__tests__/form-value-transform.test.ts
```

- [ ] **Step 3: Remove the call sites and the deprecation scan**

In `src/form.api.ts`, delete the import of `form.value-transform`, every call
into it, and the scan block that emits these four warnings:

```
'[Taman Form] The form `codec` takes precedence over deprecated `valueFormat`, `fieldMappingTime`, and `arrayToStringFields` options.'
'[Taman Form] `schema.valueFormat` is deprecated. Use the form-level `codec` instead.'
'[Taman Form] `fieldMappingTime` is deprecated. Use the form-level `codec` instead.'
'[Taman Form] `arrayToStringFields` is deprecated. Use the form-level `codec` instead.'
```

Where a `getValues()`-style method previously piped through
`applyFormValueFormats(...)` then the codec, it now applies the codec alone.

- [ ] **Step 4: Remove the types and prune the tests**

Delete the type declarations listed under **Files**, their `src/index.ts`
exports, and the named tests from `form-api.test.ts` and
`form-integration.test.ts`.

- [ ] **Step 5: Verify no references remain**

Run:
```bash
grep -rn "valueFormat\|fieldMappingTime\|arrayToStringFields" packages apps --include='*.ts' --include='*.vue' | grep -v node_modules
```
Expected: one hit only — `apps/.../examples/form/custom.vue:57`, removed in Task 14. If you prefer, remove it now; it is redundant because that form already has a `codec`.

- [ ] **Step 6: Run the suite**

Run: `pnpm vitest run --dom packages/@core/ui-kit/form-ui`
Expected: the 3 `valueFormat` failures are gone. The 3 `form-group` failures remain — Task 10 owns them.

---

### Task 3: Remove legacy dependency callbacks

**Files:**
- Modify: `src/form-render/form-render.dependencies.ts` (the legacy branch and its warning at ~line 257)
- Modify: `src/form.types.ts` (~lines 423-465: the whole `FormItemDependenciesLegacy` interface)
- Modify: `__tests__/form-integration.test.ts` (~line 447: the test asserting the legacy warning)

**Interfaces:**
- Consumes: nothing from Tasks 1-2.
- Produces: `dependencies` accepts only `FormItemDependenciesResolve` — a
  `resolve(context)` function plus `triggerFields`. The legacy members
  (`componentProps`, `disabled`, `if`, `required`, `rules`, `show`, `trigger`)
  are gone.

- [ ] **Step 1: Confirm no repo consumer uses the legacy shape**

Run:
```bash
grep -rn "dependencies:" apps packages --include='*.ts' --include='*.vue' -A 6 | grep -v node_modules | grep -E "componentProps|triggerFields|resolve|trigger:" | head -40
```
Every `dependencies` block must already use `resolve`. If any uses a legacy key,
migrate that call site in this task — convert it to a single `resolve(ctx)`
returning the same object keys.

- [ ] **Step 2: Write the failing test**

Append to `__tests__/form-deprecation-removal.test.ts`:

```ts
import type { FormSchema } from '../src/form.types';

describe('removed legacy dependency callbacks', () => {
  it('only accepts the resolve form', () => {
    const schema: FormSchema = {
      component: 'Input',
      dependencies: {
        resolve: () => ({ disabled: true }),
        triggerFields: ['other'],
      },
      fieldName: 'name',
    };

    expect(schema.dependencies?.resolve).toBeTypeOf('function');
    expect(
      Object.keys(schema.dependencies ?? {}).sort(),
    ).toEqual(['resolve', 'triggerFields']);
  });
});
```

- [ ] **Step 3: Run it**

Run: `pnpm vitest run --dom packages/@core/ui-kit/form-ui/__tests__/form-deprecation-removal.test.ts`
Expected: PASS at runtime even before the change (it is a shape assertion). Its
real value is as a typecheck guard — Step 6 is the gate.

- [ ] **Step 4: Delete the legacy branch**

In `src/form-render/form-render.dependencies.ts`, remove the code path that
reads the legacy keys and the `warnDeprecatedOnce` call emitting
`'[Taman Form] Legacy dependency callbacks are deprecated. Use `dependencies.resolve(context)` instead.'`,
along with its now-unused import. In `src/form.types.ts`, delete
`FormItemDependenciesLegacy` and remove it from the union that `dependencies`
is typed against, leaving only the `resolve` variant.

- [ ] **Step 5: Delete the legacy-warning test**

Remove the test at `__tests__/form-integration.test.ts:447` that asserts the
legacy warning fires. (Note its message string says `[Vben Form]`, which no
longer matches the emitted `[Taman Form]` text — further evidence it is stale.)

- [ ] **Step 6: Verify**

Run: `pnpm vitest run --dom packages/@core/ui-kit/form-ui` then `pnpm check:type`
Expected: suite has only the 3 `form-group` failures; typecheck clean.

---

### Task 4: Remove `defineRules` and delete `form.deprecation.ts`

**Files:**
- Modify: `src/form.config.ts` (~line 101: the `defineRules` warning and fallback)
- Modify: `src/form.types.ts:1015` (`defineRules` member of the setup options)
- Delete: `src/form.deprecation.ts`
- Delete: `__tests__/form-compatibility.test.ts`
- Modify: `__tests__/form-types.test.ts` (~line 51 `accepts both new and deprecated rule registration options`, ~line 328 `exposes canonical names alongside deprecated aliases`)

**Interfaces:**
- Consumes: Tasks 1-3 removed every other `warnDeprecatedOnce` caller.
- Produces: `setupTamanForm({ rules })` is the only rule-registration form. No
  deprecation infrastructure remains in the package.

- [ ] **Step 1: Confirm `warnDeprecatedOnce` has no callers left**

Run:
```bash
grep -rn "warnDeprecatedOnce\|resetDeprecationWarnings\|form.deprecation" packages/@core/ui-kit/form-ui
```
Expected: hits only inside `src/form.config.ts`, `src/form.deprecation.ts`, and
the two test files being deleted or pruned. If `form.api.ts` or
`form-render.dependencies.ts` still appear, finish Tasks 1-3 first.

- [ ] **Step 2: Write the failing test**

Append to `__tests__/form-deprecation-removal.test.ts`:

```ts
it('registers rules only through the `rules` option', () => {
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

  setupTamanForm({
    rules: {
      required: () => true,
    },
  });

  expect(warn).not.toHaveBeenCalled();
  warn.mockRestore();
});
```

Add `vi` to the `vitest` import at the top of the file.

- [ ] **Step 3: Run it**

Run: `pnpm vitest run --dom packages/@core/ui-kit/form-ui/__tests__/form-deprecation-removal.test.ts`
Expected: PASS (no warning is emitted for the `rules` path today either) — this
test locks in that no *new* warning appears.

- [ ] **Step 4: Remove `defineRules` and the deprecation module**

In `src/form.config.ts`, delete the `defineRules` fallback and its
`warnDeprecatedOnce` call emitting
`'[Taman Form] `setupTamanForm({ defineRules })` is deprecated. Use `setupTamanForm({ rules })` instead.'`,
plus the now-unused import. In `src/form.types.ts:1015`, delete the
`defineRules?: Partial<Record<string, FormRuleValidator>>;` member. Then:

```bash
rm packages/@core/ui-kit/form-ui/src/form.deprecation.ts
rm packages/@core/ui-kit/form-ui/__tests__/form-compatibility.test.ts
```

- [ ] **Step 5: Prune `form-types.test.ts`**

Delete the two named tests. If `exposes canonical names alongside deprecated
aliases` also asserts the canonical names, keep that half as its own test named
`exposes canonical method names`.

- [ ] **Step 6: Verify**

Run: `pnpm vitest run --dom packages/@core/ui-kit/form-ui` then `pnpm check:type`
Expected: only the 3 `form-group` failures remain; typecheck clean.

---

## Phase 2 — Vertical-only layout

### Task 5: Delete the `layout` prop and the label-width machinery

**Files:**
- Delete: `src/form-render/form-render.utils.ts`
- Delete: `__tests__/label-width.test.ts`
- Modify: `src/form.types.ts` — remove `FormLayout` (line 43), `FormLabelWidthContext` (lines 9-11), the `layout` member (~868), `commonConfig.labelWidth` (~560), schema `labelWidth`
- Modify: `src/index.ts` — remove the `FormLayout` export
- Modify: `src/form-render/form-render.context.ts` — remove `isVertical` and the `FormLabelWidthContext` intersection
- Modify: `src/form-render/form-render-form.vue` — remove `useFormLabelWidth` from the provide, remove the `inline` branch in `getWrapperClass`
- Modify: `src/form-render/form-render-form-field.vue` — remove `isVertical` from `useFormContext()`, the `useFieldLabelWidth` block (~lines 128-134), `labelWidth` from the destructured props, and the layout-conditional classes (~lines 487-488, 502-504)
- Modify: `src/form-render/form-render.schema.ts` — remove `labelWidth = 100` from the destructure (~line 419) and `labelWidth` from the returned object (~line 441)
- Modify: `src/components/form-actions.vue` (~lines 82-83)
- Modify: `src/form.api.ts:121` and `src/taman-form.vue:25` — remove `layout: 'horizontal'` defaults
- Test: `__tests__/form-layout.test.ts` (create)

**Interfaces:**
- Consumes: nothing from Phase 1.
- Produces: `useFormContext()` returns `{ componentBindEventMap, componentMap }`
  only. `FormRenderProps` has no `layout`. Every `FormItem` root carries
  `flex-col`; no field renders an inline label style attribute.

- [ ] **Step 1: Write the failing test**

Create `__tests__/form-layout.test.ts`:

```ts
import type { VueWrapper } from '@vue/test-utils';

import { flushPromises, mount } from '@vue/test-utils';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import { defineComponent, h } from 'vue';

import { setupTamanForm } from '../src/form.config';
import { useTamanForm } from '../src/form.use-taman-form';

const wrappers: Array<VueWrapper> = [];

const TestInput = defineComponent({
  inheritAttrs: false,
  emits: ['update:modelValue'],
  setup(_props, { attrs, emit }) {
    return () =>
      h('input', {
        ...attrs,
        onInput: (event: Event) => {
          emit('update:modelValue', (event.target as HTMLInputElement).value);
        },
        value: attrs.modelValue ?? '',
      });
  },
});

beforeAll(() => {
  setupTamanForm({ config: {} });
});

afterEach(() => {
  for (const wrapper of wrappers.splice(0)) {
    wrapper.unmount();
  }
});

describe('vertical-only layout', () => {
  it('always stacks the label above the control', async () => {
    const [Form] = useTamanForm({
      schema: [{ component: TestInput, fieldName: 'name', label: 'Name' }],
    });
    const wrapper = mount(Form);
    wrappers.push(wrapper);
    await flushPromises();

    const item = wrapper.get('[data-slot="form-item"]');
    expect(item.classes()).toContain('flex-col');
    expect(item.classes()).not.toContain('flex-row');
    expect(item.classes()).not.toContain('items-center');
  });

  it('never applies an inline width style to the label', async () => {
    const [Form] = useTamanForm({
      schema: [{ component: TestInput, fieldName: 'name', label: 'Name' }],
    });
    const wrapper = mount(Form);
    wrappers.push(wrapper);
    await flushPromises();

    const label = wrapper.get('[data-slot="form-label"]');
    expect(label.attributes('style')).toBeUndefined();
  });

  it('still forwards labelClass to the label element', async () => {
    const [Form] = useTamanForm({
      commonConfig: { labelClass: 'text-xs' },
      schema: [{ component: TestInput, fieldName: 'name', label: 'Name' }],
    });
    const wrapper = mount(Form);
    wrappers.push(wrapper);
    await flushPromises();

    expect(wrapper.get('[data-slot="form-label"]').classes()).toContain(
      'text-xs',
    );
  });
});
```

- [ ] **Step 2: Run it and confirm it fails**

Run: `pnpm vitest run --dom packages/@core/ui-kit/form-ui/__tests__/form-layout.test.ts`
Expected: FAIL — the default layout is `horizontal`, so the item has
`flex-row items-center` and the label carries a `width` style.

- [ ] **Step 3: Delete the machinery**

```bash
rm packages/@core/ui-kit/form-ui/src/form-render/form-render.utils.ts
rm packages/@core/ui-kit/form-ui/__tests__/label-width.test.ts
```

`src/form-render/form-render.context.ts` becomes:

```ts
import type { FormRenderProps } from '../form.types';

import { createContext } from '@taman-core/taman-ui';
import { computed } from 'vue';

export const [
  injectRenderFormProps,
  provideFormRenderProps,
] = createContext<FormRenderProps>('FormRenderProps');

export function useFormContext() {
  const formRenderProps = injectRenderFormProps();

  const componentMap = computed(() => formRenderProps.componentMap);
  const componentBindEventMap = computed(
    () => formRenderProps.componentBindEventMap,
  );

  return {
    componentBindEventMap,
    componentMap,
  };
}
```

In `src/form-render/form-render-form.vue`, drop the `useFormLabelWidth` import
and spread, so the provide is `provideFormRenderProps(reactive({ ...toRefs(props) }))`,
and simplify:

```ts
function getWrapperClass(gridClass = '') {
  return [
    'flex',
    props.compact ? 'gap-x-2' : 'gap-x-4',
    'flex-col grid',
    gridClass,
  ];
}
```

In `src/form-render/form-render-form-field.vue`, the `FormItem` class binding
becomes:

```vue
<FormItem
  v-show="isShow"
  :class="{
    'form-valid-error': shouldApplyInvalidStyle,
    'form-is-required': shouldRequired,
    'pb-6': !compact,
    'pb-2': compact,
  }"
  class="flex flex-col relative"
  v-bind="$attrs"
>
```

and the `FormLabel` loses `:style="labelStyle"`, `ref="labelRef"` and the
layout-conditional classes, keeping `class="leading-6 flex mb-1"` plus
`labelClass`.

**Keep `mb-1`.** It came from the old `'mb-1 flex-row': isVertical` branch.
Dropping the whole conditional object also drops the label's bottom margin, and
nothing replaces it: `FormItem` contributes no `gap-y`/`space-y` of its own
(`taman-ui/src/ui/form/form-item.vue`) and the control wrapper below it is
`p-px`, i.e. 1px. Losing it shrinks the label-to-control gap from ~5px to 1px on
**every** field in the app. `flex-row` is the only class safe to drop here, since
`flex` already defaults to row.

In `src/components/form-actions.vue`, the two layout lines become unconditional
`'self-end'` and `'w-full'`.

- [ ] **Step 4: Run the test and confirm it passes**

Run: `pnpm vitest run --dom packages/@core/ui-kit/form-ui/__tests__/form-layout.test.ts`
Expected: PASS, 3 tests.

- [ ] **Step 5: Migrate every `layout` call site**

Remove the `layout:` option from: `custom.vue:59`, `all-fields.vue:67`,
`api.vue:19`, `custom-layout.vue:12`, `merge.vue:37`, `merge.vue:65`,
`dynamic.vue:7`, `rules.vue:16`, `dept/modules/form.vue:25`,
`auth-login.vue:76`, `auth-register.vue:45`, `base-setting.vue:33`,
`password-setting.vue:34`, and `__tests__/form-api.test.ts:24`.

Then the template binding in
`apps/better-auth-front/src/views/system/menu/modules/form.vue`:
- line 500 → `<Form class="mx-4" />`
- line 432 → delete `const isHorizontal = ...`
- delete the now-unused `useBreakpoints` / `breakpointsTailwind` imports and the
  `const breakpoints = useBreakpoints(breakpointsTailwind)` line if nothing else
  in the file uses them (grep the file for `breakpoints` before deleting).

Also remove `labelWidth` from `api.vue` (the `labelWidth` / `resetLabelWidth`
cases in `handleClick`, their buttons, and the union member in the `action`
parameter type) and `array-fields.vue`.

- [ ] **Step 6: Verify**

Run:
```bash
grep -rn "FormLayout\|isVertical\|labelWidth\|form-render.utils" apps packages --include='*.ts' --include='*.vue' | grep -v node_modules | grep -v descriptions
```
Expected: no output.

Then `pnpm vitest run --dom packages/@core/ui-kit/form-ui` and `pnpm check:type`.

---

### Task 6: Asterisk as a pseudo-element; remove the colon

**Files:**
- Modify: `src/form-render/form-render-form-label.vue`
- Modify: `src/form-render/form-render-form-field.vue` (remove `colon` from the destructured props and the `:colon` binding at ~line 501)
- Modify: `src/form.types.ts:508-510` (`colon` member)
- Modify: `src/form-render/form-render.schema.ts` (~409 destructure, ~443 return)
- Test: `__tests__/form-label.test.ts` (create)

**Interfaces:**
- Consumes: Task 5's simplified label element.
- Produces: `FormLabel` carries `after:content-['*']` when required.
  `FormCommonConfig` has no `colon`.

- [ ] **Step 1: Write the failing test**

Create `__tests__/form-label.test.ts` with the same `TestInput`, `wrappers`,
`beforeAll`, `afterEach` preamble as `form-layout.test.ts`, then:

```ts
describe('form label', () => {
  it('marks required fields with an after: pseudo-element, not a span', async () => {
    const [Form] = useTamanForm({
      schema: [
        {
          component: TestInput,
          fieldName: 'name',
          label: 'Name',
          rules: 'required',
        },
      ],
    });
    const wrapper = mount(Form);
    wrappers.push(wrapper);
    await flushPromises();

    const label = wrapper.get('[data-slot="form-label"]');
    expect(label.classes()).toContain("after:content-['*']");
    expect(label.text()).not.toContain('*');
  });

  it('omits the marker on optional fields', async () => {
    const [Form] = useTamanForm({
      schema: [{ component: TestInput, fieldName: 'name', label: 'Name' }],
    });
    const wrapper = mount(Form);
    wrappers.push(wrapper);
    await flushPromises();

    expect(
      wrapper.get('[data-slot="form-label"]').classes(),
    ).not.toContain("after:content-['*']");
  });

  it('omits the marker when hideRequiredMark is set', async () => {
    const [Form] = useTamanForm({
      commonConfig: { hideRequiredMark: true },
      schema: [
        {
          component: TestInput,
          fieldName: 'name',
          label: 'Name',
          rules: 'required',
        },
      ],
    });
    const wrapper = mount(Form);
    wrappers.push(wrapper);
    await flushPromises();

    expect(
      wrapper.get('[data-slot="form-label"]').classes(),
    ).not.toContain("after:content-['*']");
  });

  it('never renders a colon', async () => {
    const [Form] = useTamanForm({
      schema: [{ component: TestInput, fieldName: 'name', label: 'Name' }],
    });
    const wrapper = mount(Form);
    wrappers.push(wrapper);
    await flushPromises();

    expect(wrapper.get('[data-slot="form-label"]').text()).toBe('Name');
  });
});
```

- [ ] **Step 2: Run it and confirm it fails**

Run: `pnpm vitest run --dom packages/@core/ui-kit/form-ui/__tests__/form-label.test.ts`
Expected: FAIL — the asterisk is a `<span>`, so `label.text()` contains `*` and
the class is absent.

- [ ] **Step 3: Rewrite the label component**

`src/form-render/form-render-form-label.vue` becomes:

```vue
<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import type { FormCustomRenderType } from '../form.types';
import { useForwardExpose } from '@taman-core/composables';
import {
  FormLabel,
  TamanRenderContent,
} from '@taman-core/taman-ui';
import PTooltip from 'pohon-ui/components/Tooltip.vue';
import PIcon from 'pohon-ui/runtime/vue/components/Icon.vue';

interface Props {
  class?: HTMLAttributes['class'];
  help?: FormCustomRenderType;
  label?: FormCustomRenderType;
  required?: boolean;
}

const props = defineProps<Props>();

const { forwardRef } = useForwardExpose();

// The required marker is a pseudo-element so it costs no DOM node, matching
// `COLON_CLASS` in descriptions-cell.vue. `order` keeps it directly after the
// label text rather than after the help tooltip, since a pseudo-element is
// otherwise the last flex item.
const REQUIRED_CLASS
  = "after:content-['*'] after:color-error after:ml-0.5 after:order-1";
</script>

<template>
  <FormLabel
    :ref="forwardRef"
    class="flex items-center"
    :class="[props.class, props.required ? REQUIRED_CLASS : '']"
  >
    <slot />

    <PTooltip
      v-if="help"
      class="order-2"
    >
      <PIcon name="lucide:circle-question-mark" />

      <template #content>
        <TamanRenderContent :content="help" />
      </template>
    </PTooltip>
  </FormLabel>
</template>
```

Then in `src/form-render/form-render-form-field.vue` remove `colon` from the
`defineProps` destructure and delete the `:colon="colon"` binding; in
`src/form.types.ts` delete the `colon` member of `FormCommonConfig`; in
`src/form-render/form-render.schema.ts` delete `colon = false,` from the
destructure and `colon,` from the returned object.

- [ ] **Step 4: Run the test and confirm it passes**

Run: `pnpm vitest run --dom packages/@core/ui-kit/form-ui/__tests__/form-label.test.ts`
Expected: PASS, 4 tests.

- [ ] **Step 5: Remove the two `colon` consumers**

Delete `colon: true,` from
`apps/better-auth-front/src/views/system/menu/modules/form.vue:436` and
`apps/better-auth-front/src/views/examples/form/all-fields.vue:61`.

- [ ] **Step 6: Verify**

Run:
```bash
grep -rn "colon" apps packages --include='*.ts' --include='*.vue' | grep -v node_modules | grep -v descriptions
```
Expected: no output.

Then `pnpm vitest run --dom packages/@core/ui-kit/form-ui`.

---

## Phase 3 — Per-field collapsible opt-in

### Task 7: Extract the field control and make the collapsible wrapper conditional

**Files:**
- Create: `src/form-render/form-render-field-control.vue`
- Create: `src/form-render/form-render-field-collapsible.vue`
- Modify: `src/form-render/form-render-form-field.vue`
- Test: `__tests__/form-field-collapsible.test.ts` (create)

**Interfaces:**
- Consumes: Task 5's simplified field template.
- Produces:
  - `FormRenderFieldControl` with props
    `{ controlClass?: HTMLAttributes['class']; suffix?: FormCustomRenderType; wrapperClass?: HTMLAttributes['class'] }`
    and a default slot.
  - `FormRenderFieldCollapsible` with prop `{ collapsible?: boolean }`, a
    `defineModel<boolean>('open')`, and a default slot it renders either inside
    `PCollapsible` or bare.
  - The field renders exactly one `PCollapsible` when `collapsible` is truthy
    and none otherwise.

- [ ] **Step 1: Write the failing test**

Create `__tests__/form-field-collapsible.test.ts` with the standard preamble,
then:

```ts
describe('per-field collapsible', () => {
  it('renders no collapsible wrapper by default', async () => {
    const [Form] = useTamanForm({
      schema: [{ component: TestInput, fieldName: 'name', label: 'Name' }],
    });
    const wrapper = mount(Form);
    wrappers.push(wrapper);
    await flushPromises();

    expect(wrapper.find('[data-slot="form-item"] [data-state]').exists()).toBe(
      false,
    );
    expect(wrapper.find('input').exists()).toBe(true);
  });

  it('renders a collapsible wrapper when opted in', async () => {
    const [Form] = useTamanForm({
      schema: [
        {
          collapsible: true,
          component: TestInput,
          fieldName: 'name',
          label: 'Name',
        },
      ],
    });
    const wrapper = mount(Form);
    wrappers.push(wrapper);
    await flushPromises();

    expect(wrapper.find('[data-state]').exists()).toBe(true);
    expect(wrapper.find('input').exists()).toBe(true);
  });

  it('starts closed when defaultCollapsed is set', async () => {
    const [Form] = useTamanForm({
      schema: [
        {
          collapsible: true,
          component: TestInput,
          defaultCollapsed: true,
          fieldName: 'name',
          label: 'Name',
        },
      ],
    });
    const wrapper = mount(Form);
    wrappers.push(wrapper);
    await flushPromises();

    expect(wrapper.get('[data-state]').attributes('data-state')).toBe('closed');
  });
});
```

- [ ] **Step 2: Run it and confirm it fails**

Run: `pnpm vitest run --dom packages/@core/ui-kit/form-ui/__tests__/form-field-collapsible.test.ts`
Expected: FAIL on the first test — a `[data-state]` element is present because
`PCollapsible` always renders.

- [ ] **Step 3: Create the control component**

`src/form-render/form-render-field-control.vue`:

```vue
<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import type { FormCustomRenderType } from '../form.types';

import { FormControl, TamanRenderContent } from '@taman-core/taman-ui';

interface Props {
  controlClass?: HTMLAttributes['class'];
  suffix?: FormCustomRenderType;
  wrapperClass?: HTMLAttributes['class'];
}

const props = defineProps<Props>();
</script>

<template>
  <div
    class="flex w-full items-center relative"
    :class="[props.wrapperClass]"
  >
    <FormControl :class="props.controlClass">
      <slot />
    </FormControl>

    <!-- Custom suffix -->
    <div
      v-if="props.suffix"
      class="ml-1"
    >
      <TamanRenderContent :content="props.suffix" />
    </div>
  </div>
</template>
```

- [ ] **Step 4: Make the wrapper conditional**

Create `src/form-render/form-render-field-collapsible.vue`. Slot content is
compiled in the *parent's* scope, so `ref="fieldComponentRef"` inside the slot
still registers on `form-render-form-field.vue` — which is why this wrapper works
where hoisting the control into a child component would not:

```vue
<script setup lang="ts">
import PCollapsible from 'pohon-ui/components/Collapsible.vue';

interface Props {
  collapsible?: boolean;
}

const props = defineProps<Props>();

const open = defineModel<boolean>('open', { default: true });
</script>

<template>
  <PCollapsible
    v-if="props.collapsible"
    v-model:open="open"
  >
    <template #content>
      <slot />
    </template>
  </PCollapsible>

  <slot v-else />
</template>
```

Then in `src/form-render/form-render-form-field.vue`, import both new components,
drop the now-unused `PCollapsible` and `FormControl` imports, and replace the
whole control block with a single copy:

```vue
<div class="p-px flex-auto">
  <FormRenderFieldCollapsible
    v-model:open="collapseOpen"
    :collapsible="shouldCollapsible"
  >
    <FormRenderFieldControl
      :control-class="controlClass"
      :suffix="suffix"
      :wrapper-class="wrapperClass"
    >
      <slot v-bind="createFieldSlotScope(slotProps)">
        <component
          :is="FieldComponent"
          ref="fieldComponentRef"
          :class="{
            'border-error hover:border-error/80 focus:border-error focus:shadow-[0_0_0_2px_rgba(255,38,5,0.06)]':
              shouldApplyInvalidStyle,
          }"
          v-bind="createComponentProps(slotProps)"
        >
          <template
            v-for="name in renderContentKey"
            :key="name"
            #[name]="renderSlotProps"
          >
            <TamanRenderContent
              :content="customContentRender[name]"
              v-bind="{
                ...renderSlotProps,
                formContext: createFieldSlotProps(slotProps),
              }"
            />
          </template>
        </component>
      </slot>
    </FormRenderFieldControl>
  </FormRenderFieldCollapsible>

  <!-- FormDescription / FormMessage below stay exactly as they are -->
</div>
```

Also simplify:

```ts
const shouldCollapsible = computed(() => collapsible);
```

**Verify the template ref survived.** `getFieldComponentRef` and
scroll-to-error both depend on `fieldComponentRef` resolving. If
`form-api.test.ts`'s componentRef or scroll-to-error cases fail after this
change, the slot-scoping assumption is wrong — fall back to duplicating the
control block across a `v-if`/`v-else` on `PCollapsible` (keeping the two copies
byte-identical) and say so in your report.

- [ ] **Step 5: Run the test and confirm it passes**

Run: `pnpm vitest run --dom packages/@core/ui-kit/form-ui/__tests__/form-field-collapsible.test.ts`
Expected: PASS, 3 tests.

- [ ] **Step 6: Verify the ref still resolves**

Run: `pnpm vitest run --dom packages/@core/ui-kit/form-ui`
Expected: no new failures; in particular the `getFieldComponentRef` and
scroll-to-error tests in `form-api.test.ts` still pass.

---

## Phase 4 — Collapse API

### Task 8: Replace row measuring with a per-field `collapsed` flag

**Files:**
- Delete: `src/form-render/form-render.expandable.ts`
- Modify: `src/form-render/form-render-form.vue`
- Modify: `src/form.types.ts` — add `collapsed?: boolean` to the field schema body and to `FormGroupSchema`; remove `collapsedRows` (~834) and `showCollapseButton` (~876)
- Test: `__tests__/form-collapse.test.ts` (create)

**Interfaces:**
- Consumes: Task 5's `getWrapperClass`.
- Produces: schema entries gain `collapsed?: boolean`. Task 9 derives the
  toggle's visibility from this flag independently, reading `rootProps.schema`
  in `form-actions.vue` — `form-render-form.vue` exposes nothing new.

- [ ] **Step 1: Write the failing test**

Create `__tests__/form-collapse.test.ts` with the standard preamble, then:

```ts
describe('form-level collapse', () => {
  function threeFieldSchema() {
    return [
      { component: TestInput, fieldName: 'a', label: 'A' },
      { component: TestInput, collapsed: true, fieldName: 'b', label: 'B' },
      { component: TestInput, collapsed: true, fieldName: 'c', label: 'C' },
    ];
  }

  it('hides only the marked entries when collapsed', async () => {
    const [Form] = useTamanForm({
      collapsed: true,
      schema: threeFieldSchema(),
    });
    const wrapper = mount(Form);
    wrappers.push(wrapper);
    await flushPromises();

    const items = wrapper.findAll('[data-slot="form-item"]');
    expect(items).toHaveLength(3);
    expect(items[0]?.isVisible()).toBe(true);
    expect(items[1]?.isVisible()).toBe(false);
    expect(items[2]?.isVisible()).toBe(false);
  });

  it('shows every entry when expanded', async () => {
    const [Form] = useTamanForm({
      collapsed: false,
      schema: threeFieldSchema(),
    });
    const wrapper = mount(Form);
    wrappers.push(wrapper);
    await flushPromises();

    for (const item of wrapper.findAll('[data-slot="form-item"]')) {
      expect(item.isVisible()).toBe(true);
    }
  });

  it('never hides anything when no entry is marked', async () => {
    const [Form] = useTamanForm({
      collapsed: true,
      schema: [
        { component: TestInput, fieldName: 'a', label: 'A' },
        { component: TestInput, fieldName: 'b', label: 'B' },
      ],
    });
    const wrapper = mount(Form);
    wrappers.push(wrapper);
    await flushPromises();

    for (const item of wrapper.findAll('[data-slot="form-item"]')) {
      expect(item.isVisible()).toBe(true);
    }
  });

  it('can mark a whole group as collapsed', async () => {
    const [Form] = useTamanForm({
      collapsed: true,
      schema: [
        { component: TestInput, fieldName: 'a', label: 'A' },
        {
          children: [{ component: TestInput, fieldName: 'b', label: 'B' }],
          collapsed: true,
          name: 'extra',
          title: 'Extra',
          type: 'group',
        },
      ],
    });
    const wrapper = mount(Form);
    wrappers.push(wrapper);
    await flushPromises();

    expect(wrapper.get('.form-group').isVisible()).toBe(false);
  });
});
```

- [ ] **Step 2: Run it and confirm it fails**

Run: `pnpm vitest run --dom packages/@core/ui-kit/form-ui/__tests__/form-collapse.test.ts`
Expected: FAIL — `collapsed` is not a schema key, so nothing hides.

- [ ] **Step 3: Add the schema flag**

In `src/form.types.ts`, add to `FormSchemaBody` (the interface the field schema
extends) and to `FormGroupSchema`:

```ts
  /**
   * Hide this entry while the form is collapsed.
   * The collapse toggle appears only when at least one top-level entry sets it.
   * Distinct from the form-level `collapsed` state, which asks whether the form
   * is collapsed right now.
   * @default false
   */
  collapsed?: boolean;
```

Remove the `collapsedRows` and `showCollapseButton` members of `FormRenderProps`.

- [ ] **Step 4: Rewire the renderer**

```bash
rm packages/@core/ui-kit/form-ui/src/form-render/form-render.expandable.ts
```

In `src/form-render/form-render-form.vue`, delete the `useExpandable` import and
call, the `ref="wrapperRef"` attribute on the grid div, the `formCollapsed`
computed, and `collapsedRows` / `showCollapseButton` from `withDefaults`. Then:

Inside `computedSchema`, replace the index arithmetic with:

```ts
(props.schema ?? []).forEach((schema, index) => {
  const hidden = Boolean(props.collapsed) && schema.collapsed === true;
  // ...unchanged group / field handling below
});
```

- [ ] **Step 5: Run the test and confirm it passes**

Run: `pnpm vitest run --dom packages/@core/ui-kit/form-ui/__tests__/form-collapse.test.ts`
Expected: PASS, 4 tests.

- [ ] **Step 6: Strip the removed options from remaining consumers**

First re-run the search, because the user is deleting the vxe-table examples in
parallel and `views/examples/vxe-table/form.vue` is already gone:

```bash
grep -rn "showCollapseButton\|collapseTriggerResize\|collapsedRows" apps packages --include='*.vue' --include='*.ts' | grep -v node_modules | grep -v layout-ui
```

`layout-ui`'s sidebar has its own unrelated `showCollapseButton` — never touch it.

As of writing, two places need editing:

1. `packages/effects/plugins/src/vxe-table/use-vxe-grid.vue` — delete
   `showCollapseButton: true,` at line 145, and at line 370 replace
   `collapseTriggerResize: !!finalFormOptions.showCollapseButton,` with
   `collapseTriggerResize: true,`. This file is slated for deletion by the user,
   so this is a mechanical typecheck fix, not a migration — do not design a
   collapsed set for it. If the file is already gone when you get here, skip it.
2. `packages/@core/ui-kit/form-ui/__tests__/form-api.test.ts` — delete
   `collapsedRows: 1,` (line 20) and `showCollapseButton: false,` (line 27) from
   the default-state assertion, since those keys no longer exist on the state.

Run: `pnpm check:type` and `pnpm vitest run --dom packages/@core/ui-kit/form-ui`
Expected: clean and green.

---

### Task 9: Implement the collapse toggle button

**Files:**
- Modify: `src/components/form-actions.vue`
- Modify: `src/taman-use-form.vue` / `src/taman-form.vue` if the toggle needs `hasCollapsibleFields` forwarded
- Test: `__tests__/form-collapse.test.ts` (extend)

**Interfaces:**
- Consumes: Task 8's schema `collapsed` flag.
- Produces: `form-actions.vue` renders `<button class="form-collapse-trigger">`
  with `aria-expanded` when at least one schema entry is marked, toggling the
  `collapsed` model.

- [ ] **Step 1: Write the failing test**

Append to `__tests__/form-collapse.test.ts`:

```ts
describe('collapse toggle', () => {
  it('is absent when no entry is marked', async () => {
    const [Form] = useTamanForm({
      schema: [{ component: TestInput, fieldName: 'a', label: 'A' }],
    });
    const wrapper = mount(Form);
    wrappers.push(wrapper);
    await flushPromises();

    expect(wrapper.find('.form-collapse-trigger').exists()).toBe(false);
  });

  it('toggles the marked entries and reports state via aria-expanded', async () => {
    const [Form] = useTamanForm({
      collapsed: true,
      schema: [
        { component: TestInput, fieldName: 'a', label: 'A' },
        { component: TestInput, collapsed: true, fieldName: 'b', label: 'B' },
      ],
    });
    const wrapper = mount(Form);
    wrappers.push(wrapper);
    await flushPromises();

    const trigger = wrapper.get('button.form-collapse-trigger');
    expect(trigger.attributes('aria-expanded')).toBe('false');
    expect(wrapper.findAll('[data-slot="form-item"]')[1]?.isVisible()).toBe(
      false,
    );

    await trigger.trigger('click');
    await flushPromises();

    expect(trigger.attributes('aria-expanded')).toBe('true');
    expect(wrapper.findAll('[data-slot="form-item"]')[1]?.isVisible()).toBe(
      true,
    );
  });
});
```

- [ ] **Step 2: Run it and confirm it fails**

Run: `pnpm vitest run --dom packages/@core/ui-kit/form-ui/__tests__/form-collapse.test.ts`
Expected: FAIL — no `.form-collapse-trigger` exists; the toggle is commented out.

- [ ] **Step 3: Render the toggle**

In `src/components/form-actions.vue`, remove the unused `TamanExpandableArrow`
import and the commented-out `VbenExpandableArrow` block, and add before the
`expand-after` slot:

```vue
<button
  v-if="hasCollapsibleFields"
  type="button"
  class="form-collapse-trigger text-sm color-primary cursor-pointer inline-flex gap-1 items-center"
  :aria-expanded="!collapsed"
  @click="collapsed = !collapsed"
>
  <span>{{ collapsed ? $t('expand') : $t('collapse') }}</span>
  <PIcon
    name="lucide:chevron-down"
    class="transition-transform"
    :class="{ 'rotate-180': !collapsed }"
  />
</button>
```

Add `import PIcon from 'pohon-ui/runtime/vue/components/Icon.vue';` and compute
the guard from the schema already available on `rootProps`:

```ts
const hasCollapsibleFields = computed(() =>
  (unref(rootProps).schema ?? []).some(
    (schema: { collapsed?: boolean }) => schema.collapsed === true,
  ),
);
```

`collapsed` is already the `defineModel` in this file, and `taman-use-form.vue`
already wires `:model-value="state?.collapsed"` with
`@update:model-value="handleUpdateCollapsed"`, so no plumbing changes are needed.

- [ ] **Step 4: Run the test and confirm it passes**

Run: `pnpm vitest run --dom packages/@core/ui-kit/form-ui/__tests__/form-collapse.test.ts`
Expected: PASS, 6 tests.

- [ ] **Step 5: Confirm `handleCollapsedChange` still fires**

Add to the same describe block:

```ts
it('invokes handleCollapsedChange', async () => {
  const onCollapsedChange = vi.fn();
  const [Form] = useTamanForm({
    collapsed: true,
    handleCollapsedChange: onCollapsedChange,
    schema: [
      { component: TestInput, fieldName: 'a', label: 'A' },
      { component: TestInput, collapsed: true, fieldName: 'b', label: 'B' },
    ],
  });
  const wrapper = mount(Form);
  wrappers.push(wrapper);
  await flushPromises();

  await wrapper.get('button.form-collapse-trigger').trigger('click');
  await flushPromises();

  expect(onCollapsedChange).toHaveBeenCalledWith(false);
});
```

Add `vi` to the `vitest` import. Run the file again; expected PASS, 7 tests.

- [ ] **Step 6: Verify**

Run: `pnpm vitest run --dom packages/@core/ui-kit/form-ui`

---

### Task 10: Add the group class hooks

This task resolves the remaining 3 baseline failures.

**Files:**
- Modify: `src/form-render/form-render-group.vue`
- Test: `__tests__/form-group.test.ts` (already written — do not change the assertions)

**Interfaces:**
- Consumes: nothing.
- Produces: the group renders `.form-group-header` on its header row,
  `.form-group-trigger` on the interactive element (a `<button>` when
  collapsible), and `.form-group-title` on the title span.

- [ ] **Step 1: Run the existing tests and read the failures**

Run: `pnpm vitest run --dom packages/@core/ui-kit/form-ui/__tests__/form-group.test.ts`
Expected: FAIL ×3 — `.form-group-title`, `button.form-group-trigger`, and
`.form-group-header` are not found. These tests were written against the
intended contract; treat them as the specification.

- [ ] **Step 2: Add the class hooks**

In `src/form-render/form-render-group.vue`, the header block becomes:

```vue
<div class="form-group-header mb-2 flex flex-1 gap-2 min-h-7 items-center">
  <component
    :is="shouldCollapsible ? 'button' : 'div'"
    class="form-group-trigger text-left flex flex-1 gap-2 min-w-0 items-center"
    :aria-expanded="shouldCollapsible ? collapseOpen : undefined"
    :class="
      [{
        'focus-visible:ring-ring cursor-pointer select-none rounded-sm outline-none focus-visible:ring-2':
          shouldCollapsible,
      }]
    "
    :type="shouldCollapsible ? 'button' : undefined"
  >
    <span
      class="rounded-full bg-primary flex-none h-3.5 w-[3px]"
    />
    <span
      v-if="props.schema.title"
      class="form-group-title text-sm leading-6 font-medium"
    >
      <TamanRenderContent :content="props.schema.title" />
    </span>

    <PIcon
      v-if="shouldCollapsible"
      name="lucide-chevron-down"
      class="color-text-muted flex-none transition-transform"
      :class="
        [
          {
            'rotate-180': collapseOpen,
          },
        ]
      "
    />
  </component>

  <div
    v-if="props.schema.extra"
    class="flex-none"
  >
    <TamanRenderContent :content="props.schema.extra" />
  </div>
</div>
```

The header stays a plain `<div>` with no click handler — only the inner
`.form-group-trigger` is interactive, and only when `collapsible !== false`.

Keep the surrounding `PCollapsible` wrapper exactly as it is today. The
`:class="{ hidden: props.hidden }"` binding on the `.form-group` root already
exists and is what Task 8's group-level `collapsed` flows through; do not
change it.

- [ ] **Step 3: Run the tests**

Run: `pnpm vitest run --dom packages/@core/ui-kit/form-ui/__tests__/form-group.test.ts`
Expected: PASS, 7 tests.

The third test clicks `.form-group-header` on a non-collapsible group and expects
the group to stay open. Because the header is a plain `div` with no handler when
`collapsible === false`, that assertion holds without extra code.

- [ ] **Step 4: Run the whole suite**

Run: `pnpm vitest run --dom packages/@core/ui-kit/form-ui`
Expected: **green**. This is the first point in the plan where the baseline
failures are fully resolved. If anything is still red, stop and fix before
continuing.

---

## Phase 5 — Behavior fixes

### Task 11: Simplify the validation loading state

**Files:**
- Create: `src/form.use-delayed-flag.ts`
- Modify: `src/form.runtime.ts` (add `useFieldValidating`)
- Modify: `src/form.types.ts` (`FormActions.useFieldValidating`)
- Modify: `src/form-render/form-render-form-field.vue` (remove `getValidationLoading`, the timer, and its `onUnmounted` cleanup)
- Test: `__tests__/form-validation-loading.test.ts` (create)

**Interfaces:**
- Consumes: nothing from Phase 4.
- Produces:
  - `useDelayedFlag(source: () => boolean, delayMs: number): ComputedRef<boolean>`
    in `src/form.use-delayed-flag.ts`
  - `FormActions.useFieldValidating(fieldName: string): ComputedRef<boolean>`

- [ ] **Step 1: Write the failing test**

Create `__tests__/form-validation-loading.test.ts`:

```ts
import { describe, expect, it, vi } from 'vitest';
import { effectScope, nextTick, ref } from 'vue';

import { useDelayedFlag } from '../src/form.use-delayed-flag';

describe('useDelayedFlag', () => {
  it('stays false until the source has been true for the full delay', async () => {
    vi.useFakeTimers();
    const scope = effectScope();
    const source = ref(false);
    let flag!: { value: boolean };

    scope.run(() => {
      flag = useDelayedFlag(() => source.value, 150);
    });

    source.value = true;
    await nextTick();
    expect(flag.value).toBe(false);

    vi.advanceTimersByTime(149);
    expect(flag.value).toBe(false);

    vi.advanceTimersByTime(1);
    await nextTick();
    expect(flag.value).toBe(true);

    scope.stop();
    vi.useRealTimers();
  });

  it('never flips for a source that settles before the delay', async () => {
    vi.useFakeTimers();
    const scope = effectScope();
    const source = ref(false);
    let flag!: { value: boolean };

    scope.run(() => {
      flag = useDelayedFlag(() => source.value, 150);
    });

    source.value = true;
    await nextTick();
    vi.advanceTimersByTime(100);
    source.value = false;
    await nextTick();
    vi.advanceTimersByTime(100);
    await nextTick();

    expect(flag.value).toBe(false);

    scope.stop();
    vi.useRealTimers();
  });

  it('drops to false immediately when the source goes false', async () => {
    vi.useFakeTimers();
    const scope = effectScope();
    const source = ref(false);
    let flag!: { value: boolean };

    scope.run(() => {
      flag = useDelayedFlag(() => source.value, 150);
    });

    source.value = true;
    await nextTick();
    vi.advanceTimersByTime(150);
    await nextTick();
    expect(flag.value).toBe(true);

    source.value = false;
    await nextTick();
    expect(flag.value).toBe(false);

    scope.stop();
    vi.useRealTimers();
  });
});
```

- [ ] **Step 2: Run it and confirm it fails**

Run: `pnpm vitest run --dom packages/@core/ui-kit/form-ui/__tests__/form-validation-loading.test.ts`
Expected: FAIL — `src/form.use-delayed-flag` does not exist.

- [ ] **Step 3: Implement the composable**

`src/form.use-delayed-flag.ts`:

```ts
import type { ComputedRef } from 'vue';

import { computed, onScopeDispose, ref, watch } from 'vue';

/**
 * Mirrors `source`, but only flips to `true` once it has stayed truthy for
 * `delayMs`. Falls back to `false` immediately.
 *
 * Used to keep fast async validators from flashing a spinner. Unlike the
 * previous inline implementation this never mutates reactive state during
 * render, so it is safe to read from a computed or a template.
 */
export function useDelayedFlag(
  source: () => boolean,
  delayMs: number,
): ComputedRef<boolean> {
  const settled = ref(false);
  let timer: ReturnType<typeof setTimeout> | undefined;

  function clear() {
    if (timer !== undefined) {
      clearTimeout(timer);
      timer = undefined;
    }
  }

  watch(
    source,
    (active) => {
      clear();
      if (!active) {
        settled.value = false;
        return;
      }
      timer = setTimeout(() => {
        settled.value = true;
        timer = undefined;
      }, delayMs);
    },
    { immediate: true },
  );

  onScopeDispose(clear);

  return computed(() => settled.value);
}
```

- [ ] **Step 4: Run the test and confirm it passes**

Run: `pnpm vitest run --dom packages/@core/ui-kit/form-ui/__tests__/form-validation-loading.test.ts`
Expected: PASS, 3 tests.

- [ ] **Step 5: Add `useFieldValidating` and wire the field**

In `src/form.runtime.ts`, beside the existing `useFieldError`:

```ts
function useFieldValidating(fieldName: string) {
  return computed(() =>
    Boolean(
      (
        Reflect.get(fieldMeta.value, fieldName) as
          | { isValidating?: boolean }
          | undefined
      )?.isValidating,
    ),
  );
}
```

Return it from the runtime object and declare it on `FormActions` in
`src/form.types.ts` as
`useFieldValidating: (fieldName: string) => ComputedRef<boolean>;`.

In `src/form-render/form-render-form-field.vue`, delete `validationLoading`,
`validationLoadingTimer`, `getValidationLoading`, and the `clearTimeout` line in
`onUnmounted`. Add near the other field-level state:

```ts
const isFieldValidating = formApi.useFieldValidating(fieldName);
const validationLoading = useDelayedFlag(
  () => isFieldValidating.value,
  VALIDATION_LOADING_DELAY_MS,
);
```

In `createComponentProps`, replace the `loading` line and delete the now-unused
`const isFieldValidating = slotProps.field.state.meta.isValidating;`:

```ts
    loading:
      Boolean(computedProps.value?.loading) || validationLoading.value,
```

- [ ] **Step 6: Verify**

Add to `__tests__/form-validation-loading.test.ts` an integration case using the
standard preamble, asserting a field with a slow async rule eventually receives
`loading`:

```ts
it('surfaces sustained async validation as the component loading prop', async () => {
  vi.useFakeTimers();
  const [Form, formApi] = useTamanForm({
    schema: [
      {
        component: TestInput,
        fieldName: 'name',
        label: 'Name',
        rules: z.string().refine(
          () => new Promise<boolean>((resolve) => setTimeout(() => resolve(true), 500)),
          { message: 'nope' },
        ),
      },
    ],
  });
  const wrapper = mount(Form);
  wrappers.push(wrapper);
  await flushPromises();

  void formApi.validate();
  await nextTick();
  vi.advanceTimersByTime(200);
  await nextTick();

  expect(wrapper.get('input').attributes('loading')).toBeDefined();

  vi.useRealTimers();
});
```

Run: `pnpm vitest run --dom packages/@core/ui-kit/form-ui`
Expected: green. If this integration case proves flaky against fake timers,
keep the three `useDelayedFlag` unit tests and drop it — the unit tests carry
the contract.

---

### Task 12: Let composite fields render their own messages

**Files:**
- Modify: `src/form-render/form-render-form-field.vue` (capture `issues`, expose in slot scope, honor `hideMessage`)
- Modify: `src/form.types.ts` (`hideMessage` on the field schema; `issues` on `TamanFormFieldSlotProps`)
- Test: `__tests__/form-composite-errors.test.ts` (create)

**Interfaces:**
- Consumes: nothing from Task 11.
- Produces: the per-field default slot scope gains
  `error: string | undefined` and `issues: Array<{ message: string; path: Array<PropertyKey> }>`.
  Field schemas gain `hideMessage?: boolean`.

- [ ] **Step 1: Write the failing test**

Create `__tests__/form-composite-errors.test.ts` with the standard preamble plus
`import { z } from 'zod';`, then:

```ts
describe('composite field errors', () => {
  const rules = z
    .array(z.string().optional())
    .length(2)
    .refine((v) => !!v[0], { message: 'Please select a type' })
    .refine((v) => !!v[1], { message: 'Please enter a phone number' });

  it('exposes error and issues to the field slot', async () => {
    const [Form, formApi] = useTamanForm({
      schema: [
        {
          component: TestInput,
          defaultValue: [undefined, ''],
          fieldName: 'phone',
          label: 'Phone',
          rules,
        },
      ],
    });
    const seen: Array<Record<string, unknown>> = [];
    const wrapper = mount(Form, {
      slots: {
        phone: (slotProps: Record<string, unknown>) => {
          seen.push(slotProps);
          return h('input');
        },
      },
    });
    wrappers.push(wrapper);
    await flushPromises();

    await formApi.validate();
    await flushPromises();

    const last = seen.at(-1);
    expect(last).toHaveProperty('error');
    expect(Array.isArray(last?.issues)).toBe(true);
    expect((last?.issues as Array<{ message: string }>).length).toBeGreaterThan(
      0,
    );
  });

  it('suppresses the field-level message when hideMessage is set', async () => {
    const [Form, formApi] = useTamanForm({
      schema: [
        {
          component: TestInput,
          defaultValue: [undefined, ''],
          fieldName: 'phone',
          hideMessage: true,
          label: 'Phone',
          rules,
        },
      ],
    });
    const wrapper = mount(Form);
    wrappers.push(wrapper);
    await flushPromises();

    await formApi.validate();
    await flushPromises();

    expect(wrapper.find('[data-slot="form-message"]').exists()).toBe(false);
  });

  it('still renders the message by default', async () => {
    const [Form, formApi] = useTamanForm({
      schema: [
        {
          component: TestInput,
          defaultValue: [undefined, ''],
          fieldName: 'phone',
          label: 'Phone',
          rules,
        },
      ],
    });
    const wrapper = mount(Form);
    wrappers.push(wrapper);
    await flushPromises();

    await formApi.validate();
    await flushPromises();

    expect(wrapper.find('[data-slot="form-message"]').exists()).toBe(true);
  });
});
```

- [ ] **Step 2: Run it and confirm it fails**

Run: `pnpm vitest run --dom packages/@core/ui-kit/form-ui/__tests__/form-composite-errors.test.ts`
Expected: FAIL — the slot scope has no `issues`, and `hideMessage` is not a
schema key so the message still renders.

- [ ] **Step 3: Capture the issues**

In `src/form-render/form-render-form-field.vue`, add beside the other field
state:

```ts
const fieldIssues = shallowRef<
  Array<{ message: string; path: Array<PropertyKey> }>
>([]);
```

Add `shallowRef` to the `vue` import. In `validateFieldValue`, record them
before returning — the returned value is unchanged, so `FormMessage` behavior
is untouched:

```ts
  const result = await activeRules.safeParseAsync(value);
  if (result.success) {
    fieldIssues.value = [];
    return;
  }
  fieldIssues.value = result.error.issues.map((issue) => ({
    message: issue.message,
    path: [...issue.path],
  }));
  return result.error.issues[0]?.message;
```

In the string-rule branch, set `fieldIssues.value = []` on success and
`fieldIssues.value = [{ message: result, path: [] }]` when the validator returns
a message.

Extend `createFieldSlotScope`:

```ts
function createFieldSlotScope(slotProps: RuntimeFieldSlotProps) {
  return {
    ...createFieldSlotProps(slotProps),
    componentProps: createComponentProps(slotProps),
    disabled: shouldDisabled.value,
    error: error.value,
    isInValid: isInValid.value,
    issues: fieldIssues.value,
    modelValue: fieldValue.value,
    name: fieldName,
  };
}
```

- [ ] **Step 4: Honor `hideMessage`**

Add `hideMessage` to the destructured props, add it to the field schema body in
`src/form.types.ts`:

```ts
  /**
   * Suppress the field-level validation message.
   * Use when a composite component renders its own messages per sub-control.
   * @default false
   */
  hideMessage?: boolean;
```

and guard the message block in the template:

```vue
<Transition
  v-if="!compact && !hideMessage"
  enter-active-class="duration-250 ease-emphasized"
  leave-active-class="duration-250 ease-emphasized"
  enter-from-class="opacity-0 -translate-y-15px"
  leave-to-class="opacity-0 -translate-y-15px"
>
  <FormMessage class="absolute" />
</Transition>
```

Also add `error` and `issues` to `TamanFormFieldSlotProps` in
`src/form.types.ts`.

- [ ] **Step 5: Run the test and confirm it passes**

Run: `pnpm vitest run --dom packages/@core/ui-kit/form-ui/__tests__/form-composite-errors.test.ts`
Expected: PASS, 3 tests.

- [ ] **Step 6: Verify the diagnosis in the browser**

Before relying on this for `custom.vue`, confirm the original symptom and the
fix by hand:

```bash
pnpm dev:better-auth-front
```

Open the Custom form example, choose a phone type, then type a partial number.
Confirm the message now sits under the input rather than the select. If the root
cause turns out to differ from the `absolute`-positioning diagnosis in the spec,
stop and report rather than adapting the fix to fit.

---

### Task 13: Add a form-level `disabled`

**Files:**
- Modify: `src/form.types.ts` (`disabled` on `FormRenderProps`)
- Modify: `src/form-render/form-render-form-field.vue` (`shouldDisabled`)
- Modify: `src/components/form-actions.vue`
- Test: `__tests__/form-disabled.test.ts` (create)

**Interfaces:**
- Consumes: Task 9's action markup.
- Produces: `FormRenderProps.disabled?: boolean`, disabling every field plus
  the submit and reset buttons. `commonConfig.disabled` keeps its field-only
  meaning.

- [ ] **Step 1: Write the failing test**

Create `__tests__/form-disabled.test.ts` with the standard preamble, then:

```ts
describe('form-level disabled', () => {
  it('disables fields and both action buttons', async () => {
    const [Form] = useTamanForm({
      disabled: true,
      schema: [{ component: TestInput, fieldName: 'name', label: 'Name' }],
    });
    const wrapper = mount(Form);
    wrappers.push(wrapper);
    await flushPromises();

    expect(wrapper.get('input').attributes('disabled')).toBeDefined();
    for (const button of wrapper.findAll('button')) {
      expect(button.attributes('disabled')).toBeDefined();
    }
  });

  it('leaves action buttons enabled for commonConfig.disabled', async () => {
    const [Form] = useTamanForm({
      commonConfig: { disabled: true },
      schema: [{ component: TestInput, fieldName: 'name', label: 'Name' }],
    });
    const wrapper = mount(Form);
    wrappers.push(wrapper);
    await flushPromises();

    expect(wrapper.get('input').attributes('disabled')).toBeDefined();
    expect(
      wrapper.findAll('button').some((b) => b.attributes('disabled') === undefined),
    ).toBe(true);
  });

  it('enables everything when disabled is false', async () => {
    const [Form] = useTamanForm({
      disabled: false,
      schema: [{ component: TestInput, fieldName: 'name', label: 'Name' }],
    });
    const wrapper = mount(Form);
    wrappers.push(wrapper);
    await flushPromises();

    expect(wrapper.get('input').attributes('disabled')).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run it and confirm it fails**

Run: `pnpm vitest run --dom packages/@core/ui-kit/form-ui/__tests__/form-disabled.test.ts`
Expected: FAIL — `disabled` is not a form-level prop, so the input is enabled.

- [ ] **Step 3: Add the prop**

In `src/form.types.ts`, add to `FormRenderProps`:

```ts
  /**
   * Disable the whole form: every field plus the submit and reset buttons.
   * Distinct from `commonConfig.disabled`, which only disables fields.
   * @default false
   */
  disabled?: boolean;
```

In `src/form-render/form-render-form-field.vue`:

```ts
const shouldDisabled = computed(() => {
  return Boolean(
    formRenderProps.disabled
    || isDisabled.value
    || disabled
    || computedProps.value?.disabled,
  );
});
```

In `src/components/form-actions.vue`, fold it into the existing busy guard:

```ts
const isFormDisabled = computed(() => Boolean(unref(rootProps).disabled));
```

and bind on both buttons:

```vue
:disabled="isFormDisabled || isFormBusy || Boolean(submitButtonOptions.disabled)"
```

```vue
:disabled="isFormDisabled || Boolean(resetButtonOptions.disabled)"
```

- [ ] **Step 4: Run the test and confirm it passes**

Run: `pnpm vitest run --dom packages/@core/ui-kit/form-ui/__tests__/form-disabled.test.ts`
Expected: PASS, 3 tests.

- [ ] **Step 5: Run the whole suite**

Run: `pnpm vitest run --dom packages/@core/ui-kit/form-ui` and `pnpm check:type`
Expected: green and clean.

---

## Phase 6 — Playground

### Task 14: Migrate the playground off removed APIs

**Files:**
- Modify: `apps/better-auth-front/src/views/examples/form/custom.vue`
- Modify: `apps/better-auth-front/src/views/examples/form/api.vue`
- Modify: `apps/better-auth-front/src/views/examples/form/modules/two-fields.vue`
- Verify: every other file under `views/examples/form/`

**Interfaces:**
- Consumes: Tasks 1-13.
- Produces: no playground file references a removed API.

- [ ] **Step 1: Confirm what is left**

Run:
```bash
grep -rn "layout:\|labelWidth\|colon\|fieldMappingTime\|valueFormat\|arrayToStringFields\|showCollapseButton\|collapsedRows\|resetForm\|submitForm\|resetValidate\|validateAndSubmitForm" apps/better-auth-front/src/views/examples/form
```
Expected after Tasks 1-13: only `custom.vue:57` if you deferred it.

- [ ] **Step 2: Finish `custom.vue`**

Remove `fieldMappingTime: [['field4', ['phoneType', 'phoneNumber'], null]],`
(line 57) — the `codec` above it already performs that mapping — and
`labelClass: 'w-2/6'` (line 55), which sized the label for a horizontal grid.

- [ ] **Step 3: Give `TwoFields` its own messages**

Set `hideMessage: true` on the `field4` schema entry, and render the messages
inside the composite. In `modules/two-fields.vue`, accept the issues and place
each under the sub-control its path points at:

```vue
<script lang="ts" setup>
import { computed } from 'vue';

const props = defineProps<{
  issues?: Array<{ message: string; path: Array<PropertyKey> }>;
}>();

const modelValue = defineModel<
  [string | undefined, string | undefined]
>({
  default: () => [undefined, undefined],
});

const typeValue = computed({
  get: () => modelValue.value[0],
  set: (value) => {
    modelValue.value = [value, modelValue.value[1]];
  },
});

const phoneValue = computed({
  get: () => modelValue.value[1],
  set: (value) => {
    modelValue.value = [modelValue.value[0], value];
  },
});

// Refinements on the whole array carry an empty path, so fall back to matching
// on which half is actually missing.
const typeError = computed(() =>
  typeValue.value
    ? undefined
    : props.issues?.find((issue) => issue.path[0] === 0 || issue.path.length === 0)
        ?.message,
);

const phoneError = computed(() =>
  typeValue.value
    ? props.issues?.find(
        (issue) => issue.path[0] === 1 || issue.path.length === 0,
      )?.message
    : undefined,
);
</script>

<template>
  <div class="flex flex-col gap-1 w-full">
    <div class="flex gap-1 w-full">
      <PSelect
        v-model="typeValue"
        class="w-20"
        placeholder="Type"
        :items="[
          { label: 'Personal', value: 'personal' },
          { label: 'Work', value: 'work' },
          { label: 'Private', value: 'private' },
        ]"
      />
      <PInput
        v-model="phoneValue"
        placeholder="Enter 11-digit phone number"
        class="flex-1"
        :maxlength="11"
        type="tel"
      />
    </div>

    <div class="flex gap-1 text-xs color-error">
      <span class="w-20">{{ typeError }}</span>
      <span class="flex-1">{{ phoneError }}</span>
    </div>
  </div>
</template>
```

Pass `issues` through from the schema's slot in `custom.vue` using the per-field
slot the form already delegates:

```vue
<Form>
  <template #field4="slotProps">
    <TwoFields
      v-model="slotProps.modelValue"
      :issues="slotProps.issues"
      @update:model-value="slotProps.componentField['onUpdate:modelValue']"
    />
  </template>
</Form>
```

- [ ] **Step 4: Finish `api.vue`**

Replace the `disabled` case with the new top-level prop:

```ts
    case 'disabled': {
      formApi.setState({ disabled: true });
      break;
    }
    case 'resetDisabled': {
      formApi.setState({ disabled: false });
      break;
    }
```

and remove the `labelWidth` / `resetLabelWidth` cases, their buttons, and those
two members of the `action` union type.

- [ ] **Step 5: Run the app and click through**

```bash
pnpm dev:better-auth-front
```

Visit every route under the form examples group and confirm no console errors
and no deprecation warnings.

- [ ] **Step 6: Verify**

Run: `pnpm check:type`
Expected: clean.

---

### Task 15: Demonstrate the undemonstrated features

Ten playground examples currently demonstrate none of: per-field `collapsible`,
form-level `collapsed`, `compact`, `submitOnChange`, `submitOnEnter`,
`actionLayout`, `actionPosition`, `hideRequiredMark`, `emptyStateValue`, or the
new `disabled`.

**Files:**
- Modify: `apps/better-auth-front/src/views/examples/form/collapsible.vue`
- Modify: `apps/better-auth-front/src/views/examples/form/all-fields.vue`
- Modify: `apps/better-auth-front/src/views/examples/form/api.vue`
- Modify: `apps/better-auth-front/src/views/examples/form/rules.vue`
- Modify: `apps/better-auth-front/src/views/examples/form/dynamic.vue`

**Interfaces:**
- Consumes: every prior task.
- Produces: no new exports — playground only.

- [ ] **Step 1: Add both collapse modes to `collapsible.vue`**

Add a second `AppCard` above the existing group example, using a form whose
schema marks two entries:

```ts
const [CollapseForm] = useTamanForm({
  collapsed: true,
  schema: [
    { component: 'Input', fieldName: 'keyword', label: 'Keyword' },
    { component: 'Input', fieldName: 'status', label: 'Status' },
    { component: 'Input', collapsed: true, fieldName: 'owner', label: 'Owner' },
    {
      collapsed: true,
      component: 'Input',
      fieldName: 'createdAt',
      label: 'Created At',
    },
  ],
  wrapperClass: 'grid-cols-1 md:grid-cols-2',
});
```

Add a third `AppCard` demonstrating per-field `collapsible`:

```ts
const [FieldCollapseForm] = useTamanForm({
  schema: [
    {
      collapsible: true,
      component: 'Textarea',
      defaultCollapsed: true,
      fieldName: 'notes',
      label: 'Notes',
    },
  ],
});
```

Update the page `description` to mention all three collapse mechanisms.

- [ ] **Step 2: Add `compact` and `hideRequiredMark` to `all-fields.vue`**

Add `compact: true` and `commonConfig: { hideRequiredMark: true }` to a second
form on the page, with a short paragraph explaining that `compact` removes the
space reserved under each field for its validation message.

- [ ] **Step 3: Add `actionLayout` / `actionPosition` to `api.vue`**

Add cases to `handleClick` and their buttons:

```ts
    case 'actionCenter': {
      formApi.setState({ actionPosition: 'center' });
      break;
    }
    case 'actionNewLine': {
      formApi.setState({ actionLayout: 'newLine' });
      break;
    }
```

adding `'actionCenter' | 'actionNewLine'` to the `action` union.

- [ ] **Step 4: Add an async rule to `rules.vue`**

```ts
{
  component: 'Input',
  fieldName: 'username',
  label: 'Username (async)',
  rules: z.string().min(1).refine(
    async (value) => {
      await new Promise((resolve) => setTimeout(resolve, 800));
      return value !== 'taken';
    },
    { message: 'That username is taken' },
  ),
},
```

Note in the page copy that the spinner appears only after 150 ms, so fast
validators never flash.

- [ ] **Step 5: Add `submitOnChange` to `dynamic.vue`**

Add `submitOnChange: true` to the existing form and a line of copy explaining
that the form submits as values change, debounced by `changeDebouncedTime`.

- [ ] **Step 6: Final verification**

Run:
```bash
pnpm vitest run --dom packages/@core/ui-kit/form-ui
pnpm check:type
pnpm dev:better-auth-front
```

Expected: suite green, typecheck clean, every form example route renders with no
console errors or warnings. **Do not commit.** Report the full diff for review.

---

## Self-Review

**Spec coverage**

| Spec section | Task |
| --- | --- |
| A1 per-field collapsible opt-in | 7 |
| A2 vertical-only layout | 5 |
| A3 asterisk pseudo-element | 6 |
| A4 remove colon | 6 |
| B1 per-field `collapsed` | 8 |
| B2 delete measuring machinery | 8 |
| B3 implement toggle | 9 |
| B4 vxe-table option strip | 8 step 6 |
| C1 runtime deprecations | 1, 2, 3, 4 |
| C2 type deprecations | 1, 2, 3, 4 |
| C3 call sites | 1 step 5, 2 step 5, 14 |
| D1 validation loading | 11 |
| D2 composite errors | 12 |
| D3 top-level disabled | 13 |
| E1 unit tests | every task |
| E2 playground | 14, 15 |
| Baseline `form-group` failures | 10 |

No spec section is unassigned.

**Known risks**

- Task 7 relies on Vue compiling slot content in the parent's scope, so
  `ref="fieldComponentRef"` still registers on the field component through the
  `FormRenderFieldCollapsible` wrapper. `form-api.test.ts`'s componentRef and
  scroll-to-error cases are the check; the task carries a duplication fallback
  if the assumption turns out wrong.
- Task 11's integration case depends on fake timers interacting with TanStack's
  async validators. If it proves flaky, the three `useDelayedFlag` unit tests
  carry the contract; drop the integration case rather than weakening it.
- Task 12 rests on a diagnosis made by reading CSS, not a confirmed repro. Step 6
  verifies it in a browser *before* the fix is trusted. If the cause differs,
  stop and report.
