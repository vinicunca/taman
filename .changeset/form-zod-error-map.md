---
'@vinicunca/taman-ui': minor
---

Add a `zodErrorMap` option to `setupTamanForm`. It sets the message for each issue a zod field rule raises and receives the field's context (`label`, `name`), like named rules do. Messages written on a schema still take precedence, and returning `undefined` keeps zod's own message. Export the `FormRuleContext` and `FormZodErrorMap` types.
