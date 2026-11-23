# create-taman

## 0.2.1

### Patch Changes

- 9c505f8: Form styling hooks are now data attributes instead of class names (breaking): `.form-group`, `.form-group-header`, `.form-group-trigger` and `.form-group-title` are now `[data-form-group="root" | "header" | "trigger" | "title"]`, and the group's `extra` gets a new `[data-form-group="extra"]` hook. `.form-collapse-trigger` is now `[data-form-collapse="trigger"]`, and `.form-valid-error` / `.form-is-required` are now `[data-invalid]` / `[data-required]` on the form item. Spacing in forms, descriptions, the auth form and tabs uses flex `gap` instead of margins. `TamanRenderContent` now renders VNodes, and its accepted content type is exported as `TamanRenderContentType`; `TamanAlertProps.content` and `footer` accept it. Generated projects keep `AppCard` at its natural height in flex columns.

## 0.2.0

### Minor Changes

- 8035998: update

### Patch Changes

- 8035998: Update the pinned project template with tab actions and cached routes that preserve tab identity, safe closing of tabs whose keys contain percent signs, and consistent shell icons. Include the shared Vitest setup and mocks in generated projects.
