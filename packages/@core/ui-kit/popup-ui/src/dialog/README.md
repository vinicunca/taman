# `useTamanDialog`

Globally-hosted dialogs: open a dialog from anywhere in your business logic — no component tag in the caller's template.

```ts
// in a click handler, right where the business flow needs it:
const result = await userFormDialog.setData(row).open<FormResult>();
if (result) {
  gridApi.query();
}
```

## Table of contents

- [Setup](#setup)
- [Quick start](#quick-start)
- [Promise-based open/close](#promise-based-openclose)
- [Sharing data](#sharing-data)
- [Reactive state (`useStore`)](#reactive-state-usestore)
- [Locking during submit](#locking-during-submit)
- [Dialog props](#dialog-props)
- [DialogApi reference](#dialogapi-reference)
- [Lifecycle callbacks](#lifecycle-callbacks)
- [Nested dialogs](#nested-dialogs)
- [Gotchas](#gotchas)
- [Migrating from `useVbenModal`](#migrating-from-usevbenmodal)

## Setup

Mount the host **once** at the app root. Every dialog in the app renders through it.

```vue
<!-- apps/better-auth-front/src/app.vue (already done for better-auth-front) -->
<script lang="ts" setup>
import { TamanDialogProvider } from "@taman/common-ui";
</script>

<template>
  <PApp>
    <RouterView />
    <TamanDialogProvider />
  </PApp>
</template>
```

Other apps consuming `@taman-core/popup-ui` need the same one-line mount in their root component. Mount it exactly once — a second host would render every dialog twice.

## Quick start

A dialog has two sides:

**1. The content component** — a standalone SFC that owns the dialog body. It calls `useTamanDialog()` with **no arguments** and renders the returned `<Dialog>` in its template (this is where the chrome comes from):

```vue
<!-- user-form.vue -->
<script lang="ts" setup>
import { useTamanDialog } from "@taman/common-ui";

const [Dialog, dialogApi] = useTamanDialog({
  async onConfirm() {
    const values = await getFormValues();
    dialogApi.lock();
    try {
      await saveUser(dialogApi.getData().id, values);
      dialogApi.close(values); // resolves the caller's open() promise
    } catch {
      dialogApi.unlock();
    }
  },
  onOpenChange(isOpen) {
    if (isOpen) {
      const row = dialogApi.getData();
      // populate the form from row…
    }
  },
});
</script>

<template>
  <Dialog title="Edit user">
    <!-- dialog body -->
  </Dialog>
</template>
```

**2. The caller** — registers the content component and gets the api back. No template tag anywhere:

```vue
<!-- list.vue -->
<script lang="ts" setup>
import { useTamanDialog } from "@taman/common-ui";
import UserForm from "./modules/user-form.vue";

const userFormDialog = useTamanDialog({
  connectedComponent: UserForm,
  destroyOnClose: true,
});

async function onEdit(row: SystemUser) {
  const saved = await userFormDialog.setData(row).open();
  if (saved) {
    gridApi.query();
  }
}
</script>
```

Options passed on either side are merged (caller options + content options); callbacks like `onOpenChange` are chained so both sides fire.

## Promise-based open/close

`open()` returns a promise that settles when the dialog closes:

```ts
const result = await api.open<MyResult>();
```

- `close(value)` resolves the promise with `value`.
- Any dismissal — Esc, overlay click, the default cancel button, `close()` with no argument — resolves with `undefined`.
- If `onBeforeClose` vetoes the close (returns `false`), the promise stays pending and the dialog stays open.
- Calling `open()` again while already open returns the **same** pending promise.
- Fire-and-forget is fine: just don't `await` it.

```ts
const confirmed = await confirmDialog.open<boolean>();
if (!confirmed) return; // dismissed or cancelled
```

## Sharing data

`setData`/`getData` pass a payload from caller to content (chainable):

```ts
// caller
api.setData({ id: row.id, mode: "edit" }).open();

// content component
const { id, mode } = dialogApi.getData<{ id: string; mode: string }>();
```

The payload is shared by reference between both sides — the caller's api and the content's api are the same underlying object.

## Reactive state (`useStore`)

Both sides can observe the dialog's reactive state:

```ts
const isOpen = dialogApi.useStore((s) => s.isOpen);
const title = dialogApi.useStore((s) => s.title);
```

And mutate it at any time with `setState`:

```ts
api.setState({ title: `Edit ${row.name}`, confirmDisabled: !isValid });
```

## Locking during submit

`lock()` disables the cancel button, marks confirm as loading, covers the body with a spinner, and blocks Esc/overlay dismissal until `unlock()`:

```ts
async onConfirm() {
  dialogApi.lock();
  try {
    await save();
    dialogApi.close(result);
  } catch {
    dialogApi.unlock(); // keep the dialog open for retry
  }
}
```

## Dialog props

`DialogProps` is identical to the modal's props (same names, same defaults). Set them as props on `<Dialog>` in the content template, as options to `useTamanDialog`, or later via `setState`:

`title`, `titleTooltip`, `description`, `class`/`contentClass`/`headerClass`/`footerClass`, `header`/`footer` (show/hide), `showConfirmButton`/`showCancelButton`, `confirmText`/`cancelText`, `confirmLoading`/`confirmDisabled`, `loading`, `closable`, `closeOnClickModal`, `closeOnPressEscape`, `centered`, `bordered`, `draggable`, `overflow`, `fullscreen`/`fullscreenButton`, `modal` (overlay), `overlayBlur`, `zIndex`, `animationType`, `appendToMain`, `destroyOnClose`, `openAutoFocus`, `submitting`.

Slots on `<Dialog>`: default (body), `title`, `titleTooltip`, `description`, `prepend-footer`, `center-footer`, `append-footer`, `footer`, `confirmText`, `cancelText`.

App-wide defaults are set on the provider (lowest merge priority — per-dialog options and template props always win; read at dialog creation time, not reactive):

```vue
<TamanDialogProvider :centered="true" :fullscreen-button="false" />
```

## DialogApi reference

| Member            | Signature                                      | Notes                           |
| ----------------- | ---------------------------------------------- | ------------------------------- |
| `open`            | `open<T>(): Promise<T \| undefined>`           | Opens; resolves on close        |
| `close`           | `close(result?: unknown): Promise<void>`       | Runs `onBeforeClose` veto first |
| `setData`         | `setData<T>(payload: T): this`                 | Chainable                       |
| `getData`         | `getData<T>(): T`                              |                                 |
| `setState`        | `setState(partial \| (prev) => partial): this` | Chainable                       |
| `useStore`        | `useStore(selector?): Readonly<Ref>`           | Reactive selector               |
| `lock` / `unlock` | `lock(isLocked = true): this`                  | Submit lock                     |
| `store`           | `Store<DialogState>`                           | Raw store (prefer `useStore`)   |

## Lifecycle callbacks

All passed as options to `useTamanDialog` (either side):

- `onBeforeClose(): boolean | Promise<boolean | undefined>` — return `false` to veto the close.
- `onCancel()` — cancel button clicked; if omitted, the default is `close()`.
- `onConfirm()` — confirm button clicked. Closing is **your** job (call `close(result)`).
- `onOpenChange(isOpen: boolean)` — every open/close transition.
- `onOpened()` / `onClosed()` — after the open/close animation completes.

## Nested dialogs

A dialog opened from inside another dialog's content is just another registered dialog:

```ts
// inside parent-content.vue
const childDialog = useTamanDialog({ connectedComponent: ChildContent });

async function pickItem() {
  const item = await childDialog.open();
}
```

Do **not** call the inline (argument-less) form twice in one content component — it throws.

## Gotchas

- **`connectedComponent` is required** on the caller side. There is no call-site template, so inline slot content is impossible — every dialog body is its own SFC. Calling `useTamanDialog()` inline outside a content component throws.
- **Call it in `setup` (or an `effectScope`)**. The dialog auto-unregisters when the owning scope is disposed (page unmount). Outside any scope it warns and stays registered forever — including duplicates on every HMR reload.
- **`open()` before the host has rendered** the dialog logs a warning and resolves `undefined`. If you see it, `<TamanDialogProvider />` is missing from your root App component.
- **Keep-alive tab switch closes the dialog.** When the calling page is deactivated (tab navigation in the better-auth-front layout), the dialog closes and a pending `open()` promise resolves `undefined`. This includes `appendToMain` dialogs (the old modal kept those open across tab switches).
- **Don't mount two hosts** — every dialog would render twice.
- **`destroyOnClose`** re-creates the content component after each close (fresh state per open). In the tick right after the close animation, calls on the api still target the old instance — avoid `open()` in `onClosed`.

## Migrating from `useVbenModal`

| `useVbenModal` (connected)                                              | `useTamanDialog`                                                             |
| ----------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `const [FormModal, api] = useVbenModal({ connectedComponent: Form })`   | `const api = useTamanDialog({ connectedComponent: Form })`                   |
| `<FormModal @success="..." />` in the caller template                   | _(delete it — nothing to mount)_                                             |
| events emitted to the caller via the mounted tag                        | return a value: `close(result)` → `await api.open()`                         |
| inner side: `const [Modal, modalApi] = useVbenModal({...})` + `<Modal>` | same shape: `const [Dialog, dialogApi] = useTamanDialog({...})` + `<Dialog>` |
| `api.open()` returns `void`                                             | returns a promise (safe to ignore)                                           |

Everything else — `setData`/`getData`, `lock`/`unlock`, `setState`/`useStore`, props, slots, callbacks — carries over unchanged.

Note: component events (`@success` in the old pattern) have no mount point anymore. Prefer resolving a value through `close(result)`; if you need multiple signals, pass callbacks in via `setData`.
