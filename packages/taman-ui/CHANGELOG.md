# @vinicunca/taman-ui

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
