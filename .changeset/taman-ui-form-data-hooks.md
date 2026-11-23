---
'@vinicunca/taman-ui': minor
'create-taman': patch
---

Form styling hooks are now data attributes instead of class names (breaking): `.form-group`, `.form-group-header`, `.form-group-trigger` and `.form-group-title` are now `[data-form-group="root" | "header" | "trigger" | "title"]`, and the group's `extra` gets a new `[data-form-group="extra"]` hook. `.form-collapse-trigger` is now `[data-form-collapse="trigger"]`, and `.form-valid-error` / `.form-is-required` are now `[data-invalid]` / `[data-required]` on the form item. Spacing in forms, descriptions, the auth form and tabs uses flex `gap` instead of margins. `TamanRenderContent` now renders VNodes, and its accepted content type is exported as `TamanRenderContentType`; `TamanAlertProps.content` and `footer` accept it. Generated projects keep `AppCard` at its natural height in flex columns.
