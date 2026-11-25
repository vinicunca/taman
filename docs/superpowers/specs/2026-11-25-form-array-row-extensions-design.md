# Array field row extensions

Date: 2026-11-25 · Size: small change · Package: `@vinicunca/taman-ui` (`src/form`)

## Intent

ngibur's talent portfolio is a `type: 'array'` field. Its rows need content and controls that the
array field can't host today, so ngibur works around it: it puts a 24px thumbnail inside the URL input
via `renderComponentContent`, and pushes the add button right with a class that targets taman-ui's
markup (`[&>button]:self-end`). Phase 3 of that work (Google Drive imports) needs a per-row status line
("Importing from Drive…", or a failed reason plus Retry). Per the project rule, missing taman-ui form
features are added here rather than worked around in the app.

## Goals

- **Per-row extra area.** Render arbitrary content (a preview, a status line) under a row's fields.
- **Per-row actions.** Add buttons such as Retry next to a row's remove button.
- **Per-row remove control.** Hide the remove button for a given row.
- **Row-aware `suffix` on child fields**, like `help` and `renderComponentContent` already are.
- **`row` actually reaches child render callbacks.** The README (`Array fields`) says child callbacks
  receive `row`, but `componentProps`, `help` and `renderComponentContent` only get `rowIndex`/`rowPath`;
  today only `dependencies.resolve` sees the row's values. This is a bug fix.
- **Add-button props.** Pass props such as `class` or `block` to the add button, so apps stop
  styling it through its DOM. (Controller's call, offered alongside the requested items.)

## Non-goals

- Vue scoped slots for rows (approach B, not picked).
- Changing the column layout, the header, or how child fields render.
- i18n of the existing default texts (still TODO upstream).

## Anti-goals

- Re-rendering every row on any form change: row context must stay scoped to its own row.
- Breaking existing array fields: every new option is optional and the defaults render exactly as today.

## Approaches

- **A, render functions in `arrayProps` (picked by the user).** The new options are functions that
  take a row context. This matches how apps define forms today (schemas built in composables) and
  reuses the existing render-content machinery.
- **B, Vue scoped slots** (`#<field>-row-extra="{ row, index }"`). Nicer in templates, but the slots
  would have to be threaded through `taman-use-form` → `form-render-form` → field → array component.
  More plumbing, more fragile, and the main consumer's forms are schema-defined. Not picked.

## Design

New `TamanFormFieldArrayProps` (all optional; the defaults leave rendering unchanged):

```ts
interface TamanFormFieldArrayRowContext<TValues = FormValues> {
  index: number;               // row index
  row: Record<string, any>;    // current values of this row (reactive)
  rowPath: string;             // e.g. 'portfolio[2]'
  rootValues: Readonly<TValues>;
}

rowExtra?: (ctx) => TamanRenderContentType | null | undefined;   // full-width area under the row
rowActions?: (ctx) => TamanRenderContentType | null | undefined; // rendered before the remove button
rowRemovable?: (ctx) => boolean;                                 // false hides that row's remove button
addButtonProps?: ButtonProps;                                    // merged onto the add <PButton>
```

- **`rowExtra`** renders in a block spanning every grid column (`grid-column: 1 / -1`), below the
  row's cells. It renders only when the function returns something, so rows with nothing to show keep
  their current height.
- **`rowActions`** renders in the action cell, before the move and remove buttons. When it is set,
  the action column widens to fit its content (`auto` instead of the fixed `4rem` / `7.5rem`).
- **`rowRemovable`** combines with the existing `disabled` and `min`. When it returns false, that
  row's remove button is not rendered.
- **Row context** comes from a selector over this array's value, so a row's callbacks re-run only
  when the form state they read changes.
- **Child render callbacks:** `createArrayChildSchema` builds the context on each call, from current
  values plus the base context, for `componentProps`, `help`, `renderComponentContent` and now
  `suffix`. It does this the way `scopeDependencies` already does with `createSchemaContext`, so `row`
  and `rootValues` are filled in.
- **Types:** the new props flow through `FormArraySchema['arrayProps']`, which already derives from
  `TamanFormFieldArrayProps`. `TamanFormFieldArrayRowContext` is exported.
- **Docs:** update the README `Array fields` section with the new options and an example.
- **Tests:** add a `form-field-array-row-extensions.test.ts` next to the sortable test, covering:
  - `rowExtra` renders per row, with that row's values, and updates when they change;
  - nothing extra renders when it returns null;
  - `rowActions` renders, and a click sees the right row;
  - `rowRemovable` false hides only that row's remove button;
  - `addButtonProps` reaches the button;
  - child `suffix`, `help` and `componentProps` callbacks get `row`.
- **Release:** add a changeset bumping `@vinicunca/taman-ui` (minor). Work happens on branch
  `feat/form-array-row-extensions`. Publishing and bumping ngibur stay with the user.

## Left to the builder

- Exact markup and classes for the extra area and the action cell, following the existing styles.
- How the row context is memoised per row, within the anti-goal above.

## Follow-up in ngibur (after release; not part of this change)

- Replace the 24px leading thumbnail with a `rowExtra` preview, and drop the add-button class hack in
  favour of `addButtonProps`.
- Phase 3 uses `rowExtra` and `rowActions` for Drive import status and Retry.
