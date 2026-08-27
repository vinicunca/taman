# Graph Report - form-ui  (2026-08-27)

## Corpus Check
- 44 files · ~22,484 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 354 nodes · 660 edges · 17 communities
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 4 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `215946cf`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]

## God Nodes (most connected - your core abstractions)
1. `FormApi` - 41 edges
2. `warnDeprecatedOnce()` - 11 edges
3. `FormValues` - 10 edges
4. `FormBaseComponentType` - 10 edges
5. `createArrayChildSchema()` - 9 edges
6. `FormActions` - 9 edges
7. `applyValueFormatBySchemas()` - 9 edges
8. `setupTamanForm()` - 8 edges
9. `resolveFieldNamePath()` - 7 edges
10. `FormFieldName` - 7 edges

## Surprising Connections (you probably didn't know these)
- `resolveLegacyDependencies()` --calls--> `required()`  [INFERRED]
  src/form-render/form-render.dependencies.ts → __tests__/form-integration.test.ts
- `resolveLegacyDependencies()` --calls--> `rules()`  [INFERRED]
  src/form-render/form-render.dependencies.ts → __tests__/form-integration.test.ts
- `resolveLegacyDependencies()` --calls--> `show()`  [INFERRED]
  src/form-render/form-render.dependencies.ts → __tests__/form-types.test.ts
- `mountRuntime()` --calls--> `useFormRuntime()`  [EXTRACTED]
  __tests__/form-runtime.test.ts → src/form.runtime.ts
- `setup()` --calls--> `useFormContext()`  [EXTRACTED]
  __tests__/label-width.test.ts → src/form-render/form-render.context.ts

## Import Cycles
- None detected.

## Communities (17 total, 0 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.06
Nodes (33): COMPONENT_BIND_EVENT_MAP, COMPONENT_MAP, DEFAULT_FORM_COMMON_CONFIG, setupTamanForm(), resetDeprecationWarnings(), warnedDeprecations, FORM_RULES, getFormRule() (+25 more)

### Community 1 - "Community 1"
Cohesion: 0.10
Nodes (8): updateFormSchemaList(), FormApi, warnDeprecatedOnce(), FormFieldName, FormFieldValue, FormResetOptions, FormResetState, FormValues

### Community 2 - "Community 2"
Cohesion: 0.07
Nodes (26): FormCodecPhase, ExtendedFormApi, FormContextApi, FormFieldOptions, FormValidationResult, FormValueSnapshot, TamanFormActionSlotProps, TamanFormComponent (+18 more)

### Community 3 - "Community 3"
Cohesion: 0.06
Nodes (34): default, dependencies, pohon-ui, @taman-core/composables, @taman-core/icons, @taman-core/shared, @taman-core/taman-ui, @taman-core/typings (+26 more)

### Community 4 - "Community 4"
Cohesion: 0.06
Nodes (31): ActionButtonOptions, Breakpoints, CustomParamsRenderType, FormArraySchema, FormComponentField, FormCustomRenderType, FormFieldMappingTimeItem, FormFieldProps (+23 more)

### Community 5 - "Community 5"
Cohesion: 0.11
Nodes (20): getBaseRules(), getDefaultValueInZodStack(), UnwrappableZodType, AsyncFieldValidator, asyncValidatorKeys, createRuntimeFieldComponent(), FieldValidationInvalidator, normalizeError() (+12 more)

### Community 6 - "Community 6"
Cohesion: 0.15
Nodes (21): AnyFormSchema, createArrayChildSchema(), CreateArrayChildSchemaOptions, createArrayComponentProps(), createArrayFieldSchema(), createFormFieldSchema(), CreateFormFieldSchemaOptions, FormArraySchemaLike (+13 more)

### Community 7 - "Community 7"
Cohesion: 0.12
Nodes (14): FormApiProps, FormApiSchema, getDefaultState(), decodeFormValues(), encodeFormValues(), FormCodecError, FormBaseComponentType, FormCodec (+6 more)

### Community 8 - "Community 8"
Cohesion: 0.21
Nodes (16): deleteValueByFieldName(), getValueByFieldName(), resolveChildUpdateFieldName(), resolveFieldNamePath(), resolveValueFormatFieldName(), setValueByFieldName(), ArrayToStringFields, FormFieldMappingTime (+8 more)

### Community 9 - "Community 9"
Cohesion: 0.11
Nodes (10): resolveLegacyDependencies(), ComponentProps, DisabledFormValues, ModelProtocolValues, required(), rules(), SlotFormValues, TestInput (+2 more)

### Community 10 - "Community 10"
Cohesion: 0.14
Nodes (15): createDependencyState(), DependencyState, legacyDependencyKeys, mixedDependenciesWarnings, resolveValueByFieldName(), useDependencies(), FormDependenciesResolveContext, FormDependenciesResolvedState (+7 more)

### Community 11 - "Community 11"
Cohesion: 0.20
Nodes (9): [
  injectRenderFormProps,
  provideFormRenderProps,
], useFormContext(), formResolveLabelStyle(), FormResolveLabelStyleInput, useFormLabelWidth(), FormLabelWidthContext, FormLayout, FormRenderProps (+1 more)

### Community 12 - "Community 12"
Cohesion: 0.40
Nodes (4): exclude, extends, include, $schema

## Knowledge Gaps
- **123 isolated node(s):** `FilterFormValues`, `FilterSubmitValues`, `ProfileFormValues`, `FilterFormValues`, `FilterSubmitValues` (+118 more)
  These have ≤1 connection - possible missing edges or undocumented components.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `FormApi` connect `Community 1` to `Community 0`, `Community 2`, `Community 4`, `Community 7`?**
  _High betweenness centrality (0.129) - this node is a cross-community bridge._
- **Why does `FormActions` connect `Community 5` to `Community 1`, `Community 2`, `Community 4`, `Community 6`, `Community 7`?**
  _High betweenness centrality (0.015) - this node is a cross-community bridge._
- **Why does `FormBaseComponentType` connect `Community 7` to `Community 0`, `Community 2`, `Community 4`, `Community 6`, `Community 8`?**
  _High betweenness centrality (0.014) - this node is a cross-community bridge._
- **What connects `FilterFormValues`, `FilterSubmitValues`, `ProfileFormValues` to the rest of the system?**
  _123 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.05507246376811594 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.09745293466223699 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.06906906906906907 - nodes in this community are weakly interconnected._