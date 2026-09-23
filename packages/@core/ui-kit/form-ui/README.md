# Taman Form UI

Schema-driven Vue forms built on TanStack Form. The package provides:

- `useTamanForm()` for creating a renderable form component and its imperative API.
- A typed schema for fields, groups, array fields, dependencies, and validation.
- Progressive synchronous and asynchronous validation.
- Codecs for separating UI values from submitted values.
- Reactive field selectors for advanced integrations.

## Mental model

```text
useTamanForm(options)
  -> Form       Vue component rendered in the template
  -> formApi    controller for values, validation, submission, and schema changes
```

Form state has two useful value shapes:

- **Raw values** are values used by field components, such as a `CalendarDate`.
- **Submit values** are values returned by `getValues()` and passed to
  `handleSubmit`, such as an ISO date string.

Without a `codec`, both shapes are the same.

## Setup

Register named validation rules once during application startup:

```ts
import { isEmptyFormValue, setupTamanForm } from '@taman-core/form-ui';

setupTamanForm({
  rules: {
    required(value, _params, context) {
      return isEmptyFormValue(value)
        ? `${context.label ?? context.name} is required`
        : true;
    },
  },
});
```

`setupTamanForm()` currently accepts a `rules` map. A rule returns `true` when
valid, or an error string when invalid. Applications can wrap `useTamanForm()`
to supply their component map types, localized rules, and a default codec. See
`apps/better-auth-front/src/adapter/form.ts` for the project adapter.

## Quick start

```vue
<script setup lang="ts">
import { useTamanForm, z } from '@taman-core/form-ui';

interface ProfileFormValues {
  email: string;
  name: string;
}

const [ProfileForm, formApi] = useTamanForm<ProfileFormValues>({
  handleSubmit(values) {
    console.log(values);
  },
  schema: [
    {
      component: 'Input',
      fieldName: 'name',
      label: 'Name',
      rules: z.string().min(1, 'Name is required'),
    },
    {
      component: 'Input',
      fieldName: 'email',
      label: 'Email',
      rules: z.email('Enter a valid email'),
    },
  ],
});

async function save() {
  const values = await formApi.validateAndSubmit();
  if (values) {
    console.log('Submitted', values);
  }
}
</script>

<template>
  <ProfileForm />
  <button type="button" @click="save">
    Save
  </button>
</template>
```

Render `<Form />` before awaiting API methods that require the runtime form.
Those methods wait for the first mount, so awaiting them without ever rendering
the component will wait indefinitely.

## Type parameters

The complete generic form is:

```ts
useTamanForm<
  TFormValues,
  TComponentType,
  TComponentPropsMap,
  TSubmitValues
>(options)
```

The core package accepts all four types explicitly:

```ts
interface EditorValues {
  publishedAt: CalendarDate | undefined;
}

interface SubmitValues {
  publishedAt: string | undefined;
}

const [Form, formApi] = useTamanForm<
  EditorValues,
  FormBaseComponentType,
  Record<never, never>,
  SubmitValues
>({
  codec,
  schema,
});
```

An application adapter can bind the component types and expose a shorter
`useAppForm<EditorValues, SubmitValues>()` signature.

## Form options

`useTamanForm(options)` accepts `TamanFormProps`.

| Option | Purpose | Default |
| --- | --- | --- |
| `schema` | Fields and groups to render. | `[]` |
| `commonConfig` | Fallback configuration shared by every field. | `{}` |
| `wrapperClass` | Grid classes for the form. | `grid-cols-1` |
| `compact` | Removes reserved validation-message space. | `false` |
| `disabled` | Disables fields and default submit/reset buttons. | `false` |
| `collapsed` | Current top-level collapsed state. | `false` |
| `collapseTriggerResize` | Emits a resize after collapse changes. | `false` |
| `showDefaultActions` | Renders default submit/reset controls. | `true` |
| `actionButtonsReverse` | Places submit before reset. | `false` |
| `actionLayout` | `inline`, `newLine`, or `rowEnd`. | `rowEnd` |
| `actionPosition` | `left`, `center`, or `right`. | `right` |
| `actionWrapperClass` | Classes for the action area. | `''` |
| `submitButtonOptions` | Pohon button props plus `content` and `show`. | `{}` |
| `resetButtonOptions` | Pohon button props plus `content` and `show`. | `{}` |
| `submitOnEnter` | Submits when Enter is pressed in a field. | `false` |
| `submitOnChange` | Submits after value changes. | `false` |
| `changeDebouncedTime` | Debounce for change submission. | `300` ms |
| `scrollToFirstError` | Scrolls to the first invalid field. | `false` |
| `codec` | Converts between raw and submitted value shapes. | none |
| `handleSubmit` | Receives `(values, rawValues)` after API submission. | none |
| `handleReset` | Handles a default reset-button click with current formatted values. | none |
| `handleValuesChange` | Receives raw values, changed paths, and a lazy formatter. | none |
| `handleCollapsedChange` | Receives the new collapsed state. | none |

`commonConfig.disabled` disables fields only. Form-level `disabled` also
disables the default action buttons.

Providing `handleReset` replaces the default reset-button behavior; it does not
run after an automatic reset. Call `formApi.reset()` inside the callback when
you still want the form cleared:

```ts
handleReset: async (currentValues) => {
  await confirmDiscard(currentValues);
  await formApi.reset();
},
```

### `handleValuesChange`

Formatting can be expensive or may throw while a partially completed form
cannot yet be encoded. The third argument formats lazily:

```ts
handleValuesChange(rawValues, changedFields, getFormattedValues) {
  console.log(changedFields);

  if (shouldPersistDraft(rawValues)) {
    const submitShape = getFormattedValues();
    saveDraft(submitShape);
  }
}
```

## Schema reference

### Field schema

| Property | Purpose |
| --- | --- |
| `component` | Built-in component name, registered component name, or Vue component. |
| `fieldName` | Value path, including nested paths such as `profile.email`. |
| `defaultValue` | Initial raw field value. |
| `label` | Label text or render function. |
| `description` | Secondary field description. |
| `help` | Help text or a function receiving schema context. |
| `suffix` | Content rendered after the field. |
| `componentProps` | Props object or a function receiving schema context. |
| `formFieldProps` | Validation triggers, native validators, and async debounce. |
| `rules` | Named rule, Zod schema, `null`, or another registered rule name. |
| `dependencies` | Recomputes field state when selected fields change. |
| `renderComponentContent` | Supplies named/default slots to the field component. |
| `hide` | Does not render the field. |
| `collapsed` | Hides the field while the whole form is collapsed. |
| `collapsible` | Gives this individual field a collapsible control. |
| `defaultCollapsed` | Initial state of an individually collapsible field. |
| `disabled` | Disables this field. |
| `hideLabel` | Hides its label. |
| `hideMessage` | Suppresses its standard validation message. |
| `hideRequiredMark` | Hides its required indicator. |
| `modelPropName` | Model prop used by a nonstandard component. Default: `modelValue`. |
| `controlClass` | Classes for the control. |
| `formItemClass` | Classes for the grid item. |
| `labelClass` | Classes for the label. |
| `wrapperClass` | Classes for the field wrapper. |

`hideMessage` is intended for composite controls that render issues beside
their own sub-controls. Errors remain in form state and still block validated
submission.

Field names support nested object paths (`profile.email`) and array paths
(`contacts[0].name`). Wrap a name in brackets when dots are literal rather
than path separators (`[profile.email]`).

Treat per-field `collapsible` as static schema configuration. Changing it at
runtime remounts the control, which loses focus, active IME composition, and
open dropdown/popover state.

### Named and Zod rules

```ts
schema: [
  {
    component: 'Input',
    fieldName: 'name',
    rules: 'required',
  },
  {
    component: 'Input',
    fieldName: 'email',
    rules: z.email('Enter a valid email'),
  },
]
```

### Dynamic dependencies

Use dependencies when another value changes a field's visibility, rules,
disabled state, help, or component props:

```ts
{
  component: 'Input',
  fieldName: 'companyName',
  dependencies: {
    triggerFields: ['accountType'],
    resolve: ({ values }) => ({
      show: values.accountType === 'business',
      required: values.accountType === 'business',
      rules: values.accountType === 'business'
        ? z.string().min(1, 'Company name is required')
        : null,
    }),
  },
}
```

The resolver receives:

- `values`: readonly full raw form values.
- `actions`: low-level `FormActions`.
- `controller`: the high-level `formApi`.
- `schema`: field/array-row context.

It may return `componentProps`, `disabled`, `help`, `if`,
`renderComponentContent`, `required`, `rules`, or `show`, synchronously or
asynchronously. Keep dependencies focused on the declared `triggerFields`.

### Groups

Groups organize fields but do not create a value or participate in validation:

```ts
{
  type: 'group',
  name: 'contact',
  title: 'Contact details',
  collapsible: true,
  children: [
    { component: 'Input', fieldName: 'email', label: 'Email' },
    { component: 'Input', fieldName: 'phone', label: 'Phone' },
  ],
}
```

Group options are `children`, `name`, `title`, `extra`, `hide`, `collapsed`,
`collapsible`, `defaultCollapsed`, `formItemClass`, and `wrapperClass`.

### Array fields

```ts
{
  type: 'array',
  fieldName: 'contacts',
  defaultValue: [],
  arrayProps: {
    min: 1,
    max: 5,
    showIndex: true,
    createRow: () => ({ name: '', email: '' }),
  },
  children: [
    { component: 'Input', fieldName: 'name', label: 'Name' },
    { component: 'Input', fieldName: 'email', label: 'Email' },
  ],
}
```

Array child callbacks receive `row`, `rowIndex`, `rowPath`, `arrayField`, the
resolved `fieldName`, and `rootValues` through `FormSchemaContext`.

### Built-in components

The package includes:

`Checkbox`, `CheckboxGroup`, `FileUpload`, `Input`, `InputCurrency`,
`InputDate`, `InputMenu`, `InputNumber`, `InputPassword`, `InputRating`,
`InputTags`, `InputTime`, `PinInput`, `RadioGroup`, `Select`, `SelectMenu`,
`Separator`, `Slider`, `Switch`, `TamanFormFieldArray`, and `Textarea`.

## Validation behavior

The default policy is progressive:

1. Initial typing does not immediately show an error.
2. Blur or submit reveals the error.
3. After an error is revealed, changes revalidate so the message clears while
   the user corrects the value.

Override that policy per field:

```ts
formFieldProps: {
  validateOn: ['blur'], // or ['change'], or ['blur', 'change']
}
```

### Async validation

Use TanStack's `onDynamicAsync` to retain progressive behavior:

```ts
formFieldProps: {
  asyncDebounceMs: 400,
  validators: {
    onDynamicAsync: async ({ value }: { value: string }) => {
      const available = await checkUsername(value);
      return available ? undefined : 'Username is already used';
    },
  },
}
```

Async validation is tracked per field. The field's loading state and the
default submit button remain busy while validation is debouncing or running.
The visible field spinner is delayed briefly so fast validators do not flash.
Clearing validation or resetting the form invalidates stale async results.

## `FormApi` reference

All methods that need the runtime form are asynchronous and wait until `<Form />`
is mounted.

### Choosing the right value operation

| Goal | API |
| --- | --- |
| Change one field in the current interaction | `setFieldValue()` |
| Patch several fields and keep dirty/error metadata | `setValues()` |
| Open a new record/session and clear old metadata | `reset({ values })` |
| Load API-shaped values through a codec | `setSubmitValues()` |
| Read component/raw values | `getRawValues()` |
| Read encoded/submission values | `getValues()` |
| Read both shapes consistently | `getValueSnapshot()` |

### Values

#### `getRawValues()`

```ts
const rawValues = await formApi.getRawValues();
```

Returns a detached clone of the field-component value shape. Use it for UI
drafts or diagnostics that must retain rich values such as dates.

#### `getValues()`

```ts
const values = await formApi.getValues();
```

Returns a detached, codec-encoded value object. This is normally the shape sent
to an API.

#### `getValueSnapshot()`

```ts
const { rawValues, values } = await formApi.getValueSnapshot();
```

Returns raw and encoded values from the same read. Prefer it when both shapes
are needed together.

#### `formatValues(rawValues)`

Encodes an existing raw value object with the configured codec and returns a
clone. Without a codec, it clones the supplied values.

#### `setFieldValue(fieldName, value, shouldValidate?)`

Changes one field. Pass `true` as the third argument when this programmatic
change should validate immediately.

```ts
await formApi.setFieldValue('email', 'ada@example.com', true);
```

#### `setValues(values, filterFields = true, shouldValidate = false)`

Patches the current form session. Plain objects are deep-merged, arrays are
replaced, and input values are cloned. By default, paths not present in the
schema are removed.

```ts
await formApi.setValues({
  profile: { email: 'ada@example.com' },
});
```

Use `filterFields = false` only when the runtime intentionally contains values
that are not represented by the current schema.

`setValues()` preserves touched, dirty, revealed-error, and validation state.
It is therefore appropriate for patches within the same user interaction, not
for opening a different record in a reused drawer or dialog.

#### `setSubmitValues(values, filterFields = true, shouldValidate = false)`

Decodes API/submission-shaped values with the configured codec, then delegates
to `setValues()`. It throws when the form has no codec.

#### `reset(state?, options?)`

Resets values and form metadata, clears revealed errors, and invalidates
in-flight validation.

```ts
// Reset to initial defaults.
await formApi.reset();

// Start a new edit session with populated values.
await formApi.reset({ values: user });

// Use exactly the supplied values instead of merging with initial defaults.
await formApi.reset({ values: replacement }, { force: true });
```

By default, partial reset values are merged over the initial defaults.
`keepDefaultValues` is forwarded to TanStack Form and preserves the existing
default-value baseline.

### Validation and errors

#### `validate()`

Validates all mounted fields and returns:

```ts
interface FormValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}
```

When `scrollToFirstError` is enabled, an invalid result scrolls to its first
field.

#### `validateField(fieldName)`

Validates one field and returns the same result shape. It also honors
`scrollToFirstError`.

#### `isFieldValid(fieldName)`

Returns the current validity of a field. It does not replace validation when
fresh validation is required:

```ts
await formApi.validateField('phoneNumber');
const valid = await formApi.isFieldValid('phoneNumber');
```

#### `setFieldError(fieldName, error?)`

Sets a server/manual error. Omit the error to clear that field's manual error.

```ts
await formApi.setFieldError('email', 'This email is already registered');
```

#### `clearValidation(fieldNames?)`

Clears error metadata and reveal state for all fields, one field, or a list.
It also invalidates in-flight async validation so an old response cannot put
the error back.

```ts
await formApi.clearValidation();
await formApi.clearValidation('email');
await formApi.clearValidation(['email', 'username']);
```

#### `scrollToFirstError(errorsOrFieldName)`

Imperatively scrolls to the first error key or to the supplied field. Normal
callers usually enable `scrollToFirstError` instead of calling this directly.

### Submission

#### `validateAndSubmit()`

The recommended submission API. It validates once, returns `undefined` when
invalid, and otherwise calls `handleSubmit(values, rawValues)` and returns the
formatted values.

```ts
const submitted = await formApi.validateAndSubmit();
if (!submitted) {
  return;
}
```

#### `submit(event?)`

Runs the low-level form submission and then calls `handleSubmit`. The optional
event is prevented and propagation is stopped. Prefer `validateAndSubmit()`
when the callback must be strictly gated on the returned validation result.
`submit()` continues to the configured callback after the low-level submit call;
it does not inspect a validation result itself.

#### `getLatestSubmissionValues()`

Returns the formatted values captured at initial mount or the latest API
submission. This is useful for dirty comparisons and optimistic rollback.

#### `setLatestSubmissionValues(values)`

Overrides that submission baseline. This is an advanced escape hatch for
workflows that persist outside `handleSubmit`.

### Form configuration and schema

#### `getState()`

Returns the current `TamanFormProps` configuration object. This is configuration
state, not field value state.

#### `setState(partialOrUpdater)`

Deep-merges form configuration. Arrays are replaced.

```ts
formApi.setState({ disabled: true });

formApi.setState((previous) => ({
  schema: [...(previous.schema ?? []), newField],
}));
```

Use this for form-level controls or adding/removing schema entries. Use
`updateSchema()` for focused updates to existing fields.

#### `useStore(selector?)`

Returns a readonly Vue ref backed by the configuration store:

```ts
const disabled = formApi.useStore((state) => state.disabled ?? false);
```

Selectors avoid rerendering consumers for unrelated configuration changes.
Field values and errors live in `formApi.form`, described below.

#### `updateSchema(updates)`

Deep-merges updates into existing schema entries matched by `fieldName`.
Every update must contain a valid `fieldName`.

```ts
formApi.updateSchema([
  {
    fieldName: 'role',
    componentProps: { items: nextRoles },
  },
]);
```

#### `removeSchemaByFields(fieldNames)`

Removes schema fields and clears their runtime values.

```ts
await formApi.removeSchemaByFields(['legacyCode', 'internalNote']);
```

### Component access and focus

#### `getFieldComponentRef(fieldName)`

Returns a field's Vue component instance, including the resolved child of an
async component wrapper. Use it only for component-specific imperative methods
such as focusing or opening a menu.

```ts
const select = formApi.getFieldComponentRef<{ triggerRef?: HTMLElement }>('role');
select?.triggerRef?.focus();
```

#### `getFocusedField()`

Returns the field name containing `document.activeElement`, or `undefined`.

### Multiple forms

#### `merge(otherFormApi)`

Builds a chain of form APIs. The returned proxy exposes
`submitAllForm(needMerge = true)`:

```ts
const values = await firstFormApi
  .merge(secondFormApi)
  .merge(thirdFormApi)
  .submitAllForm();
```

Each form is validated. With `needMerge = true`, formatted values are merged
into one object. With `false`, an array of results is returned. Use unique keys
when merging; later forms overwrite duplicate keys.

### Lifecycle methods

`mount()` and `unmount()` are public on the class because the generated form
component uses them, but application code should not call them. Rendering and
unmounting `<Form />` manages this lifecycle automatically.

## Low-level `formApi.form` actions

`formApi.form` is the mounted runtime API. It is populated only after `<Form />`
mounts. Prefer the high-level methods above unless you need reactive field
selectors or array mutation.

### Complete runtime action reference

| API | Purpose |
| --- | --- |
| `values` | Current raw values. |
| `errors` | Current normalized field-error map. |
| `meta` | Current `{ dirty, submitting, valid, validating }` state. |
| `getFieldValue(name)` | Reads one raw value synchronously. |
| `getFieldError(name)` | Reads one normalized error synchronously. |
| `isFieldValid(name)` | Checks whether one field currently has no error. |
| `setFieldValue(name, value, validate?)` | Changes and optionally validates one field. |
| `setValues(values, validate?)` | Replaces the supplied top-level runtime fields without schema filtering or codec handling. |
| `setFieldError(name, error?)` | Sets or clears a manual field error. |
| `clearValidation(names?)` | Clears errors/reveal state and invalidates stale async work. |
| `validate()` | Validates every mounted field. |
| `validateField(name)` | Validates one mounted field. |
| `reset(state?, options?)` | Resets raw values and metadata. |
| `submit()` | Runs TanStack's low-level submit handler. |
| `handleSubmit(callback?)` | Creates an event handler that validates, then calls `callback(rawValues)` when valid. |
| `pushFieldValue(name, value)` | Appends an item to an array field. |
| `removeFieldValue(name, index)` | Removes an item from an array field. |
| `useFieldValue(name)` | Selects one field as a readonly ref. |
| `useFieldValues(names)` | Selects several fields as a readonly ref. |
| `useValues()` | Selects all raw values as a readonly ref. |
| `useFieldError(name)` | Selects one visible error as a readonly ref. |
| `useFieldValidating(name)` | Selects one field's pending-validation state. |
| `useSelector(selector)` | Selects custom runtime state as a readonly ref. |
| `fieldComponent` | Internal runtime field component used by the renderer. |

The low-level `setValues()` is a shallow top-level operation. The high-level
`formApi.setValues()` additionally deep-merges plain objects, clones inputs,
filters values against the schema, and supports codecs through
`setSubmitValues()`.

### Reactive selectors

These methods return readonly Vue refs and only update for the selected state:

| API | Result |
| --- | --- |
| `useFieldValue(name)` | One field value. |
| `useFieldValues(names)` | Values for several fields. |
| `useValues()` | The full raw value object. |
| `useFieldError(name)` | One field's visible error. |
| `useFieldValidating(name)` | Whether a field is debouncing or validating. |
| `useSelector(selector)` | A custom selection from `{ values, errors, meta }`. |

```ts
onMounted(() => {
  const usernamePending = formApi.form.useFieldValidating('username');
  watch(usernamePending, (pending) => console.log({ pending }));
});
```

### Array mutation

```ts
formApi.form.pushFieldValue('contacts', { name: '', email: '' });
await formApi.form.removeFieldValue('contacts', 0);
```

### Synchronous state

The mounted runtime also exposes:

- `values`: current raw values.
- `errors`: current field error map.
- `meta`: `{ dirty, submitting, valid, validating }`.
- `getFieldValue(name)` and `getFieldError(name)`.
- `isFieldValid(name)`.

It also mirrors reset, value, error, validation, and submission operations used
by the high-level API. Prefer `formApi` for those operations because it handles
codecs, schema filtering, scrolling, and submission callbacks.

## Slots

The generated form component supports:

| Slot | Props | Use case |
| --- | --- | --- |
| `default` | `formApi`, `values`, `shapes` | Completely custom layout/actions. |
| Field-name slot | Field slot props below | Replace one field's rendering. |
| `submit-before` | `formApi`, `values` | Content before the submit button. |
| `reset-before` | `formApi`, `values` | Content before the reset button. |
| `expand-before` | `formApi`, `values` | Content before the expand control. |
| `expand-after` | `formApi`, `values` | Content after the expand control. |

A field-name slot receives `componentField`, `componentProps`, `disabled`,
`error`, `field`, `isInValid`, `issues`, `modelValue`, `name`, `formApi`, and
the full raw `values`.

```vue
<Form>
  <template #email="{ componentField, error }">
    <MyEmailInput v-bind="componentField" />
    <p v-if="error" role="alert">
      {{ error }}
    </p>
  </template>
</Form>
```

When a custom `default` slot is supplied, the built-in action and collapse
controls are not rendered. Provide your own collapse control if schema entries
use top-level `collapsed: true`.

## Codecs

A codec keeps component-friendly values separate from transport values:

```ts
interface FilterFormValues {
  period: [number, number];
  tags: string[];
}

interface FilterSubmitValues {
  startTime: number;
  endTime: number;
  tags: string;
}

const codec: FormCodec<FilterFormValues, FilterSubmitValues> = {
  decode(values) {
    return {
      period: [values.startTime, values.endTime],
      tags: values.tags.split(','),
    };
  },
  encode(values) {
    return {
      startTime: values.period[0],
      endTime: values.period[1],
      tags: values.tags.join(','),
    };
  },
};
```

Exports include `calendarDateCodec`, `timeCodec`, `calendarDateTimeCodec`, and
their `create...Codec()` factories. Codec failures throw `FormCodecError` with
`phase` set to `encode` or `decode` and the original error in `cause`.

## Common use cases

### Create form

```ts
await formApi.reset();
```

This restores schema defaults and removes validation left by an earlier create
attempt.

### Edit form in a reused drawer or dialog

```ts
onOpenChange(isOpen) {
  if (!isOpen) return;

  const record = drawerApi.getData();
  formApi.reset({ values: record });
}
```

Use `reset({ values })`, not `setValues()`, because opening a record is a new
interaction and should not inherit touched fields or errors from the previous
record.

### Patch live values without resetting the interaction

```ts
await formApi.setValues({
  address: { country: 'ID' },
});
```

This preserves dirty, touched, and revealed validation state.

### Map server validation errors

```ts
const result = await saveUser(await formApi.getValues());

for (const [field, message] of Object.entries(result.fieldErrors ?? {})) {
  await formApi.setFieldError(field, message);
}
```

Clear a server error with `setFieldError(field)` or clear the session's errors
with `clearValidation()`.

### Disable while saving

```ts
formApi.setState({ disabled: true });
try {
  await formApi.validateAndSubmit();
} finally {
  formApi.setState({ disabled: false });
}
```

### Validate one step in a wizard

```ts
const result = await Promise.all(
  currentStepFields.map((field) => formApi.validateField(field)),
);

if (result.every(({ valid }) => valid)) {
  goToNextStep();
}
```

## Exported utilities and types

Runtime exports:

- `useTamanForm`, `setupTamanForm`, `isEmptyFormValue`.
- `calendarDateCodec`, `timeCodec`, `calendarDateTimeCodec`.
- `createCalendarDateCodec`, `createTimeCodec`,
  `createCalendarDateTimeCodec`.
- `FormCodecError`.
- `z`, the Zod namespace.

Key type exports:

- `ExtendedFormApi`, `FormActions`, `FormValues`, `FormValueSnapshot`.
- `FormCodec`, `FormCodecPhase`, `CalendarDateCodecOptions`.
- `TamanFormProps`, `TamanFormSchema`, `TamanFormFieldSchema`,
  `TamanFormGroupSchema`.
- `TamanFormComponent`, `TamanFormSlots`, `TamanFormFieldSlotProps`,
  `TamanFormDefaultSlotProps`, `TamanFormActionSlotProps`.
- `FormBaseComponentType`, `BuiltInFormComponentType`,
  `BuiltInFormComponentPropsMap`, `TamanFormResolvedComponentProps`.
