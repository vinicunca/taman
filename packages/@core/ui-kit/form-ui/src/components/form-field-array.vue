<script setup lang="ts">
import type { TamanFormFieldArrayProps } from './form-field-array.types';
import { get, set } from '@taman-core/shared/utils';
import { TamanButtonIcon, TamanRenderContent } from '@taman-core/taman-ui';
import PButton from 'pohon-ui/components/Button.vue';
import { computed } from 'vue';
import FormRenderFormField from '../form-render/form-render-form-field.vue';
import { injectRenderFormProps } from '../form-render/form-render.context';
import { createArrayChildSchema } from '../form-render/form-render.schema';

defineOptions({
  name: 'TamanFormFieldArray',
  inheritAttrs: false,
});

const props = withDefaults(
  defineProps<TamanFormFieldArrayProps>(),
  {
    // TODO: implement i18n
    actionText: 'Action',
    // TODO: implement i18n
    addButtonText: 'Add a row',
    createRow: undefined,
    disabled: false,
    // TODO: implement i18n
    emptyText: 'No data',
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
  throw new Error('Form api is required in <TamanFormFieldArray />');
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
  <div
    class="w-full"
    :class="[$attrs.class]"
  >
    <div class="border border-border/70 rounded-md overflow-hidden">
      <div
        class="px-2 border-b border-border bg-background-muted/30 hidden sm:grid"
        :style="gridStyle"
      >
        <div
          v-if="showIndex"
          class="text-sm color-text-muted font-normal px-2 py-2 text-left"
        >
          #
        </div>
        <div
          v-for="col in schema"
          :key="col.fieldName"
          class="text-sm color-text-muted font-normal px-2 py-2 text-left"
        >
          <TamanRenderContent :content="col.label" />
        </div>
        <div
          class="text-sm color-text-muted font-normal px-2 py-2 text-left"
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
          class="text-sm color-text-muted mb-2 sm:mb-0 sm:px-4 sm:py-3"
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
              class="text-xs color-text-muted font-medium mb-1 sm:hidden"
            >
              <TamanRenderContent :content="schema?.[childIndex]?.label" />
            </div>
            <FormRenderFormField
              v-bind="childSchema"
              :class="childSchema.formItemClass"
            />
          </div>
        </template>

        <div class="pt-1 flex justify-end sm:px-2 sm:py-3 sm:block">
          <TamanButtonIcon
            :disabled="disabled || !canRemove"
            :on-click="() => removeRow(index)"
            icon="lucide:x"
          />
        </div>
      </div>

      <div
        v-if="arrayLength === 0"
        class="text-sm color-text-muted py-6 text-center"
      >
        {{ emptyText }}
      </div>
    </div>

    <PButton
      variant="outline"
      size="sm"
      :disabled="disabled || !canAdd"
      class="mt-3 border-dashed w-full"
      icon="lucide:plus"
      @click="addRow"
    >
      {{ addButtonText }}
    </PButton>
  </div>
</template>
