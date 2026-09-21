<script setup lang="ts">
import type { ZodType } from 'zod';

import type {
  FormCommonConfig,
  FormFieldSchema,
  FormGroupSchema,
  FormRenderProps,
  FormShape,
} from '../form.types';
import type { NormalizedFormFieldSchema } from './form-render.schema';

import { isString } from '@taman-core/shared/utils';
import { computed, reactive, toRaw, toRefs, useId, watch } from 'vue';

import FormRenderFormField from './form-render-form-field.vue';
import FormRenderGroup from './form-render-group.vue';
import { provideFormRenderProps } from './form-render.context';
import { getBaseRules, getDefaultValueInZodStack } from './form-render.helper';
import {
  createFormFieldSchema,
  getFormFieldSchemas,
  isFormGroupSchema,
} from './form-render.schema';

interface NormalizedFormGroupSchema extends FormGroupSchema {
  fields: Array<NormalizedFormFieldSchema>;
  hidden: boolean;
  key: string;
}

const props = withDefaults(
  defineProps<FormRenderProps & { globalCommonConfig?: FormCommonConfig }>(),
  {
    commonConfig: () => ({}),
    globalCommonConfig: () => ({}),
    wrapperClass: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3',
  },
);

const emits = defineEmits<{
  'submit': [event: any];
  'update:collapsed': [value: boolean];
}>();

function getWrapperClass(gridClass = '') {
  return [
    'flex',
    props.compact ? 'gap-x-2' : 'gap-x-4',
    'flex-col grid',
    gridClass,
  ];
}

const wrapperClass = computed(() => getWrapperClass(props.wrapperClass));

const formFieldSchemas = computed(() => {
  return getFormFieldSchemas(props.schema ?? []);
});

provideFormRenderProps(reactive({ ...toRefs(props) }));

const shapes = computed(() => {
  const resultShapes: Array<FormShape> = [];
  formFieldSchemas.value.forEach((schema) => {
    const { fieldName } = schema;
    const rules = toRaw(schema.rules) as ZodType;

    const baseRules = getBaseRules(rules) as ZodType;

    resultShapes.push({
      default: getDefaultValueInZodStack(rules),
      fieldName,
      required: Boolean(rules && !isString(rules) && !rules.isOptional()),
      rules: baseRules,
    });
  });
  return resultShapes;
});

const formComponent = 'form';

const formComponentProps = computed(() => {
  return props.form
    ? {
        onSubmit: props.form.handleSubmit(() => emits('submit', undefined)),
      }
    : {
        onSubmit: (event: Event) => {
          event.preventDefault();
          emits('submit', event);
        },
      };
});

function normalizeFieldSchema(schema: FormFieldSchema, hidden = false) {
  return createFormFieldSchema(schema as never, {
    commonConfig: props.commonConfig,
    globalCommonConfig: props.globalCommonConfig,
    hidden,
  });
}

const computedSchema = computed(
  (): Array<NormalizedFormFieldSchema | NormalizedFormGroupSchema> => {
    const result: Array<NormalizedFormFieldSchema | NormalizedFormGroupSchema>
      = [];

    (props.schema ?? []).forEach((schema, index) => {
      const hidden = Boolean(props.collapsed) && schema.collapsed === true;

      if (isFormGroupSchema(schema)) {
        if (schema.hide || schema.children.length === 0) {
          return;
        }
        result.push({
          ...schema,
          fields: schema.children.map((field) => normalizeFieldSchema(field)),
          hidden,
          key: schema.name ?? `group-${index}`,
        });
        return;
      }

      result.push(normalizeFieldSchema(schema, hidden));
    });

    return result;
  },
);

function isNormalizedFormGroupSchema(
  schema: NormalizedFormFieldSchema | NormalizedFormGroupSchema,
): schema is NormalizedFormGroupSchema {
  return isFormGroupSchema(schema);
}

// Field names that *would* be hidden by the form-level `collapsed` state
// (either a top-level field marked `collapsed: true`, or every field inside
// a group marked `collapsed: true`).
//
// This is derived from schema membership alone (`schema.collapsed === true`),
// never from `props.collapsed` / `computedSchema.hidden`. Those depend on the
// very `collapsed` state this predicate is used to control (see
// `hasInvalidHiddenField` below) — deriving from them would make the set
// empty while expanded and flip populated the instant the user collapses,
// re-firing the watcher and snapping the form back open on every attempt.
const hiddenFieldNames = computed(() => {
  const fieldNames: Array<string> = [];
  (props.schema ?? []).forEach((schema) => {
    if (isFormGroupSchema(schema)) {
      if (schema.hide || schema.children.length === 0 || schema.collapsed !== true) {
        return;
      }
      schema.children.forEach(({ fieldName }) => {
        fieldNames.push(fieldName);
      });
      return;
    }
    if (schema.collapsed === true) {
      fieldNames.push(schema.fieldName);
    }
  });
  return fieldNames;
});

// Mirrors the group-level `hasInvalidField` auto-expand (form-render-group.vue):
// when a field hidden behind the form-level collapse toggle fails validation,
// force the form back open so the error is reachable instead of silently
// hidden. `collapsed` is a read-only prop here (the state lives on the host —
// `taman-form.vue` / `taman-use-form.vue`), so it is requested via
// `update:collapsed` rather than mutated directly.
const hasInvalidHiddenField = computed(() => {
  if (hiddenFieldNames.value.length === 0) {
    return false;
  }
  const errors = props.form?.errors ?? {};
  return hiddenFieldNames.value.some((fieldName) =>
    Object.entries(errors).some(
      ([errorFieldName, error]) =>
        Boolean(error)
        && (errorFieldName === fieldName
          || errorFieldName.startsWith(`${fieldName}.`)
          || errorFieldName.startsWith(`${fieldName}[`)),
    ),
  );
});

watch(hasInvalidHiddenField, (invalid) => {
  if (invalid && props.collapsed) {
    emits('update:collapsed', false);
  }
});

function getGroupWrapperClass(schema: NormalizedFormGroupSchema) {
  return getWrapperClass(schema.wrapperClass ?? props.wrapperClass);
}

// Stable id for the field grid, exposed through the default slot so the
// collapse toggle (rendered inside that slot, e.g. `<FormActions>`) can
// point `aria-controls` at the region it expands/collapses.
const gridId = useId();
</script>

<template>
  <component
    :is="formComponent"
    v-bind="formComponentProps"
  >
    <div
      :id="gridId"
      :class="wrapperClass"
    >
      <template
        v-for="cSchema in computedSchema"
        :key="
          isNormalizedFormGroupSchema(cSchema) ? cSchema.key : cSchema.fieldName
        "
      >
        <FormRenderGroup
          v-if="isNormalizedFormGroupSchema(cSchema)"
          :content-class="getGroupWrapperClass(cSchema)"
          :hidden="cSchema.hidden"
          :schema="cSchema"
        >
          <FormRenderFormField
            v-for="fieldSchema in cSchema.fields"
            :key="fieldSchema.fieldName"
            v-bind="fieldSchema"
            :class="fieldSchema.formItemClass"
            :rules="fieldSchema.rules"
          >
            <template #default="slotProps">
              <slot
                v-bind="slotProps"
                :name="fieldSchema.fieldName"
              />
            </template>
          </FormRenderFormField>
        </FormRenderGroup>

        <FormRenderFormField
          v-else
          v-bind="cSchema"
          :class="cSchema.formItemClass"
          :rules="cSchema.rules"
        >
          <template #default="slotProps">
            <slot
              v-bind="slotProps"
              :name="cSchema.fieldName"
            />
          </template>
        </FormRenderFormField>
      </template>

      <slot
        :grid-id="gridId"
        :shapes="shapes"
      />
    </div>
  </component>
</template>
