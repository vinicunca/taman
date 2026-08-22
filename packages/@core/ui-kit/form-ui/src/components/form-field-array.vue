<script setup lang="ts">
import type { FormCommonConfig, FormSchema } from '../form.types';

import { cn, get, set } from '@taman-core/shared/utils';
import {
  TamanButtonIcon,
  TamanRenderContent,
} from '@taman-core/taman-ui';
import { computed } from 'vue';

import FormRenderFormField from '../form-render/form-render-form-field.vue';
import { injectRenderFormProps } from '../form-render/form-render.context';
import { createArrayChildSchema } from '../form-render/form-render.schema';

defineOptions({
  name: 'TamanFormFieldArray',
  inheritAttrs: false,
});

const props = withDefaults(
  defineProps<{
    /** 操作列表头文案 */
    actionText?: string;
    /** 「添加」按钮文案 */
    addButtonText?: string;
    /** 子字段通用配置 */
    commonConfig?: FormCommonConfig;
    /**
     * 新增一行时生成的默认数据；缺省时按 schema 的 fieldName 生成空对象
     */
    createRow?: () => Record<string, any>;
    disabled?: boolean;
    /** 空数据文案 */
    emptyText?: string;
    /** 子字段全局通用配置 */
    globalCommonConfig?: FormCommonConfig;
    /** 最多行数 */
    max?: number;
    /** 最少行数 */
    min?: number;
    /** 字段路径，由外层 FormField 通过 componentField 透传 */
    name?: string;
    /**
     * 列定义，每一列就是一个子字段（复用 FormSchema）
     */
    schema?: Array<FormSchema>;
    /** 是否显示序号列 */
    showIndex?: boolean;
  }>(),
  {
    actionText: '操作',
    addButtonText: '添加一行',
    createRow: undefined,
    disabled: false,
    emptyText: '暂无数据',
    commonConfig: () => ({}),
    globalCommonConfig: () => ({}),
    max: Number.POSITIVE_INFINITY,
    min: 0,
    name: '',
    schema: () => [],
    showIndex: true,
  },
);

const arrayPath = computed(() => props.name);
const formRenderProps = injectRenderFormProps();
const form = formRenderProps.form;
if (!form) {
  throw new Error('Form api is required in <VbenFormFieldArray />');
}
const formActions = form;
const arrayLength = formActions.useSelector((state) => {
  const value = get(state.values, props.name);
  return Array.isArray(value) ? value.length : 0;
});
const rowIndexes = computed(() =>
  Array.from({ length: arrayLength.value }, (_, index) => index),
);

const canAdd = computed(() => arrayLength.value < props.max);
const canRemove = computed(() => arrayLength.value > props.min);
const gridStyle = computed(() => {
  const columns = [
    ...(props.showIndex ? ['3rem'] : []),
    ...props.schema.map(() => 'minmax(0, 1fr)'),
    '4rem',
  ];
  return {
    gridTemplateColumns: columns.join(' '),
  };
});

function buildDefaultRow(): Record<string, any> {
  if (props.createRow) {
    return props.createRow();
  }

  const row: Record<string, any> = {};
  props.schema.forEach((col) => {
    let value: any = null;
    if (Reflect.has(col, 'defaultValue') && col.defaultValue !== undefined) {
      value = col.defaultValue;
    } else if ('type' in col && col.type === 'array') {
      value = [];
    }
    set(row, col.fieldName, value);
  });
  return row;
}

function addRow() {
  if (props.disabled || !canAdd.value) {
    return;
  }
  formActions.pushFieldValue(arrayPath.value, buildDefaultRow());
}

function removeRow(index: number) {
  if (props.disabled || !canRemove.value) {
    return;
  }
  void formActions.removeFieldValue(arrayPath.value, index);
}

function rowSchemas(index: number) {
  return props.schema.map((col) =>
    createArrayChildSchema(col as never, {
      arrayField: arrayPath.value,
      commonConfig: props.commonConfig,
      disabled: props.disabled,
      globalCommonConfig: props.globalCommonConfig,
      index,
    }),
  );
}

const normalizedRowSchemas = computed(() =>
  Array.from({ length: arrayLength.value }, (_, index) => rowSchemas(index)),
);
</script>

<template>
  <div :class="cn('w-full', $attrs.class as string)">
    <div class="border border-border/70 rounded-md overflow-hidden">
      <div
        class="bg-muted/30 px-2 border-b border-border hidden sm:grid"
        :style="gridStyle"
      >
        <div
          v-if="showIndex"
          class="text-muted-foreground text-sm font-normal px-2 py-2 text-left"
        >
          #
        </div>
        <div
          v-for="col in schema"
          :key="col.fieldName"
          class="text-muted-foreground text-sm font-normal px-2 py-2 text-left"
        >
          <VbenRenderContent :content="col.label" />
        </div>
        <div
          class="text-muted-foreground text-sm font-normal px-2 py-2 text-left"
        >
          {{ actionText }}
        </div>
      </div>

      <div
        v-for="index in rowIndexes"
        :key="`${arrayPath}-${index}`"
        class="p-3 border-b border-border/60 sm:p-0 last:border-b-0 sm:grid"
        :style="gridStyle"
      >
        <div
          v-if="showIndex"
          class="text-muted-foreground text-sm mb-2 sm:mb-0 sm:px-4 sm:py-3"
        >
          <span class="sm:hidden">#</span>
          {{ index + 1 }}
        </div>

        <template
          v-for="(childSchema, childIndex) in normalizedRowSchemas[index]"
          :key="childSchema.fieldName"
        >
          <div class="py-2 min-w-0 sm:px-2">
            <div
              class="text-muted-foreground text-xs font-medium mb-1 sm:hidden"
            >
              <VbenRenderContent :content="schema?.[childIndex]?.label" />
            </div>
            <FormRenderFormField
              v-bind="childSchema"
              :class="childSchema.formItemClass"
            />
          </div>
        </template>

        <div class="pt-1 flex justify-end sm:px-2 sm:py-3 sm:block">
          <VbenIconButton
            type="button"
            :disabled="disabled || !canRemove"
            :on-click="() => removeRow(index)"
            class="text-muted-foreground hover:text-destructive"
          >
            <X class="size-4" />
          </VbenIconButton>
        </div>
      </div>

      <div
        v-if="arrayLength === 0"
        class="text-muted-foreground text-sm py-6 text-center"
      >
        {{ emptyText }}
      </div>
    </div>

    <VbenButton
      variant="outline"
      size="sm"
      type="button"
      :disabled="disabled || !canAdd"
      class="mt-3 border-dashed w-full"
      @click="addRow"
    >
      <Plus class="mr-1 size-4" />
      {{ addButtonText }}
    </VbenButton>
  </div>
</template>
