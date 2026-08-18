# `useTamanDrawer`

Globally-hosted drawers: open a drawer from anywhere in your business logic — no component tag in the caller's template.

```ts
// in a click handler, right where the business flow needs it:
const result = await userFormDrawer.setData(row).open<FormResult>();
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
- [Drawer props](#drawer-props)
- [DrawerApi reference](#drawerapi-reference)
- [Lifecycle callbacks](#lifecycle-callbacks)
- [Nested drawers](#nested-drawers)
- [Gotchas](#gotchas)
- [Migrating from `useVbenDrawer`](#migrating-from-usevbendrawer)

## Setup

Mount the host **once** at the app root. Every drawer in the app renders through it.

```vue
<!-- apps/better-auth-front/src/app.vue (already done for better-auth-front) -->
<script lang="ts" setup>
import { TamanDrawerProvider } from "@taman/common-ui";
</script>

<template>
  <PApp>
    <RouterView />
    <TamanDrawerProvider />
  </PApp>
</template>
```

Other apps consuming `@taman-core/popup-ui` need the same one-line mount in their root component. Mount it exactly once — a second host would render every drawer twice.

## Quick start

A drawer has two sides:

**1. The content component** — a standalone SFC that owns the drawer body. It calls `useTamanDrawer()` with **no arguments** and renders the returned `<Drawer>` in its template (this is where the chrome comes from):

```vue
<!-- user-form.vue -->
<script lang="ts" setup>
import { useTamanDrawer } from "@taman/common-ui";

const [Drawer, drawerApi] = useTamanDrawer({
  async onConfirm() {
    const values = await getFormValues();
    drawerApi.lock();
    try {
      await saveUser(drawerApi.getData().id, values);
      drawerApi.close(values); // resolves the caller's open() promise
    } catch {
      drawerApi.unlock();
    }
  },
  onOpenChange(isOpen) {
    if (isOpen) {
      const row = drawerApi.getData();
      // populate the form from row…
    }
  },
});
</script>

<template>
  <Drawer title="Edit user">
    <!-- drawer body -->
  </Drawer>
</template>
```

**2. The caller** — registers the content component and gets the api back. No template tag anywhere:

```vue
<!-- list.vue -->
<script lang="ts" setup>
import { useTamanDrawer } from "@taman/common-ui";
import UserForm from "./modules/user-form.vue";

const userFormDrawer = useTamanDrawer({
  connectedComponent: UserForm,
  destroyOnClose: true,
});

async function onEdit(row: SystemUser) {
  const saved = await userFormDrawer.setData(row).open();
  if (saved) {
    gridApi.query();
  }
}
</script>
```

Options passed on either side are merged (caller options + content options); callbacks like `onOpenChange` are chained so both sides fire.

## Promise-based open/close

`open()` returns a promise that settles when the drawer closes:

```ts
const result = await api.open<MyResult>();
```

- `close(value)` resolves the promise with `value`.
- Any dismissal — Esc, overlay click, the default cancel button, `close()` with no argument — resolves with `undefined`.
- If `onBeforeClose` vetoes the close (returns `false`), the promise stays pending and the drawer stays open.
- Calling `open()` again while already open returns the **same** pending promise.
- Fire-and-forget is fine: just don't `await` it.

```ts
const confirmed = await confirmDrawer.open<boolean>();
if (!confirmed) return; // dismissed or cancelled
```

## Sharing data

`setData`/`getData` pass a payload from caller to content (chainable):

```ts
// caller
api.setData({ id: row.id, mode: "edit" }).open();

// content component
const { id, mode } = drawerApi.getData<{ id: string; mode: string }>();
```

The payload is shared by reference between both sides — the caller's api and the content's api are the same underlying object.

## Reactive state (`useStore`)

Both sides can observe the drawer's reactive state:

```ts
const isOpen = drawerApi.useStore((s) => s.isOpen);
const title = drawerApi.useStore((s) => s.title);
```

And mutate it at any time with `setState`:

```ts
api.setState({ title: `Edit ${row.name}`, placement: "left" });
```

## Locking during submit

`lock()` disables the cancel button, marks confirm as loading, covers the body with a spinner, and blocks Esc/overlay dismissal until `unlock()`:

```ts
async onConfirm() {
  drawerApi.lock();
  try {
    await save();
    drawerApi.close(result);
  } catch {
    drawerApi.unlock(); // keep the drawer open for retry
  }
}
```

## Drawer props

Set them as props on `<Drawer>` in the content template, as options to `useTamanDrawer`, or later via `setState`:

`title`, `titleTooltip`, `description`, `class`/`contentClass`/`headerClass`/`footerClass`, `header`/`footer` (show/hide), `showConfirmButton`/`showCancelButton`, `confirmText`/`cancelText`, `confirmLoading`, `loading`, `closable`, `closeIconPlacement`, `closeOnClickModal`, `closeOnPressEscape`, `placement`, `modal` (overlay), `overlayBlur`, `zIndex`, `appendToMain`, `destroyOnClose`, `openAutoFocus`, `submitting`.

Slots on `<Drawer>`: default (body), `close-icon`, `title`, `description`, `extra`, `prepend-footer`, `center-footer`, `append-footer`, `footer`, `confirmText`, `cancelText`.

App-wide defaults are set on the provider (lowest merge priority — per-drawer options and template props always win; read at drawer creation time, not reactive):

```vue
<TamanDrawerProvider placement="left" :closable="false" />
```

## DrawerApi reference

| Member            | Signature                                      | Notes                           |
| ----------------- | ---------------------------------------------- | ------------------------------- |
| `open`            | `open<T>(): Promise<T \| undefined>`           | Opens; resolves on close        |
| `close`           | `close(result?: unknown): Promise<void>`       | Runs `onBeforeClose` veto first |
| `setData`         | `setData<T>(payload: T): this`                 | Chainable                       |
| `getData`         | `getData<T>(): T`                              |                                 |
| `setState`        | `setState(partial \| (prev) => partial): this` | Chainable                       |
| `useStore`        | `useStore(selector?): Readonly<Ref>`           | Reactive selector               |
| `lock` / `unlock` | `lock(isLocked = true): this`                  | Submit lock                     |
| `store`           | `Store<TamanDrawerState>`                      | Raw store (prefer `useStore`)   |

## Lifecycle callbacks

All passed as options to `useTamanDrawer` (either side):

- `onBeforeClose(): boolean | Promise<boolean | undefined>` — return `false` to veto the close.
- `onCancel()` — cancel button clicked; if omitted, the default is `close()`.
- `onConfirm()` — confirm button clicked. Closing is **your** job (call `close(result)`).
- `onOpenChange(isOpen: boolean)` — every open/close transition.
- `onOpened()` / `onClosed()` — after the open/close animation completes.

## Nested drawers

A drawer opened from inside another drawer's content is just another registered drawer:

```ts
// inside parent-content.vue
const childDrawer = useTamanDrawer({ connectedComponent: ChildContent });

async function pickItem() {
  const item = await childDrawer.open();
}
```

Do **not** call the inline (argument-less) form twice in one content component — it throws.

## Gotchas

- **`connectedComponent` is required** on the caller side. There is no call-site template, so inline slot content is impossible — every drawer body is its own SFC. Calling `useTamanDrawer()` inline outside a content component throws.
- **Call it in `setup` (or an `effectScope`)**. The drawer auto-unregisters when the owning scope is disposed (page unmount). Outside any scope it warns and stays registered forever — including duplicates on every HMR reload.
- **`open()` before the host has rendered** the drawer logs a warning and resolves `undefined`. If you see it, `<TamanDrawerProvider />` is missing from your root App component.
- **Keep-alive tab switch closes the drawer.** When the calling page is deactivated (tab navigation in the better-auth-front layout), the drawer closes and a pending `open()` promise resolves `undefined`. This includes `appendToMain` drawers (the old drawer kept those open across tab switches).
- **Don't mount two hosts** — every drawer would render twice.
- **`destroyOnClose`** re-creates the content component after each close (fresh state per open). In the tick right after the close animation, calls on the api still target the old instance — avoid `open()` in `onClosed`.

## Migrating from `useVbenDrawer`

| `useVbenDrawer` (connected)                                                 | `useTamanDrawer`                                                             |
| --------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `const [FormDrawer, api] = useVbenDrawer({ connectedComponent: Form })`     | `const api = useTamanDrawer({ connectedComponent: Form })`                   |
| `<FormDrawer @success="..." />` in the caller template                      | _(delete it — nothing to mount)_                                             |
| events emitted to the caller via the mounted tag                            | return a value: `close(result)` → `await api.open()`                         |
| inner side: `const [Drawer, drawerApi] = useVbenDrawer({...})` + `<Drawer>` | same shape: `const [Drawer, drawerApi] = useTamanDrawer({...})` + `<Drawer>` |
| `api.open()` returns `void`                                                 | returns a promise (safe to ignore)                                           |

Everything else — `setData`/`getData`, `lock`/`unlock`, `setState`/`useStore`, props, slots, callbacks — carries over unchanged.

Note: component events (`@success` in the old pattern) have no mount point anymore. Prefer resolving a value through `close(result)`; if you need multiple signals, pass callbacks in via `setData`.
