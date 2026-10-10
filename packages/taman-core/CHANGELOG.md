# @vinicunca/taman-core

## 0.1.1

### Patch Changes

- 55db26a: Remove the `only: 'onboarding'` route auth mode. No router guard ever handled it, so such routes behaved like `only: 'user'`.
