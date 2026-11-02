# @vinicunca/taman-core

## 0.1.3

### Patch Changes

- 679168f: Hide dialogs and drawers on inactive cached pages while preserving their open state and drafts. Restore them without repeating opening callbacks, and release their interaction layers while inactive.
  
  Keep scrolling locked until the last overlay closes and restore original scrollbar compensation styles. Settle every concurrent StateHandler waiter, including rejecting pending waiters when reset.

## 0.1.2

### Patch Changes

- auth gates

## 0.1.1

### Patch Changes

- 55db26a: Remove the `only: 'onboarding'` route auth mode. No router guard ever handled it, so such routes behaved like `only: 'user'`.
