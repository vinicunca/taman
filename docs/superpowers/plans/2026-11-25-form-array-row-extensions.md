# Array Field Row Extensions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give taman-ui's `type: 'array'` form field per-row extensions (`rowExtra`, `rowActions`, `rowRemovable`, `addButtonProps`), a row-aware child `suffix`, and make child render callbacks actually receive `row` / `rootValues`.

**Architecture:** `form-field-array.vue` builds one row context per row (`index`, `rowPath`, and lazy getters for `row` and `rootValues` backed by `useSelector` refs and a per-row `computed`), so a callback only tracks the state it reads. Child schemas get that context through a new `rowContext` option on `createArrayChildSchema`. Row-level render callbacks render through a small child component that owns its own render effect, so one row's change does not re-run other rows' callbacks.

**Tech Stack:** Vue 3.5 SFCs (`<script setup lang="ts">`), TanStack Vue Form, pohon-ui `PButton`, Vitest + @vue/test-utils (jsdom), changesets.

**Spec:** `docs/superpowers/specs/2026-11-25-form-array-row-extensions-design.md`

## Global Constraints

- Every new option is optional; with none set, array fields render exactly as today (same classes, same `grid-template-columns`, same element count). The existing `form-field-array-sortable.test.ts` must keep passing unchanged.
- Row context must stay scoped to its own row: a change to row N must not re-run row M's callbacks (spec anti-goal).
- Package: `@vinicunca/taman-ui`, sources under `packages/taman-ui/src/form`.
- Do not publish, push, or bump any version; the changeset is the only release artifact.
- Commit messages end with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- Commands (run from repo root `/Users/polengmini/Dev/@vinicunca/taman`):
  - Test: `pnpm vitest run packages/taman-ui/src/form/__tests__/<file>`
  - All form tests: `pnpm vitest run packages/taman-ui/src/form`
  - Typecheck: `(cd packages/taman-ui && pnpm exec vue-tsc --noEmit -p tsconfig.json)` — passes with no output today.
  - Lint: `pnpm eslint packages/taman-ui/src/form docs/superpowers`

## Review Focus

1. **Editing one row re-runs other rows' callbacks** (anti-goal). Expected: only the edited row's `rowExtra` / child `componentProps` run again. Pinned by "re-runs callbacks only for the changed row" tests in Task 1 and Task 2.
2. **Removing a row shifts indexes.** Expected: after removing row 0, row 0's extra shows the old row 1's values, and the row count of extras drops by one. Pinned in Task 2.
3. **Rows with different action widths misalign columns.** Each row is its own grid today; an `auto` action column per row would size differently per row. Expected: one shared action-column width for header and all rows. Pinned in Task 2 (shared container grid + `subgrid` rows).
4. **`addButtonProps.disabled: false` re-enabling the add button past `max`.** Expected: `max` and field `disabled` still win. Pinned in Task 2.
5. **Top-level (non-array) `suffix` functions.** The `suffix` type now takes a context; a top-level `suffix: () => 'kg'` must still render. Pinned in Task 1.

---

### Task 1: Row context reaches child render callbacks (incl. `suffix`)

**Files:**
- Modify: `packages/taman-ui/src/form/form.types.ts` (new `TamanFormFieldArrayRowContext`; `suffix` type in `FormSchemaBody`; new props + missing `rowKey` on the generic `TamanFormFieldArrayProps`)
- Modify: `packages/taman-ui/src/form/index.ts` (export the new type)
- Modify: `packages/taman-ui/src/form/components/form-field-array.types.ts` (same new props, non-generic)
- Modify: `packages/taman-ui/src/form/form-render/form-render.schema.ts` (`rowContext` option, context-building wrapper, wrap `suffix`)
- Modify: `packages/taman-ui/src/form/form-render/form-render-form-field.vue` (`computedSuffix`)
- Modify: `packages/taman-ui/src/form/components/form-field-array.vue` (build row contexts, pass to child schemas)
- Test: `packages/taman-ui/src/form/__tests__/form-schema.test.ts` (unit)
- Create test: `packages/taman-ui/src/form/__tests__/form-field-array-row-extensions.test.ts`

**Interfaces:**
- Produces (in `form.types.ts`, exported from `form/index.ts`):
  ```ts
  export interface TamanFormFieldArrayRowContext<TValues extends FormValues = FormValues> {
    index: number;
    row: Record<string, any>;   // current values of this row, read lazily
    rowPath: string;            // e.g. 'portfolio[2]'
    rootValues: Readonly<TValues>;
  }
  ```
- Produces new optional props on both `TamanFormFieldArrayProps` (generic one in `form.types.ts` uses `TamanFormFieldArrayRowContext<TValues>`; the component one in `form-field-array.types.ts` uses the default):
  ```ts
  addButtonProps?: ButtonProps;                     // from 'pohon-ui'
  rowActions?: (ctx: TamanFormFieldArrayRowContext) => TamanRenderContentType | null | undefined;
  rowExtra?: (ctx: TamanFormFieldArrayRowContext) => TamanRenderContentType | null | undefined;
  rowRemovable?: (ctx: TamanFormFieldArrayRowContext) => boolean;
  ```
  `TamanRenderContentType` comes from `src/components/render-content/render-content.types.ts`. Also add `rowKey?: string` (with the component file's JSDoc) to the generic interface — it is documented and exists on the component props but is missing there, so `arrayProps: { rowKey }` fails to typecheck for typed consumers. Task 1 only declares `rowExtra` / `rowActions` / `rowRemovable` / `addButtonProps`; Task 2 implements them.
- Produces in `form-render.schema.ts`: `CreateArrayChildSchemaOptions.rowContext?: Pick<TamanFormFieldArrayRowContext, 'row' | 'rootValues'>`.
- Produces in `form-field-array.vue`: a `data-array-row-index` attribute on every row; `rowContexts: ComputedRef<Array<TamanFormFieldArrayRowContext>>` (one per row, rebuilt only when `arrayLength` / `name` change). Task 2 consumes it.

- [ ] **Step 1: Write the failing unit tests** in `form-schema.test.ts`, next to `'resolves array common props with the row context'`:

```ts
it('passes row and rootValues to child render callbacks', () => {
  const rootValues = { contacts: [{ name: 'a' }, { name: 'b' }] };
  const rowContext = { row: rootValues.contacts[1]!, rootValues };
  const help = vi.fn(() => 'help');
  const renderComponentContent = vi.fn(() => ({}));
  const suffix = vi.fn(() => 'suffix');
  const componentProps = vi.fn(() => ({}));

  const schema = createArrayChildSchema(
    { component: 'Input', componentProps, fieldName: 'name', help, renderComponentContent, suffix },
    { arrayField: 'contacts', index: 1, rowContext },
  );
  (schema.help as () => unknown)();
  (schema.renderComponentContent as () => unknown)();
  (schema.suffix as () => unknown)();
  (schema.componentProps as () => unknown)();

  const expected = expect.objectContaining({
    fieldName: 'contacts[1].name', row: { name: 'b' }, rootValues, rowIndex: 1, rowPath: 'contacts[1]',
  });
  for (const fn of [help, renderComponentContent, suffix, componentProps]) {
    expect(fn).toHaveBeenCalledWith(expected);
  }
});
```

The existing `'resolves array common props with the row context'` test (no `rowContext`) must keep passing as is.

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm vitest run packages/taman-ui/src/form/__tests__/form-schema.test.ts`
Expected: FAIL — `row`/`rootValues` missing from the call, and/or `schema.suffix` is not wrapped.

- [ ] **Step 3: Implement the schema change in `form-render.schema.ts`**

- Add `rowContext` to `CreateArrayChildSchemaOptions`.
- Change `wrapSchemaContextRender(render, baseContext, rowContext?)` so the wrapper builds the context **on each call**: without `rowContext`, pass `baseContext` as today; with it, pass `{ ...baseContext }` plus `row` and `rootValues` defined as **getters** forwarding to `rowContext` (getters, not copied values, so a callback only tracks what it reads).
- Thread `rowContext` through `wrapCommonConfig` and every `wrapSchemaContextRender` call in `createArrayChildSchema`, and add `suffix: wrapSchemaContextRender(schema.suffix, baseContext, rowContext)`.
- Leave `scopeDependencies` / `createSchemaContext` as they are.

- [ ] **Step 4: Change the `suffix` type and its top-level rendering**

- In `form.types.ts` `FormSchemaBody`: `suffix?: CustomParamsRenderType<TValues>;`
- In `form-render-form-field.vue`: add `computedSuffix`, mirroring `computedHelp` (a function suffix is called with `{ fieldName: props.fieldName }`; a string passes through; undefined stays undefined), and pass `:suffix="computedSuffix"` to `FormRenderFieldControl` (its prop stays `FormCustomRenderType`).
- Add the `TamanFormFieldArrayRowContext` type, the four new props and `rowKey` per the Interfaces block; export the type from `form/index.ts`.

- [ ] **Step 5: Run the unit test to verify it passes**

Run: `pnpm vitest run packages/taman-ui/src/form/__tests__/form-schema.test.ts`
Expected: PASS

- [ ] **Step 6: Write the failing component tests** in the new `form-field-array-row-extensions.test.ts`

Copy the harness shape from `form-field-array-sortable.test.ts` (`TestInput`, `wrappers` cleanup in `afterEach`, `items()`), plus a `mountPortfolio({ arrayProps, children, portfolio, schema })` that mounts `useTamanForm` with one `portfolio` array field (`sortable` **not** forced on) whose default child is `{ component: TestInput, fieldName: 'title', label: 'Title' }`, and `getRows(wrapper)` returning `wrapper.findAll('[data-array-row-index]')` (the hook is added in Task 1 Step 8). Also mock `useSortable` as in the sortable test (`initializeSortable: async () => undefined`) so a sortable mount never loads Sortable.

```ts
describe('array child callbacks', () => {
  it('passes the row to child componentProps and suffix', async () => {
    const { formApi, wrapper } = await mountPortfolio({
      children: [{
        component: TestInput,
        componentProps: ({ row }) => ({ placeholder: `Title for ${row?.id}` }),
        fieldName: 'title',
        label: 'Title',
        suffix: ({ row, rootValues }) => `${row?.title}/${rootValues?.portfolio.length}`,
      }],
    });
    expect(wrapper.findAll('input').map((i) => i.attributes('placeholder')))
      .toEqual(['Title for id-a', 'Title for id-b', 'Title for id-c']);
    expect(wrapper.text()).toContain('b/3');

    formApi.form.setFieldValue('portfolio[1].title', 'z');
    await flushPromises();
    expect(wrapper.text()).toContain('z/3');
  });

  it('re-runs child callbacks only for the changed row', async () => {
    const componentProps = vi.fn(({ row }) => ({ placeholder: row?.title }));
    const { formApi } = await mountPortfolio({ children: [{ component: TestInput, componentProps, fieldName: 'title', label: 'Title' }] });
    componentProps.mockClear();
    formApi.form.setFieldValue('portfolio[1].title', 'z');
    await flushPromises();
    expect(componentProps.mock.calls.map(([ctx]) => ctx.rowIndex)).not.toContain(0);
    expect(componentProps.mock.calls.map(([ctx]) => ctx.rowIndex)).not.toContain(2);
  });

  it('still renders a top-level suffix function', async () => {
    // Mount useTamanForm with a plain field: { component: TestInput, fieldName: 'weight', suffix: () => 'kg' }
    // expect(wrapper.text()).toContain('kg')
  });
});
```

- [ ] **Step 7: Run them to verify they fail**

Run: `pnpm vitest run packages/taman-ui/src/form/__tests__/form-field-array-row-extensions.test.ts`
Expected: FAIL — `row` is undefined in child callbacks (placeholders read `Title for undefined`).

- [ ] **Step 8: Build row contexts in `form-field-array.vue`**

- Add `arrayValue = formActions.useSelector((state) => get(state.values, props.name))` and `rootValuesState = formActions.useSelector((state) => state.values)`.
- `createRowContext(index): TamanFormFieldArrayRowContext` — `index`, `rowPath: \`${arrayPath.value}[${index}]\``, a per-row `computed` returning `arrayValue.value?.[index] ?? {}` (so the row's dependents only fire when that row's object changes), and getters `row` / `rootValues` reading that computed and `rootValuesState.value`.
- `rowContexts = computed(() => Array.from({ length: arrayLength.value }, (_, i) => createRowContext(i)))`.
- `rowSchemas(index)` passes `rowContext: rowContexts.value[index]` to `createArrayChildSchema`.
- Add `:data-array-row-index="index"` to every row element (sortable or not); tests locate rows by it. It is the only markup change for fields without the new options.

- [ ] **Step 9: Run the new tests, the sortable tests and the typecheck**

Run: `pnpm vitest run packages/taman-ui/src/form` then the typecheck command.
Expected: all PASS; vue-tsc prints nothing.

- [ ] **Step 10: Commit**

```bash
git add packages/taman-ui/src/form
git commit -m "fix(taman-ui): pass row and rootValues to array child callbacks

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: `rowExtra`, `rowActions`, `rowRemovable`, `addButtonProps`

**Files:**
- Create: `packages/taman-ui/src/form/components/form-field-array-row-content.vue`
- Modify: `packages/taman-ui/src/form/components/form-field-array.vue`
- Test: `packages/taman-ui/src/form/__tests__/form-field-array-row-extensions.test.ts`

**Interfaces:**
- Consumes: `rowContexts` and the prop types from Task 1.
- Produces `FormFieldArrayRowContent` (internal, `inheritAttrs: false`): props `context: TamanFormFieldArrayRowContext`, `render: (ctx) => TamanRenderContentType | null | undefined`. Computes `content = computed(() => props.render(props.context))` in its own instance and renders `<div v-if="content" v-bind="$attrs"><TamanRenderContent :content="content" /></div>` — nothing at all when the callback returns `null`/`undefined`/`''`. Owning its render effect is what keeps one row's callback from re-running when another row changes.
- New DOM hooks (tests rely on them): `data-array-row-extra` on the extra wrapper, `data-array-row-actions` on the actions wrapper, `data-array-remove` on every remove button (in both action-cell branches).

- [ ] **Step 1: Write the failing tests** (new `describe('array row extensions')` block in the same file)

- `'renders as before when no row options are set'`: grids found by `[style*="grid-template-columns"]` have `gridTemplateColumns === '3rem minmax(0, 1fr) 4rem'` (4 of them: header + 3 rows); no `[data-array-row-extra]`, no `[data-array-row-actions]`; 3 `[data-array-remove]`.
- `'renders rowExtra per row and updates it with the row'`: `rowExtra: ({ row }) => \`Preview ${row.title}\``; the three `[data-array-row-extra]` texts are `['Preview a', 'Preview b', 'Preview c']`, each inside its own row and with `style.gridColumn === '1 / -1'`; after `setFieldValue('portfolio[1].title', 'z')` the texts are `['Preview a', 'Preview z', 'Preview c']`.
- `'renders nothing extra when rowExtra returns null'`: `rowExtra: ({ row }) => (row.title === 'b' ? 'Importing from Drive…' : null)` → exactly one `[data-array-row-extra]`, inside row 1.
- `'re-runs rowExtra only for the changed row'`: spy `vi.fn(({ row }) => row.title)`, `mockClear()` after mount, change `portfolio[1].title`, flush → every call's `ctx.index === 1` and at least one call.
- `'keeps row extras with their rows after a remove'`: with the `Preview` rowExtra, click the first `[data-array-remove]` → texts are `['Preview b', 'Preview c']`.
- `'renders rowActions before the row buttons, with that row'`: `rowActions: (ctx) => h('button', { 'data-test': 'retry', onClick: () => retry(ctx.index, ctx.row.title) }, 'Retry')`; clicking the second `[data-test="retry"]` calls `retry` with `(1, 'b')`. With `sortable: true` too, inside each row's action cell `[data-array-row-actions]` precedes the first `[data-array-move]` and the `[data-array-remove]` (use `compareDocumentPosition`).
- `'shares one auto action column when rowActions is set'`: the rows container has `style.display === 'grid'` and `gridTemplateColumns === '3rem minmax(0, 1fr) auto'`; header and every row have `style.gridColumn === '1 / -1'` (also assert `gridTemplateColumns === 'subgrid'` if jsdom keeps the value; if it drops it, leave that assertion out and say so in the report).
- `'hides the remove button where rowRemovable returns false'`: `rowRemovable: ({ row }) => row.title !== 'b'` → per-row presence of `[data-array-remove]` is `[true, false, true]`; after `setFieldValue('portfolio[0].title', 'b')` it is `[false, false, true]`.
- `'passes addButtonProps to the add button'`: `addButtonProps: { class: 'self-end', variant: 'solid' }` → the add button (find by text `Add a row`) has classes `self-end` and `border-dashed`.
- `'keeps the add button disabled at max despite addButtonProps'`: `max: 3, addButtonProps: { disabled: false }` with 3 rows → add button is disabled; and `addButtonProps: { disabled: true }` with no max → disabled.

- [ ] **Step 2: Run them to verify they fail**

Run: `pnpm vitest run packages/taman-ui/src/form/__tests__/form-field-array-row-extensions.test.ts`
Expected: the new block FAILs (no `[data-array-remove]`, no extras/actions); Task 1 tests still PASS.

- [ ] **Step 3: Create `form-field-array-row-content.vue`** per the Interfaces block.

- [ ] **Step 4: Implement in `form-field-array.vue`**

- **Defaults:** add `addButtonProps: undefined, rowActions: undefined, rowExtra: undefined, rowRemovable: undefined` to `withDefaults`.
- **Grid:** action column is `'auto'` when `rowActions` is set, else the current `7.5rem` / `4rem`. When `rowActions` is **unset**, markup and styles stay exactly as today. When set, the rows container (`ref="rowsContainer"`) gets `{ display: 'grid', gridTemplateColumns }`, and the header, every row and the empty-state div get `{ gridColumn: '1 / -1' }` (header and rows also `gridTemplateColumns: 'subgrid'`), so all rows share one action-column width. Keep the header's `hidden sm:grid` and the rows' `sm:grid` classes as they are.
- **rowExtra:** last child of each row: `<FormFieldArrayRowContent v-if="rowExtra" :render="rowExtra" :context="rowContexts[index]" data-array-row-extra class="pb-3 sm:px-2" style="grid-column: 1 / -1" />` (padding to taste, following the cell classes around it).
- **rowActions:** first item in the action cell (both branches), wrapper `class="flex gap-1 items-center"` with `data-array-row-actions`. In the non-sortable branch, when `rowActions` is set the cell uses the sortable cell's classes (`pt-1 flex gap-1 justify-end sm:px-2 sm:py-3 sm:justify-start`) so items sit in a row; when unset it keeps `pt-1 flex justify-end sm:px-2 sm:py-3 sm:block`.
- **rowRemovable:** `removableRows = computed(() => rowContexts.value.map((ctx) => computed(() => props.rowRemovable?.(ctx) ?? true)))`; render each remove button (both branches) only when `removableRows[index].value` is true. Add `data-array-remove` to both remove buttons.
- **addButtonProps:** `v-bind="addButtonProps"` on `PButton` after `variant` / `size` / `class` / `icon` (so it overrides them and `class` merges) and before `:disabled` / `@click`; `:disabled="disabled || !canAdd || Boolean(addButtonProps?.disabled)"`.

- [ ] **Step 5: Run all form tests, typecheck, and lint**

Run: `pnpm vitest run packages/taman-ui/src/form`, the typecheck command, and `pnpm eslint packages/taman-ui/src/form`.
Expected: all PASS, including the unchanged `form-field-array-sortable.test.ts`; vue-tsc and eslint print no errors.

- [ ] **Step 6: Commit**

```bash
git add packages/taman-ui/src/form
git commit -m "feat(taman-ui): add row extra, actions, removable and add button props to array fields

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: README, changeset, graph

**Files:**
- Modify: `packages/taman-ui/src/form/README.md` (`### Array fields` section, lines ~313–390; `## Exported utilities and types` list)
- Create: `.changeset/form-array-row-extensions.md`
- Update: `graphify-out/` via `graphify update .`

- [ ] **Step 1: Update the README**

- Fix the callback sentence: child `componentProps`, `help`, `renderComponentContent` and `suffix` callbacks receive `row`, `rowIndex`, `rowPath`, `arrayField`, the resolved `fieldName`, and `rootValues`.
- Add table rows: `rowExtra` (None — content under a row's fields, full width; rendered only when it returns something), `rowActions` (None — content before the row's move/remove buttons; the action column then sizes to fit), `rowRemovable` (None — return `false` to hide that row's remove button; `min` and `disabled` still apply), `addButtonProps` (None — props for the add button, e.g. `class`, `variant`, `block`).
- Add a `#### Row extras and actions` subsection after `#### Reordering rows`: describe `TamanFormFieldArrayRowContext` (`index`, `row`, `rowPath`, `rootValues`), note that a row's callbacks re-run only when the values they read change, and give one example: a `portfolio` array with `rowExtra` showing a preview or an "Importing from Drive…" status, `rowActions` returning a Retry button built with `h()`, `rowRemovable` hiding remove while importing, and `addButtonProps: { class: 'self-end', block: false }`.
- Add `TamanFormFieldArrayRowContext` (and `TamanFormFieldArrayProps` if absent) to the key type exports list.

- [ ] **Step 2: Add the changeset** `.changeset/form-array-row-extensions.md`:

```md
---
"@vinicunca/taman-ui": minor
---

Array fields: add `rowExtra`, `rowActions`, `rowRemovable` and `addButtonProps`, make child `suffix` row-aware, and pass `row` and `rootValues` to array child render callbacks.
```

- [ ] **Step 3: Refresh the knowledge graph and verify**

Run: `graphify update .`, then `pnpm vitest run packages/taman-ui/src/form` and `pnpm eslint packages/taman-ui/src/form .changeset`.
Expected: graph updated; tests and lint pass.

- [ ] **Step 4: Commit**

```bash
git add packages/taman-ui/src/form/README.md .changeset/form-array-row-extensions.md graphify-out
git commit -m "docs(taman-ui): document array row extensions and add changeset

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```
