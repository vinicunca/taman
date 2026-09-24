# Graph Report - taman-ui  (2026-09-24)

## Corpus Check
- 82 files · ~6,594 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 288 nodes · 346 edges · 15 communities
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 2 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `3ae81f17`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- components/index.ts
- taman-input-date.vue
- taman-input-password.vue
- dependencies
- dialog-content.vue
- form/index.ts
- alert-dialog/index.ts
- dialog/index.ts
- sheet/index.ts
- sheet-content.vue
- scrollbar.vue
- scroll-area.vue
- tsconfig.json
- taman-file-upload.vue
- taman-logo.vue

## God Nodes (most connected - your core abstractions)
1. `formatCalendarInputValue()` - 6 edges
2. `useDialogStateEvents()` - 6 edges
3. `passwordStrengthScore()` - 5 edges
4. `useFormField()` - 5 edges
5. `isCalendarInputComplete()` - 4 edges
6. `FORM_ITEM_INJECTION_KEY` - 4 edges
7. `FORM_FIELD_INJECTION_KEY` - 4 edges
8. `TamanFileUploadProps` - 3 edges
9. `isDateRange()` - 3 edges
10. `TamanInputDateProps` - 3 edges

## Surprising Connections (you probably didn't know these)
- `inputValue` --calls--> `formatCalendarInputValue()`  [EXTRACTED]
  packages/@core/ui-kit/taman-ui/src/components/input-date/taman-input-date.vue → packages/@core/ui-kit/taman-ui/src/components/input-date/format-calendar-input-value.ts
- `score` --calls--> `passwordStrengthScore()`  [EXTRACTED]
  packages/@core/ui-kit/taman-ui/src/components/input/taman-input-password.vue → packages/@core/ui-kit/taman-ui/src/components/input/password-strength.ts

## Import Cycles
- None detected.

## Communities (15 total, 0 thin omitted)

### Community 0 - "components/index.ts"
Cohesion: 0.05
Nodes (19): props, slots, backTopStyle, container, el, handleScrollThrottled, props, visible (+11 more)

### Community 1 - "taman-input-date.vue"
Cohesion: 0.11
Nodes (20): CalendarDateRange, formatCalendarInputValue(), isCalendarInputComplete(), isDateRange(), toDate(), { currentLocale }, DateRange, DateValue (+12 more)

### Community 2 - "taman-input-password.vue"
Cohesion: 0.11
Nodes (20): isPasswordStrong(), PASSWORD_STRENGTH_CHECKS, PASSWORD_STRENGTH_MAX, passwordStrengthScore(), displayValue, formatOptions, formatter, inputProps (+12 more)

### Community 3 - "dependencies"
Cohesion: 0.08
Nodes (24): akar, @internationalized/date, @internationalized/number, dependencies, akar, @internationalized/date, @internationalized/number, pohon-ui (+16 more)

### Community 4 - "dialog-content.vue"
Cohesion: 0.10
Nodes (20): contentRef, delegatedProps, emits, forwarded, { handleAnimationEvent }, props, {
  position = 'fixed',
  zIndex,
  overlayBlur,
  open,
}, contentRef (+12 more)

### Community 5 - "form/index.ts"
Cohesion: 0.14
Nodes (15): {
  error,
  formItemId,
  formDescriptionId,
  formMessageId,
}, { formDescriptionId }, props, { dirty, error, name, touched, valid }, props, id, props, { error, formItemId } (+7 more)

### Community 6 - "alert-dialog/index.ts"
Cohesion: 0.10
Nodes (11): props, props, delegatedProps, forwardedProps, props, emits, forwarded, props (+3 more)

### Community 7 - "dialog/index.ts"
Cohesion: 0.08
Nodes (13): props, delegatedProps, forwardedProps, props, emits, forwarded, props, delegatedProps (+5 more)

### Community 8 - "sheet/index.ts"
Cohesion: 0.12
Nodes (9): props, delegatedProps, props, emits, forwarded, props, delegatedProps, forwardedProps (+1 more)

### Community 9 - "sheet-content.vue"
Cohesion: 0.16
Nodes (12): contentRef, delegatedProps, emits, forwarded, { handleAnimationEvent }, isAppendToBody(), position, props (+4 more)

### Community 10 - "scrollbar.vue"
Cohesion: 0.17
Nodes (12): computedShadowClasses, emits, handleScroll(), isAtBottom, isAtLeft, isAtRight, isAtTop, Props (+4 more)

### Community 11 - "scroll-area.vue"
Cohesion: 0.33
Nodes (4): delegatedProps, props, delegatedProps, props

### Community 12 - "tsconfig.json"
Cohesion: 0.20
Nodes (9): node_modules, src, @taman/tsconfig/web.json, compilerOptions, allowArbitraryExtensions, exclude, extends, include (+1 more)

### Community 13 - "taman-file-upload.vue"
Cohesion: 0.31
Nodes (5): FileUploadSlotFiles, modelValue, props, rootProps, TamanFileUploadProps

### Community 14 - "taman-logo.vue"
Cohesion: 0.29
Nodes (5): fullLogoStyle, logoSrc, props, shouldShowText, shouldUseFullLogo

## Knowledge Gaps
- **154 isolated node(s):** `name`, `type`, `version`, `exports`, `main` (+149 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 168 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `useDialogStateEvents()` connect `dialog-content.vue` to `sheet-content.vue`?**
  _High betweenness centrality (0.027) - this node is a cross-community bridge._
- **What connects `name`, `type`, `version` to the rest of the system?**
  _154 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `components/index.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05398110661268556 - nodes in this community are weakly interconnected._
- **Should `taman-input-date.vue` be split into smaller, more focused modules?**
  _Cohesion score 0.10541310541310542 - nodes in this community are weakly interconnected._
- **Should `taman-input-password.vue` be split into smaller, more focused modules?**
  _Cohesion score 0.11384615384615385 - nodes in this community are weakly interconnected._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.08 - nodes in this community are weakly interconnected._
- **Should `dialog-content.vue` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._