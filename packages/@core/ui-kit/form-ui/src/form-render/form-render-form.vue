<script setup lang="ts">
import type { ZodType } from 'zod';

import type { FormCommonConfig, FormRenderProps, FormShape } from '../form.types';
import type { NormalizedFormFieldSchema } from './form-render.schema';

import { isString } from '@taman-core/shared/utils';
import { computed, reactive, toRaw, toRefs } from 'vue';

import FormRenderFormField from './form-render-form-field.vue';
import { provideFormRenderProps } from './form-render.context';
import { useExpandable } from './form-render.expandable';
import { getBaseRules, getDefaultValueInZodStack } from './form-render.helper';
import { createFormFieldSchema } from './form-render.schema';
import { useFormLabelWidth } from './form-render.utils';

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

const wrapperClass = computed(() => {
  const cls = ['flex'];
  if (props.layout === 'inline') {
    cls.push('flex-wrap gap-x-2');
  } else {
    cls.push(props.compact ? 'gap-x-2' : 'gap-x-4', 'flex-col grid');
  }
  return cn(...cls, props.wrapperClass);
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
  props.schema?.forEach((schema) => {
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

const computedSchema = computed((): Array<NormalizedFormFieldSchema> => {
  return (props.schema || []).map((schema, index) => {
    const keepIndex = keepFormItemIndex.value;

    const hidden
      // Collapsed state & Show collapse button & Current index greater than preserved index
      = props.showCollapseButton && !!formCollapsed.value && keepIndex
        ? keepIndex <= index
        : false;

    return createFormFieldSchema(schema as never, {
      commonConfig: props.commonConfig,
      globalCommonConfig: props.globalCommonConfig,
      hidden,
    });
  });
});
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
        :key="cSchema.fieldName"
      >
        <FormRenderFormField
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
