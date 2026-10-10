---
"@vinicunca/taman-core": patch
---

Remove the `only: 'onboarding'` route auth mode. No router guard ever handled it, so such routes behaved like `only: 'user'`.
