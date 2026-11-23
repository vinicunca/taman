# @vinicunca/taman-ui

## 0.4.0

### Minor Changes

- 9c505f8: Form styling hooks are now data attributes instead of class names (breaking): `.form-group`, `.form-group-header`, `.form-group-trigger` and `.form-group-title` are now `[data-form-group="root" | "header" | "trigger" | "title"]`, and the group's `extra` gets a new `[data-form-group="extra"]` hook. `.form-collapse-trigger` is now `[data-form-collapse="trigger"]`, and `.form-valid-error` / `.form-is-required` are now `[data-invalid]` / `[data-required]` on the form item. Spacing in forms, descriptions, the auth form and tabs uses flex `gap` instead of margins. `TamanRenderContent` now renders VNodes, and its accepted content type is exported as `TamanRenderContentType`; `TamanAlertProps.content` and `footer` accept it. Generated projects keep `AppCard` at its natural height in flex columns.

## 0.3.0

### Minor Changes

- cefb596: Add a `zodErrorMap` option to `setupTamanForm`. It sets the message for each issue a zod field rule raises and receives the field's context (`label`, `name`), like named rules do. Messages written on a schema still take precedence, and returning `undefined` keeps zod's own message. Export the `FormRuleContext` and `FormZodErrorMap` types.
- cefb596: Replace `TamanButtonCheckGroup` with `TamanToggleGroup`, a wrapper around pohon's `PToggleGroup`: it accepts every `PToggleGroup` prop and slot, and adds `allowClear`, `maxCount`, `beforeChange` and `showIcon` on top. Breaking changes:
  
  - `TamanButtonCheckGroup` is removed. Its types are renamed: `TamanToggleGroupItem`, `TamanToggleGroupModel`, `TamanToggleGroupProps` and `TamanToggleGroupValue`. `TamanButtonCheckGroupOption` is removed.
  - `options` is now `items` (`TamanToggleGroupItem`, which extends `ToggleGroupItem`), and labels are plain strings.
  - `multiple` is now `type: 'single' | 'multiple'`.
  - The `btnClick` event is renamed to `itemClick`.
  - The `#icon` slot is replaced by the forwarded `#leading` slot (`{ item, pressed, ui }`, with `item.loading` set while `beforeChange` is pending), or by setting `leadingIcon` on an item. The `#option` slot is replaced by the forwarded `#default` slot (`{ item, index, pressed, ui }`).
  - Requires `pohon-ui` 2.8 or later.

## 0.2.1

### Patch Changes

- 6b185cf: form classes

## 0.2.0

### Minor Changes

- 8035998: update

### Patch Changes

- 8035998: Fix popup icon rendering and spacing, preserve the default alert centering behavior, and use TamanIcon consistently in forms, menus, dialogs, and drawers. Read async Standard Schema validators without Vue proxies to avoid errors with Zod internals.

## 0.1.4

### Patch Changes

- 679168f: Hide dialogs and drawers on inactive cached pages while preserving their open state and drafts. Restore them without repeating opening callbacks, and release their interaction layers while inactive.
  
  Keep scrolling locked until the last overlay closes and restore original scrollbar compensation styles. Settle every concurrent StateHandler waiter, including rejecting pending waiters when reset.
- Updated dependencies [679168f]
  - @vinicunca/taman-core@0.1.3

## 0.1.3

### Patch Changes

- fix scrollbar mask

## 0.1.2

### Patch Changes

- variant

## 0.1.1

### Patch Changes

- 5d4ebe8: taman-ui
