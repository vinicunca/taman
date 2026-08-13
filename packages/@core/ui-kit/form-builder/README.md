# @taman-core/form-builder

Schema-driven forms on top of pohon-ui's `PForm` / `PFormField`. You describe fields as a typed config array with zod rules; the package renders the form, composes one zod schema, and hands you an imperative `formApi` for values, validation, and submission.

```ts
const [Form, formApi] = useTamanForm({
  fields: [
    {
      component: "Input",
      name: "email",
      label: "Email",
      rules: z.string().email(),
    },
  ],
  handleSubmit: (values) => api.saveUser(values),
});
```

- **Validation:** zod v4 only, imported via the `zod` subpath. Pohon's `PForm` executes the schema (Standard Schema), owns error display, aria, and touched/dirty tracking.
- **No pohon types leak** through the public API; no app-specific dependencies. Each app injects its own component registry.

## Table of contents

- [Setup](#setup)
- [Quick start](#quick-start)
- [Field configuration](#field-configuration)
- [Validation](#validation)
- [Cross-field dependencies](#cross-field-dependencies)
- [Async validation](#async-validation)
- [Value transforms](#value-transforms)
- [Repeaters (array fields)](#repeaters-array-fields)
- [Layout](#layout)
- [Custom field content (slots)](#custom-field-content-slots)
- [Error display](#error-display)
- [Search form preset](#search-form-preset)
- [FormApi reference](#formapi-reference)
- [Gotchas](#gotchas)

## Setup

Register the plugin once per app, next to `app.use(pohon)` in your bootstrap. The registry maps string names to components; `defaults` are per-component prop defaults applied app-wide; `messages` localize the built-in action buttons.

```ts
// bootstrap.ts
import {
  createFormBuilder,
  defineFieldComponents,
} from "@taman-core/form-builder";
import PCheckbox from "pohon-ui/components/Checkbox.vue";
import PInput from "pohon-ui/components/Input.vue";
import PInputNumber from "pohon-ui/components/InputNumber.vue";
import PSelect from "pohon-ui/components/Select.vue";
import PTextarea from "pohon-ui/components/Textarea.vue";

export const fieldComponents = defineFieldComponents({
  Checkbox: PCheckbox,
  Input: PInput,
  Number: PInputNumber,
  Select: PSelect,
  Textarea: PTextarea,
});

app.use(
  createFormBuilder({
    components: fieldComponents,
    defaults: {
      Select: { placeholder: "Pilih..." },
    },
    messages: { reset: "Atur ulang", submit: "Simpan" },
  }),
);
```

Notes:

- The renderer uses `PForm`, `PFormField`, `PButton`, and `PTooltip` as globally registered components — make sure `app.use(pohon)` runs in the same app.
- Registry names give you typed `props` per field. Any field can also bypass the registry with a raw component (see below).
- Without the plugin installed, forms still render; the registry is empty (only raw components work) and button labels fall back to English.

## Quick start

```vue
<script lang="ts" setup>
import { useTamanForm } from "@taman-core/form-builder";
import { z } from "zod";

const [Form, formApi] = useTamanForm({
  fields: [
    {
      component: "Input",
      label: "Name",
      name: "name",
      rules: z.string().min(1, "Name is required"),
    },
    {
      component: "Input",
      label: "Email",
      name: "email",
      rules: z.string().email(),
    },
    {
      component: "Number",
      label: "Seats",
      name: "seats",
      props: { min: 1 },
      rules: z.number().int().positive(),
    },
  ],
  handleSubmit: async (values) => {
    await createEvent(values);
  },
  initialValues: { email: "", name: "", seats: 1 },
});
</script>

<template>
  <Form />
</template>
```

`useTamanForm` returns a tuple:

- **`Form`** — a component you drop into your template. It renders the fields, the grid, and (by default) Submit/Reset buttons.
- **`formApi`** — the imperative handle. Use it for everything programmatic: `formApi.setValues(...)`, `formApi.submit()`, `formApi.validate()`, …

Pressing Enter or clicking Submit validates, applies output transforms, and calls `handleSubmit(values)`. Invalid forms show inline errors and never reach `handleSubmit`.

## Field configuration

Every entry in `fields` is a `FieldConfig`:

| Property              | Type                                                        | Purpose                                                                                                                                                 |
| --------------------- | ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `component`           | registry name \| raw `Component`                            | What control to render                                                                                                                                  |
| `name`                | `string?`                                                   | Value path, dot paths allowed (`'address.city'`). **Omit for display-only entries** (headings, dividers): they render but bind no value and add no rule |
| `rules`               | `ZodType?`                                                  | Validation for this field (zod v4)                                                                                                                      |
| `label`               | `string \| () => VNode`                                     | Field label (function renders through the label slot)                                                                                                   |
| `description`, `help` | `string` / `string \| (values) => string`                   | Secondary texts under label / control                                                                                                                   |
| `props`               | object \| `(values, api) => object`                         | Props for the control; function form re-computes reactively                                                                                             |
| `dependencies`        | `FieldDependencies?`                                        | Cross-field reactivity (see below)                                                                                                                      |
| `asyncValidate`       | `FieldAsyncValidate?`                                       | Server-side checks (see below)                                                                                                                          |
| `transform`           | `FieldTransform?`                                           | Value mapping at the API boundary (see below)                                                                                                           |
| `repeat`              | `FieldRepeat?`                                              | Array-of-rows field (see below)                                                                                                                         |
| `slots`               | `Record<string, (props) => VNode \| VNode[]>`               | Named slots passed to the control (e.g. a Select's option slot)                                                                                         |
| `formFieldProps`      | `{ size?, hint?, eagerValidation?, validateOnInputDelay? }` | Forwarded to `PFormField`                                                                                                                               |
| `span`                | `number \| 'full'`                                          | Grid columns this field spans                                                                                                                           |
| `newRow`              | `boolean`                                                   | Force the field to start a new grid row                                                                                                                 |
| `class`, `labelClass` | `string`                                                    | Extra classes                                                                                                                                           |
| `hide`                | `boolean \| (values) => boolean`                            | CSS-hide (still validated, value kept)                                                                                                                  |
| `keepValueOnHide`     | `boolean`                                                   | Keep the value in `getValues()` even when excluded by `dependencies.if === false`                                                                       |

**Localized labels.** Because `fields` is a plain array you build yourself, just call your app's translator when constructing it — nothing form-builder-specific:

```ts
import { $t } from '#/locales';

export function getTalentsFormSchema() {
  return defineFields<FormFieldComponents>([
    { component: 'Input', label: $t('talent.fields.legalName'), name: 'legalName' },
  ]);
}
```

A **string** `label` is resolved once, when you build the array — so the labels reflect whichever locale was active at that moment. That's usually what you want: rebuild the schema on each mount (a form inside a `destroyOnClose` drawer already does this) and it picks up the current locale every time.

If a form is long-lived and must relabel itself *while mounted* on a locale switch, use the **function** form instead — form-builder renders it through `PFormField`'s label slot, i.e. during render, so reading a reactive locale inside it re-renders that label:

```ts
import { h } from 'vue';

{ component: 'Input', name: 'legalName', label: () => h('span', $t('talent.fields.legalName')) }
```

The same split applies elsewhere: `help` and `props` also accept function forms that re-evaluate, while plain values are captured once. The alternative for the whole form at once is `formApi.setFields(buildSchema())` in a `watch` on the locale.

Raw component escape hatch — for one-offs that don't belong in the registry:

```ts
import MyColorPicker from "./my-color-picker.vue";

const fields = [{ component: MyColorPicker, label: "Accent", name: "accent" }];
```

**The value contract.** Whether a field's control comes from the registry or is a raw component, form-builder binds it the exact same way: `v-model="modelValue"`, where `modelValue` is a computed reading/writing the field's dot path in `formApi.values`. That's it — there's no separate "value" prop or change-event convention, and no per-field `modelPropName` remapping (unlike some schema-form libraries). Your raw component just needs to speak standard Vue 3 `modelValue` / `update:modelValue`, the same as every pohon input already does.

The simplest way to satisfy that is `defineModel()`:

```vue
<!-- my-color-picker.vue -->
<script lang="ts" setup>
const model = defineModel<string>(); // modelValue in, update:modelValue out
</script>

<template>
  <input v-model="model" type="color" />
</template>
```

Used exactly like any other field:

```ts
import MyColorPicker from './my-color-picker.vue';
import { z } from 'zod/v4';

const fields = [
  {
    component: MyColorPicker,
    label: 'Accent color',
    name: 'accentColor',
    rules: z.string().regex(/^#[0-9a-f]{6}$/i, 'Enter a hex color'),
  },
];
```

**If the raw component doesn't use `modelValue`** (e.g. it's a third-party component with its own `value`/`@change`, or `checked`/`@update:checked`), wrap it in a one-file adapter that translates — don't reach for a per-field prop-name option that doesn't exist:

```vue
<!-- adapters/legacy-slider-adapter.vue -->
<script lang="ts" setup>
import LegacySlider from 'some-legacy-lib/Slider.vue'; // uses `value` / `@input`

const model = defineModel<number>();
</script>

<template>
  <LegacySlider :value="model" @input="model = $event" />
</template>
```

```ts
{ component: LegacySliderAdapter, label: 'Volume', name: 'volume' }
```

The adapter is the whole fix — form-builder still just sees a component that speaks `modelValue`.

**A fuller worked example: a multi-image upload field, render-only component.** A field's value can differ in shape from what its picker deals in day-to-day (`(File | string)[]` while editing — local files not yet uploaded, mixed with already-uploaded URLs — vs. `string[]` once submitted). The key design choice: **the component stays dumb** (it only picks files and lets you remove entries — no network calls, no async, no upload knowledge at all); turning a picked `File` into a stored URL is the *form's* job, done via the field's own `dependencies.trigger`. This keeps the component trivially reusable across any domain, and keeps "how/where files get uploaded" colocated with the rest of that form's field definitions, not buried inside a UI component:

```vue
<!-- core-upload-images.vue — render-only -->
<script lang="ts" setup>
import { ref, watch } from 'vue';

withDefaults(
  defineProps<{ accept?: string; multiple?: boolean }>(),
  { accept: 'image/*', multiple: true },
);

// string = already-uploaded URL; File = picked, not yet processed.
const modelValue = defineModel<(File | string)[]>({ default: () => [] });
const picked = ref<File[] | null>(null);

const objectUrlCache = new Map<File, string>();
function previewFor(item: File | string) {
  if (typeof item === 'string') return item;
  let url = objectUrlCache.get(item);
  if (!url) { url = URL.createObjectURL(item); objectUrlCache.set(item, url); }
  return url;
}

watch(picked, (files) => {
  if (!files?.length) return;
  modelValue.value = [...modelValue.value, ...files]; // just append — no upload call
  picked.value = null; // reset so PFileUpload's own list doesn't keep growing
});

function remove(index: number) {
  const removed = modelValue.value[index];
  modelValue.value = modelValue.value.filter((_, i) => i !== index);
  if (removed instanceof File) {
    const cached = objectUrlCache.get(removed);
    if (cached) { URL.revokeObjectURL(cached); objectUrlCache.delete(removed); }
  }
}
</script>

<template>
  <div class="flex flex-col gap-3">
    <div class="flex flex-wrap gap-2">
      <div v-for="(item, i) in modelValue" :key="typeof item === 'string' ? item : i" class="relative size-20 overflow-hidden rounded border">
        <img :src="previewFor(item)" alt="" class="size-full object-cover">
        <PButton class="absolute right-1 top-1" icon="lucide:x" size="xs" variant="solid" @click="remove(i)" />
      </div>
    </div>
    <PFileUpload v-model="picked" :accept="accept" :multiple="multiple" />
  </div>
</template>
```

Register it exactly like any other control — no special props, because it doesn't know anything about uploading:

```ts
import { defineFieldComponents } from '@taman-core/form-builder';
import CoreUploadImages from './core-upload-images.vue';

const fieldComponents = defineFieldComponents({
  UploadImages: CoreUploadImages,
});
```

The field config itself stays completely ordinary — no upload wiring at all:

```ts
{
  component: 'UploadImages',
  name: 'headshotUrls', // maps to a string[] DB column
  label: 'Headshots',
}
```

**Upload at submit, not at pick.** The picked `File`s just sit in the form value until the user commits. Do the uploading in your submit handler, swapping each `File` for the URL it was stored at:

```ts
/** File entries were just picked; string entries are already stored (edit mode). */
async function resolveImageUrls(value: unknown): Promise<string[]> {
  const items = Array.isArray(value) ? value : value ? [value] : [];
  return Promise.all(
    items.map((item) =>
      typeof item === 'string' ? item : uploadToStorage(item as File),
    ),
  );
}

async function handleSubmit(values) {
  const payload = {
    ...values,
    headshotUrls: await resolveImageUrls(values.headshotUrls),
  };
  await createTalent(payload);
}
```

Why submit-time rather than uploading the moment a file is picked:

- **No orphaned files.** Anything the user adds and then removes — or abandons by closing the dialog — is never sent, so there's nothing to garbage-collect server-side. Eager uploading needs a cleanup story (a delete-on-remove call, or a TTL sweep over unreferenced blobs) before it's safe.
- **One commit point.** Nothing reaches storage unless the record itself is being created.

The tradeoff is latency: submit now waits on the uploads, so lock the dialog/button while it runs (`drawerApi.lock()` does this) and surface failures on the field via `formApi.setErrors([{ path, message }])` so the user can retry with their picked files still in place. If submit latency ever becomes the bigger complaint — large files, slow connections — that's the point to switch to eager uploads *and* build the cleanup mechanism, not before.

> **Don't reach for `dependencies.trigger` to do this.** `dependencies` is for cross-field reactivity (this field's state deriving from *other* fields), and `trigger` is for the side effects of that — clearing a dependent field when its parent changes, say. It is not a general value-watcher: it also fires once on mount before the user has touched anything, and re-fires on every write including your own, so I/O there needs mount guards and in-flight dedup to avoid duplicate requests. Submit handlers already have exactly the semantics an upload wants.

> **`getValues()` and `File`s:** it deep-clones, and non-plain objects go through `structuredClone`. In a **browser** that's fine — `File`/`Blob` are structured-cloneable, so you get a real `File` with its bytes intact, safe to upload. Two caveats: the clone is a *new object*, so never key anything (a `WeakSet`, a cache) on `File` identity across a `getValues()` boundary; and each call copies the file bytes, which is worth remembering before calling it in a loop over large uploads.
>
> Under **happy-dom** (the test env) the same call degrades a `File` to a plain object — its class isn't structured-cloneable there — so file-carrying flows can't be verified in a happy-dom test. Exercise those in a browser.

Typed fields outside `useTamanForm` — use `defineFields` with your registry type:

```ts
import { defineFields } from "@taman-core/form-builder";
import type { fieldComponents } from "@/bootstrap";

const fields = defineFields<typeof fieldComponents>([
  { component: "Select", name: "status", props: { items: statusOptions } }, // props typed against PSelect
]);
```

## Validation

Per-field `rules` are composed into one nested `z.object()`:

- Dot-path names become nested objects: `'user.email'` + `'user.age'` → `z.object({ user: z.object({ email, age }) })`.
- A field is shown as **required** when its rule rejects `undefined` (`z.string()` → required, `z.string().optional()` → not).
- Duplicate names, and collisions between a leaf rule and a nested group (`'user'` with rules + `'user.email'`), **throw immediately** — misconfiguration fails loudly.

Programmatic validation:

```ts
const { valid, errors } = await formApi.validate(); // whole form
const partial = await formApi.validate(["user.email"]); // specific paths
// errors: Array<{ path: string; message: string }>
```

Server-side errors (e.g. a 422 response) map straight onto fields and clear on the next change to that field:

```ts
try {
  await api.save(formApi.getValues());
} catch (error) {
  formApi.setErrors([{ message: "Slug already in use", path: "meta.slug" }]);
}
```

Form-level `validateOn` (default: pohon's `['input', 'blur', 'change']`) controls when pohon re-validates:

```ts
useTamanForm({ fields, validateOn: ["blur"] });
```

**Validation timing.** A field validates late on its first pass — no error while the user is still typing their first attempt, only on blur or submit — but once an error has been shown for that field (sync, async, or server-set via `setErrors`, all uniformly), it switches to live validation: the error clears the instant the value becomes valid, and reappears immediately if it's broken again, all without another blur or submit. This is automatic and needs no configuration; pass `formFieldProps: { eagerValidation: false }` on a field to opt it out and keep the default lazy behavior even after an error.

## Cross-field dependencies

`dependencies` makes a field react to other fields. `triggerFields` declares exactly which value paths are watched — nothing else re-evaluates it.

```ts
const fields = defineFields<typeof fieldComponents>([
  {
    component: "Select",
    label: "Type",
    name: "type",
    props: { items: ["person", "company"] },
  },
  {
    component: "Input",
    label: "Company name",
    name: "companyName",
    rules: z.string().min(1, "Company name is required"),
    dependencies: {
      triggerFields: ["type"],
      // false => field is unmounted, its rule leaves the schema,
      // and its value is excluded from getValues()
      if: (values) => values.type === "company",
    },
  },
  {
    component: "Number",
    label: "Discount %",
    name: "discount",
    rules: z.number().min(0).optional(),
    dependencies: {
      triggerFields: ["type", "discount"],
      show: (values) => values.type !== undefined, // false => CSS-hidden, still validated
      disabled: (values) => values.type === "person",
      props: (values) => ({ max: values.type === "company" ? 50 : 10 }),
      rules: (values) =>
        values.type === "company"
          ? z.number().min(5, "Company discount starts at 5%")
          : undefined,
      trigger: async (values, api) => {
        // side effects, e.g. clearing another field
        if (values.type === "person") await api.setFieldValue("discount", 0);
      },
    },
  },
]);
```

Evaluation order per pass: `if` → (stop if false) → `show` → `props` → `rules` → `disabled` → `required` → `trigger`. All callbacks may be async; when changes race, the **last-started evaluation wins** and stale results are discarded.

> **Dependencies evaluate once immediately on mount, not only on change.** This is required, not incidental: `if`/`show`/`disabled`/`props`/`rules` must resolve *before* the first paint, or a field gated by `if` would flash in and then vanish. `trigger` rides the same pass, so **it also fires once on mount — before the user has touched anything.**
>
> Two consequences for `trigger` in particular, since it's the one with side effects:
>
> - **Values may be `undefined`.** A field only has a value if the form seeded it (`initialValues`) — so `values.myField.map(...)` on an unseeded field throws on the very first evaluation. Either seed the field or write the callback defensively (`values.myField ?? []`). The same applies after a `setFields()` or a partial `setValues()`.
> - **Write early-exits, not "on change" assumptions.** Make the callback a no-op when there's nothing to do, rather than assuming it only runs in response to a user edit.
>
> A callback that throws is caught, logged as `[form-builder] dependency evaluation failed for field "<name>"`, and skips the rest of that pass — it won't take the form down, but it also won't retry until the next trigger-field change.

`if` vs `show` vs `hide`:

|                               | DOM            | Validated | In `getValues()`              |
| ----------------------------- | -------------- | --------- | ----------------------------- |
| `dependencies.if === false`   | unmounted      | no        | no (unless `keepValueOnHide`) |
| `dependencies.show === false` | hidden via CSS | yes       | yes                           |
| `hide: true`                  | hidden via CSS | yes       | yes                           |

## Async validation

For checks that need the server (uniqueness, availability). Runs outside the zod schema; errors surface through the same per-field error slot.

```ts
{
  component: 'Input',
  label: 'Username',
  name: 'username',
  rules: z.string().min(3),
  asyncValidate: {
    // return an error message, or undefined when valid
    handler: async (value) => {
      const taken = await api.isUsernameTaken(String(value));
      return taken ? 'Username is already taken' : undefined;
    },
    on: 'blur',        // 'blur' (default) or 'input'
    debounce: 300,     // ms, default 300
  },
}
```

Behavior you can rely on:

- Runs are debounced; overlapping runs are **last-wins** (stale responses are ignored).
- The recorded async error **clears as soon as the value changes** — no second blur needed.
- **Submission is gated:** both `formApi.submit()` and the rendered Submit button / Enter key await in-flight async runs and refuse to submit while an async error stands (the error is kept visible alongside any sync errors).
- A rejected handler becomes the error message; nothing leaks as an unhandled rejection.

## Value transforms

`transform` maps between the API's shape and the form's shape. `in` runs on `setValues()`; `out` runs on `getValues()` / submit. Rules always validate the **form-side** value.

Classic range-split — API has `startDate`/`endDate`, the form has one range control:

```ts
{
  component: DateRangePicker,          // raw component taking [start, end]
  label: 'Period',
  name: 'period',
  transform: {
    in: (_value, values) => [values.startDate, values.endDate],
    out: (value, setExtra) => {
      const [start, end] = (value ?? []) as string[];
      setExtra('startDate', start);
      setExtra('endDate', end);
      return undefined;                // undefined => drop 'period' from the output
    },
  },
}
```

```ts
await formApi.setValues({
  endDate: "2026-07-31",
  name: "Gig",
  startDate: "2026-07-01",
});
formApi.values.period; // ['2026-07-01', '2026-07-31']

formApi.getValues(); // { name: 'Gig', startDate: ..., endDate: ... } — no 'period'
formApi.getRawValues(); // { name: 'Gig', period: [...] } — untransformed snapshot
```

`setExtra` may write any output path. Writing to a path owned by another transforming or pruned field throws (loud, order-independent) instead of silently losing data.

## Repeaters (array fields)

`repeat` renders one row of sub-fields per array item. Sub-field names are relative and get indexed automatically (`contacts.0.email`), so item errors land on the right row.

```ts
{
  component: 'Input',                  // component is unused for repeat fields; rows render sub-fields
  name: 'contacts',
  repeat: {
    addLabel: 'Add contact',
    fields: [
      { component: 'Input', label: 'Name', name: 'name', rules: z.string().min(1) },
      { component: 'Input', label: 'Email', name: 'email', rules: z.string().email() },
    ],
    min: 1,                            // remove is blocked at min
    max: 5,                            // add is blocked at max
    sortable: true,                    // shows ↑/↓ buttons
  },
}
```

- Rows are keyed by stable internal ids — reordering physically moves the row (focus and DOM state travel with it).
- The array is validated as `z.array(rowObject).min(min).max(max)`. Providing your own `rules` on the repeat field **replaces** that generated array schema entirely.
- After add/remove/reorder the array path re-validates once so indexed errors re-map.
- Mutate the array through the UI or by **replacing it** (`setFieldValue('contacts', next)`); splicing it externally from the middle can misalign row identity.

## Layout

Form-level `layout` plus per-field `span`/`newRow`:

```ts
useTamanForm({
  fields: [
    { component: "Heading", label: "Contact" }, // display-only: no name
    { component: "Input", name: "first", span: 1 },
    { component: "Input", name: "last", span: 1 },
    { component: "Input", name: "street", span: "full" },
    { component: "Input", name: "city", newRow: true },
  ],
  layout: {
    cols: { base: 1, md: 2, lg: 4 }, // responsive CSS grid (Tailwind breakpoints)
    labelPlacement: "vertical", // or 'horizontal'
    compact: true, // tighter row gap
  },
});
```

- `cols` picks the active column count by viewport (`lg` ≥ 1024, `md` ≥ 768, else `base`); rendering uses inline `grid-template-columns`, so no Tailwind safelisting is needed.
- Every field control renders full-width within its grid cell by default — the grid (`cols`/`span`) decides how much horizontal space a field gets, not the control's own intrinsic sizing.
- Default action buttons render in a full-width row. Hide them entirely with `showDefaultActions: false` and drive submission via `formApi.submit()`, or keep Submit and drop only Reset with `showResetButton: false` — useful for login/auth forms where a reset action doesn't make sense.

## Custom field content (slots)

Two mechanisms:

**1. Replace a field's control** with a named slot on `<Form>` matching the field name — you get full control, including the current error:

```vue
<template>
  <Form>
    <template #permissions="{ field, value, error }">
      <PermissionTree
        v-model="formApi.values.permissions"
        :invalid="Boolean(error)"
      />
    </template>
  </Form>
</template>
```

**2. Pass slots into the control** via `field.slots` — for components like `PSelect` that expose their own slots:

```ts
{
  component: 'Select',
  name: 'assignee',
  props: { items: users },
  slots: {
    item: ({ item }: any) => h(UserBadge, { user: item }),
  },
}
```

`field.slots` is a plain `Record<string, (props) => VNode | VNode[]>` forwarded verbatim to the resolved component's own named slots — form-builder doesn't inspect or alter the slot props at all, so whatever the component's own type declares for that slot (check its own `.vue.d.ts`/docs) is exactly what your function receives. This is the mechanism for "custom render within the control itself" — e.g. a per-item thumbnail in `PFileUpload`:

```ts
import { h } from 'vue';
import PButton from 'pohon-ui/components/Button.vue';

{
  component: 'FileUpload',
  name: 'headshotUrls',
  label: 'Headshots',
  props: { accept: 'image/*', multiple: true },
  slots: {
    // PFileUpload's `file` slot renders each already-selected file; override
    // it instead of the component's default row for a custom thumbnail +
    // remove button. Slot props (`file`, `index`, `removeFile`) come from
    // PFileUpload itself — see its `FileUploadSlots` type for the full set
    // (`files`, `file-name`, `actions`, `default`, …), all usable the same way.
    file: ({ file, index, removeFile }: any) =>
      h('div', { class: 'flex items-center gap-2 rounded border p-2' }, [
        h('img', {
          src: URL.createObjectURL(file),
          class: 'size-10 rounded object-cover',
        }),
        h('span', { class: 'flex-1 truncate text-sm' }, file.name),
        h(PButton, {
          icon: 'lucide:x',
          onClick: () => removeFile(index),
          size: 'xs',
          variant: 'ghost',
        }),
      ]),
  },
}
```

Slot names and prop shapes are entirely up to the target component — `field.slots` just plumbs them through; nothing here is form-builder-specific beyond the pass-through itself.

## Error display

- **`errorDisplay: 'inline'`** (default) — message under the control via `PFormField`.
- **`errorDisplay: 'tooltip'`** — no inline text (grid never shifts); the control gets a compact `!` marker wrapped in `PTooltip` carrying the message. Meant for dense search bars.

> Tooltip mode requires a tooltip provider in the ancestry — `<PApp>` provides one. Without it, `PTooltip` throws on mount.

## Search form preset

`preset: 'search'` turns the form into a filter bar for tables/lists:

```ts
const [SearchForm, searchApi] = useTamanForm({
  preset: "search",
  fields: [
    { component: "Input", name: "q", props: { placeholder: "Search…" } },
    { component: "Select", name: "status", props: { items: statusOptions } },
    { component: "Select", name: "venue", props: { items: venueOptions } },
    // ... more filters
  ],
  collapsedRows: 1, // rows visible while collapsed (default 1)
  submitOnChange: true, // debounced auto-submit, diffed vs the last submission
  handleSubmit: (filters) => tableState.setFilters(filters),
});
```

The preset applies defaults (`layout.cols: { base: 1, md: 2, lg: 3 }`, starts collapsed, keeps the action row inline) on top of which your own options win. It adds:

- **Collapse/expand** — fields beyond the first `collapsedRows` grid rows hide behind an Expand toggle (row math measures the real grid, and skips fields removed by `dependencies.if`).
- **Enter-to-submit** — native form submission, still gated by validation and async checks.
- **`submitOnChange`** — debounced (300 ms); submits only when `getValues()` actually differs from the last submission, so no duplicate requests.

There is deliberately **no table coupling**: the preset's only output is `handleSubmit(filters)` — wire it into TanStack Table state, the URL, or query keys yourself.

## FormApi reference

Values (transforms apply at these boundaries):

| Method                                        | Description                                                                                |
| --------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `getValues()`                                 | Output values: `transform.out` applied, `if === false` fields excluded                     |
| `getRawValues()`                              | Deep clone of the form-side values, untransformed                                          |
| `setValues(values, { shouldValidate? })`      | Runs `transform.in`, deep-merges into the form                                             |
| `setFieldValue(path, value, shouldValidate?)` | Write one dot path                                                                         |
| `useValues(selector?)`                        | Reactive computed over the values (for components)                                         |
| `values`                                      | The reactive values object itself (two-way; prefer the methods for writes with transforms) |

Validation & submission:

| Method                                      | Description                                                                                              |
| ------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `validate(paths?)`                          | → `{ valid, errors: [{ path, message }] }`                                                               |
| `submit()`                                  | Await async runs → validate → transforms → `handleSubmit` → returns values (or `undefined` when blocked) |
| `setErrors(errors)` / `clearErrors(paths?)` | Server-error channel, `{ path, message }[]`                                                              |
| `scrollToFirstError()`                      | Scrolls the first invalid control into view                                                              |
| `getLatestSubmissionValues()`               | Values of the last successful submission (search diffing)                                                |

Schema & state:

| Method                    | Description                                                          |
| ------------------------- | -------------------------------------------------------------------- |
| `updateSchema(partials)`  | Merge partial field configs by `name`                                |
| `setFields(fields)`       | Replace all fields; removed fields have values **and errors** pruned |
| `setState(partial \| fn)` | Update form-level state (`disabled`, `layout`, `collapsed`, …)       |
| `useStore(selector?)`     | Reactive selector over form-level state                              |

Instance plumbing:

| Member                                            | Description                                                                |
| ------------------------------------------------- | -------------------------------------------------------------------------- |
| `resetForm(values?)`                              | Reset to `values` or `initialValues`, clear all errors, call `handleReset` |
| `resetValidate()`                                 | Clear errors only                                                          |
| `getFieldComponentRef(name)` / `focusField(name)` | Reach the rendered control                                                 |
| `dirty` / `dirtyFields` / `touchedFields`         | Surfaced from `PForm`                                                      |

Calls made **before** the form mounts are queued and flush on mount — no `nextTick` dance needed when driving a form inside a drawer/modal:

```ts
const [Form, formApi] = useTamanForm({ fields });
await formApi.setValues(await api.fetchUser(id)); // safe even before <Form> renders
```

## Gotchas

- **Seed nested dependency-gated fields.** A field named `'meta.slug'` behind `dependencies.if` needs its ancestor seeded: `initialValues: { meta: { slug: '' } }`. Otherwise zod reports a generic "expected object" on `meta` (matching no field) instead of the slug's own message.
- **Field configs are static.** They're stored raw (not made reactive) — swap fields via `updateSchema` / `setFields`, don't mutate a config object in place and expect a re-render. Reactive behavior belongs in `props`-as-function and `dependencies`.
- **Tooltip mode needs `<PApp>`** (or another `TooltipProvider`) as an ancestor.
- **One live `<Form>` per `useTamanForm()` call.** The api binds to a single mounted instance; a fully destroyed form rejects calls that were pending at unmount.
- **Async error + sync error on the same field** shows the async message (it's the fresher, server-confirmed signal).
