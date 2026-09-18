# Form UI Refactor — Design

Date: 2026-09-18
Package: `packages/@core/ui-kit/form-ui`
Playground: `apps/better-auth-front/src/views/examples/form`
Branch: `feature/v1`

## Problem

The form UI has accumulated three kinds of debt:

1. **Unconditional DOM.** Every field is wrapped in `<PCollapsible>` even though
   collapsing is opt-in, and the label renders a `<span>` purely to draw an
   asterisk.
2. **Implicit behavior.** Form-level collapsing measures grid rows at runtime and
   decides for itself which fields to hide. The author cannot express intent.
3. **A deprecated surface that never got removed.** Four method aliases, a whole
   legacy value-transform pipeline, legacy dependency callbacks, and a deprecated
   rule-registration option all still ship, warn at runtime, and carry tests —
   three of which are currently failing.

Alongside these, four smaller defects: horizontal layout complicates every label
code path for no consumer benefit, composite fields anchor their error message
under the wrong sub-control, the async-validation loading flag mutates reactive
state during render, and disabling a form leaves its action buttons live.

## Baseline

`pnpm vitest run --dom packages/@core/ui-kit/form-ui` → **6 failing tests**:

| Test | Cause |
| --- | --- |
| `form-api` › formats child schema values inside array fields | deprecated `valueFormat` path |
| `form-value-transform` › formats array children with row and root paths | deprecated `valueFormat` path |
| `form-integration` › does not expose raw values through native form submit events | deprecated `valueFormat` path |
| `form-group` › renders grouped fields as regular form fields | asserts `.form-group-title`, not rendered |
| `form-group` › toggles the group from its header and honors defaultCollapsed | asserts `.form-group-trigger`, not rendered |
| `form-group` › keeps a non-collapsible group open despite defaultCollapsed | asserts `.form-group-header`, not rendered |

The first three are deleted with the deprecated path. The last three are fixed by
adding the class hooks those tests already expect.

**Exit criterion:** the whole form-ui suite green, plus `pnpm check:type`.

## Decisions

These were settled with the user before design and are not open for
re-litigation during implementation:

| Question | Decision |
| --- | --- |
| Deprecation scope | Delete the deprecated APIs entirely. Breaking is acceptable on `feature/v1`. |
| Layout | Drop the `layout` prop entirely and delete the label-width machinery. |
| Collapse API | Per-field `collapsed: true` flag on a single flat schema. |
| Schema-driven typings | **Out of scope.** Deferred to its own spec. |
| Composite field errors | The composite renders its own message. |
| Disabling a form | New top-level `disabled` covering fields *and* action buttons. |
| Asterisk | `after:` pseudo-element, matching `descriptions-cell.vue`'s `COLON_CLASS`. |
| vxe-table | Not migrated — the user is deleting those files. Strip invalid options only. |

## Section A — Rendering and layout

### A1. Per-field collapsible becomes opt-in

`form-render-form-field.vue` currently wraps every control in `<PCollapsible>`
regardless of the `collapsible` prop.

Extract the control block (`FormControl` + default slot + suffix) into a new
`form-render-field-control.vue`. The field then renders:

```vue
<PCollapsible v-if="collapsible" v-model:open="collapseOpen">
  <template #content><FieldControl … /></template>
</PCollapsible>
<FieldControl v-else … />
```

No markup duplication, and it reduces `form-render-form-field.vue` from 599
lines. Also removes the dead `/* && isVertical.value */` in `shouldCollapsible`.

### A2. Vertical-only layout

Delete:

- `FormLayout` type; the `layout` prop on `FormRenderProps` and `TamanFormProps`;
  its defaults in `form.api.ts:121` and `taman-form.vue:25`
- `isVertical` from `form-render.context.ts` (`useFormContext` then returns only
  `componentMap` and `componentBindEventMap`)
- `form-render.utils.ts` in full: `useFormLabelWidth`, `useFieldLabelWidth`,
  `formResolveLabelStyle`, `FormResolveLabelStyleInput`
- `FormLabelWidthContext` from `form.types.ts`
- `commonConfig.labelWidth` and schema-level `labelWidth`
- `__tests__/label-width.test.ts`

`FormItem` becomes unconditionally `flex-col`. `form-render-form.vue`'s
`getWrapperClass` loses its inline branch. `form-actions.vue` loses both layout
branches (`self-end` and `w-full` become unconditional).

`labelClass` **stays** — it is a general styling passthrough, not layout
machinery. Only its width-derivation logic goes.

Call sites to migrate (remove `layout:`): `custom.vue`, `all-fields.vue`,
`api.vue`, `custom-layout.vue`, `merge.vue` (×2), `dynamic.vue`, `rules.vue`,
`dept/modules/form.vue`, `auth-login.vue`, `auth-register.vue`,
`base-setting.vue`, `password-setting.vue`, `form-api.test.ts`.

`descriptions.vue` has an unrelated `layout` prop of its own — leave it alone.

### A3. Asterisk via pseudo-element

In `form-render-form-label.vue`, delete the `<span v-if="required">*</span>` and
apply to the `FormLabel` root when required:

```
after:content-['*'] after:color-error after:ml-0.5 after:order-1
```

`FormLabel` is already `flex items-center`, so the pseudo-element is a flex item.
Give the help tooltip `order-2` and the colon span `order-3` so the asterisk
sits immediately right of the label text rather than after them. Rendered order:
`Name * ⓘ :` — preserving today's help-before-colon relationship.

`hideRequiredMark` continues to suppress it, now by omitting the class.

## Section B — Collapse API

### B1. Per-field flag

Add `collapsed?: boolean` to both field and group schemas — a group can belong to
the collapsed set too. Semantics: the entry is hidden while the form is in its
collapsed state.

Note the deliberate name overlap: `FormRenderProps.collapsed` is *form state*
("is the form collapsed right now"), while schema `collapsed` is *membership*
("hide this when collapsed"). Both are documented.

### B2. Delete the measuring machinery

Delete `form-render.expandable.ts` entirely, and with it:

- `collapsedRows` and `showCollapseButton` props
- the `getComputedStyle` / `grid-template-rows` arithmetic
- the `useBreakpoints` and `useElementVisibility` dependencies
- `keepFormItemIndex`, `isCalculated`, `rowMapping`, and the `wrapperRef` that
  existed only for measurement

In `form-render-form.vue`, per-entry `hidden` becomes
`entry.collapsed === true && props.collapsed`.

Toggle visibility is derived, not configured: show the toggle iff at least one
top-level entry is marked `collapsed`. `showCollapseButton` therefore disappears
from the public API.

Retained: form-level `collapsed` state, `handleCollapsedChange`,
`collapseTriggerResize`.

### B3. Implement the toggle button

The collapse toggle **does not currently exist** — it is commented out in
`form-actions.vue` behind `<!-- TODO: how should we implement this? -->`,
referencing the old `VbenExpandableArrow`. Implement it with
`TamanExpandableArrow`, which that file already imports but never uses. Without
this the feature has no UI at all.

### B4. vxe-table

`use-vxe-grid.vue:145,370` and `vxe-table/form.vue:70` pass `showCollapseButton`
and `collapseTriggerResize`. These files are being deleted by the user, so they
get no collapsed-set migration — just strip the now-invalid options so the repo
typechecks.

## Section C — Deprecation removal

### C1. Runtime

| Removed | Replacement |
| --- | --- |
| `formApi.resetForm()` | `formApi.reset()` |
| `formApi.resetValidate()` | `formApi.clearValidation()` |
| `formApi.submitForm()` | `formApi.submit()` |
| `formApi.validateAndSubmitForm()` | `formApi.validateAndSubmit()` |
| `schema.valueFormat`, `fieldMappingTime`, `arrayToStringFields` | form-level `codec` |
| legacy `dependencies.{componentProps,disabled,if,required,rules,show,trigger}` | `dependencies.resolve` |
| `setupTamanForm({ defineRules })` | `setupTamanForm({ rules })` |

The aliases exist in **both** `form.api.ts` and `form.runtime.ts` — remove from
both. `form.value-transform.ts` is deleted outright, along with the
deprecated-transform scan in `form.api.ts:753-772`. `form.deprecation.ts`
(`warnDeprecatedOnce`, `resetDeprecationWarnings`) is then unreferenced and goes
too.

### C2. Types

Remove from `form.types.ts`: `FormContextApi` alias, `FormValueFormat`,
`FormFieldMappingTime`, `ArrayToStringFields`, `FormActions.resetForm`,
`FormActions.submitForm`, and the deprecated members of `FormItemDependencies`.
Remove the corresponding re-exports from `src/index.ts`.

### C3. Call sites

- `scroll-to-error-test.vue` — `resetForm()`, `validateAndSubmitForm()`, and the
  explanatory copy naming them
- `custom.vue:57` — `fieldMappingTime`, already redundant since that form has a
  `codec` doing the same job

## Section D — Behavior fixes

### D1. Validation loading state

`getValidationLoading()` mutates a `ref` **during render** — it is called from
`v-bind="createComponentProps(slotProps)"` — and hand-rolls a `setTimeout` with
manual `onUnmounted` cleanup.

Replace with two pieces:

1. `useFieldValidating(fieldName)` on the form API, mirroring the existing
   `useFieldError`. The plumbing already exists: `form.runtime.ts` holds a
   `fieldMeta` selector, and each field's `isValidating` is reliable (the file's
   own comment notes only the *form-level* flag is not).
2. `useDelayedFlag(source, delayMs)` — a standalone composable that goes `true`
   only after `source` stays truthy for `delayMs`, and `false` immediately.

This removes render-time reactive mutation and the manual timer, and makes the
debounce unit-testable in isolation. The 150 ms flash-prevention behavior is
preserved.

### D2. Composite field error placement

A composite field (`custom.vue:98-106` — one `fieldName`, a `PSelect` and a
`PInput`) gets one `FormMessage`, absolutely positioned at its static position,
which puts it under the *left* of the control area — i.e. under the select, even
when the failing rule concerns the phone input.

Fix by letting the composite own its message:

- Expose `error` and the raw zod `issues` array in the field slot scope.
  `validateFieldValue` keeps returning `issues[0].message` so `FormMessage`
  behavior is unchanged; the full array is additionally stashed in a
  field-local `shallowRef` and surfaced through the slot.
- Add schema `hideMessage?: boolean` to suppress the field-level `FormMessage`.

`TwoFields` in the playground then renders its own message under the sub-control
the issue's `path` points at.

### D3. Top-level `disabled`

Add `disabled?: boolean` to `TamanFormProps` / `FormRenderProps`. It folds into
`shouldDisabled` for every field and disables submit and reset in
`form-actions.vue`.

`commonConfig.disabled` keeps its current field-only meaning, so no existing
consumer changes behavior.

## Section E — Tests and playground

### E1. Unit tests

TDD: each behavior above gets its test before its implementation.

New:

- `form-layout.test.ts` — vertical-only rendering, no label-width styles
- `form-label.test.ts` — asterisk pseudo-class applied/suppressed, ordering
- `form-collapse.test.ts` — `collapsed: true` entries hide and show; toggle
  appears only when some entry is marked; groups can be marked too
- `form-field-collapsible.test.ts` — no `PCollapsible` unless `collapsible` is set
- `form-validation-loading.test.ts` — `useDelayedFlag` in isolation, plus a field
  integration case
- `form-disabled.test.ts` — top-level `disabled` reaches fields and both buttons
- `form-composite-errors.test.ts` — `issues` in slot scope, `hideMessage`

Fixed: the three `form-group.test.ts` failures, by adding the
`.form-group-title` / `.form-group-trigger` / `.form-group-header` hooks those
tests already assert.

Deleted: `form-compatibility.test.ts`, `form-value-transform.test.ts`,
`label-width.test.ts`. Deprecated cases pruned from `form-api.test.ts`,
`form-integration.test.ts`, `form-types.test.ts`.

### E2. Playground coverage

Audit of all 10 examples found these features demonstrated **nowhere**: per-field
`collapsible`, form-level `collapsed`, `compact`, `submitOnChange`,
`submitOnEnter`, `actionLayout`, `actionPosition`, `hideRequiredMark`,
`emptyStateValue`, and the new `disabled`.

| File | Change |
| --- | --- |
| `collapsible.vue` | Add both collapse modes: per-field `collapsible`, and form-level `collapsed: true` with the toggle |
| `api.vue` | Drop `layout`/`labelWidth` demos; add `disabled`, `actionLayout`, `actionPosition` |
| `all-fields.vue` | Add `compact`, `hideRequiredMark`, `emptyStateValue` |
| `rules.vue` | Add an async validator showing the loading state |
| `custom.vue` | Composite messages via `issues` + `hideMessage`; drop `fieldMappingTime` |
| `dynamic.vue` | Add `submitOnChange` / `submitOnEnter` |
| `scroll-to-error-test.vue` | Migrate off the removed method aliases |

## Order of work

1. Deprecation removal (Section C) — deletes code and three failing tests,
   shrinking the surface everything else touches
2. Vertical-only layout (A2, A3)
3. Per-field collapsible opt-in (A1)
4. Collapse API and toggle (Section B)
5. Behavior fixes (Section D)
6. Playground (E2)

Sections C and A2 are the widest-reaching; landing them first means later
sections work against the smaller surface. Tests are written per-section, not
batched at the end.

## Out of scope

- **Schema-driven typings.** Inferring `TFormValues` from the schema array's
  `fieldName` + zod `rules`, and typing `getFieldComponentRef` from the
  component registry. Deferred to its own spec by explicit decision; it needs a
  `const` type parameter and group recursion, and is orthogonal to everything
  here.
- **vxe-table migration.** Those files are being deleted.
