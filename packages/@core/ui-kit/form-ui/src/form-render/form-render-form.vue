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
import { computed, reactive, toRaw, toRefs } from 'vue';

import FormRenderFormField from './form-render-form-field.vue';
import FormRenderGroup from './form-render-group.vue';
import { provideFormRenderProps } from './form-render.context';
import { useExpandable } from './form-render.expandable';
import { getBaseRules, getDefaultValueInZodStack } from './form-render.helper';
import {
  createFormFieldSchema,
  getFormFieldSchemas,
  isFormGroupSchema,
} from './form-render.schema';
import { useFormLabelWidth } from './form-render.utils';

interface NormalizedFormGroupSchema extends FormGroupSchema {
  fields: Array<NormalizedFormFieldSchema>;
  hidden: boolean;
  key: string;
}

const props = withDefaults(
  defineProps<FormRenderProps & { globalCommonConfig?: FormCommonConfig }>(),
  {
    collapsedRows: 1,
    commonConfig: () => ({}),
    globalCommonConfig: () => ({}),
    showCollapseButton: false,
    wrapperClass: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3',
  },
);

const emits = defineEmits<{
  submit: [event: any];
}>();

function getWrapperClass(gridClass = '') {
  const cls = ['flex'];
  if (props.layout === 'inline') {
    cls.push('flex-wrap gap-x-2');
  } else {
    cls.push(props.compact ? 'gap-x-2' : 'gap-x-4', 'flex-col grid');
  }

  return [...cls, gridClass];
}

const wrapperClass = computed(() => getWrapperClass(props.wrapperClass));

const formFieldSchemas = computed(() => {
  return getFormFieldSchemas(props.schema ?? []);
});

provideFormRenderProps(
  reactive({
    ...toRefs(props),
    ...useFormLabelWidth(),
  }),
);

// @ts-expect-error unused
const { isCalculated, keepFormItemIndex, wrapperRef } = useExpandable(props);

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

const formCollapsed = computed(() => {
  return props.collapsed && isCalculated.value;
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
    const keepIndex = keepFormItemIndex.value;
    const result: Array<NormalizedFormFieldSchema | NormalizedFormGroupSchema>
      = [];

    (props.schema ?? []).forEach((schema, index) => {
      const hidden
        // Collapsed state & show collapse button & current index is greater than the reserved index (groups are counted as one top-level item)
        = props.showCollapseButton && !!formCollapsed.value && keepIndex
          ? keepIndex <= index
          : false;

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

function getGroupWrapperClass(schema: NormalizedFormGroupSchema) {
  return getWrapperClass(schema.wrapperClass ?? props.wrapperClass);
}
</script>

<template>
  <component
    :is="formComponent"
    v-bind="formComponentProps"
  >
    <div
      ref="wrapperRef"
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

      <slot :shapes="shapes" />
    </div>
  </component>
</template>
