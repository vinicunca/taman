<script lang="ts" setup>
import type {
  TamanToggleGroupModel,
  TamanToggleGroupProps,
  TamanToggleGroupValue,
} from '@taman/app-ui';
import { useTamanForm } from '#/adapter/form';
import { reactive, ref } from 'vue';
import {
  AppCard,
  AppCardAction,
  AppPage,
  TamanToggleGroup,
  useTamanToast,
} from '@taman/app-ui';

const radioValue = ref<TamanToggleGroupModel>('a');
const checkValue = ref<TamanToggleGroupModel>(['a', 'b']);

const options = [
  { label: 'Option 1', value: 'a' },
  { label: 'Option 2', value: 'b', num: 999 },
  { label: 'Option 3', value: 'c' },
  { label: 'Option 4', value: 'd' },
  { label: 'Option 5', value: 'e' },
  { label: 'Option 6', value: 'f' },
];

function resetValues() {
  radioValue.value = undefined;
  checkValue.value = [];
}

const { toast, toaster } = useTamanToast();

function beforeChange(value: TamanToggleGroupValue, isChecked: boolean) {
  toast.add({
    title: `Setting ${value} to ${isChecked ? 'checked' : 'unchecked'}...`,
    duration: 0,
    id: 'before-change',
    icon: 'svg-spinners:ring-resize',
  });

  return new Promise<boolean>((resolve) => {
    setTimeout(() => {
      toaster.success(`${value} was set successfully`, {
        id: 'before-change',
        duration: 2_000,
      });
      resolve(true);
    }, 2000);
  });
}

const state = reactive<Pick<
  TamanToggleGroupProps,
  'allowClear' | 'beforeChange' | 'disabled' | 'maxCount' | 'showIcon' | 'size'
>>({
  allowClear: false,
  beforeChange: undefined,
  disabled: false,
  maxCount: 0,
  showIcon: true,
  size: 'md',
});

const [Form] = useTamanForm({
  handleValuesChange(values) {
    Object.assign(state, {
      ...values,
      beforeChange: values.beforeChange ? beforeChange : undefined,
    });
  },
  schema: [
    {
      component: 'RadioGroup',
      componentProps: {
        items: ['xs', 'sm', 'md', 'lg', 'xl'].map((size) => ({ label: size, value: size })),
        orientation: 'horizontal',
      },
      defaultValue: state.size,
      fieldName: 'size',
      label: 'Size',
    },
    {
      component: 'Switch',
      defaultValue: state.showIcon,
      fieldName: 'showIcon',
      label: 'Show icon',
    },
    {
      component: 'Switch',
      defaultValue: state.disabled,
      fieldName: 'disabled',
      label: 'Disabled',
    },
    {
      component: 'Switch',
      defaultValue: false,
      fieldName: 'beforeChange',
      label: 'Before change callback',
    },
    {
      component: 'Switch',
      defaultValue: state.allowClear,
      fieldName: 'allowClear',
      label: 'Allow clear',
      help: 'In single mode, clicking the checked option clears the value (undefined)',
    },
    {
      component: 'InputNumber',
      defaultValue: state.maxCount,
      fieldName: 'maxCount',
      label: 'Max selections',
      help: 'Only applies in multiple mode; 0 means no limit',
    },
  ],
  showDefaultActions: false,
  submitOnChange: true,
});

function onItemClick(value: TamanToggleGroupValue | undefined) {
  const option = options.find((o) => o.value === value);
  if (option) {
    toaster.success(`Clicked ${option.label}, value = ${value}`);
  }
}
</script>

<template>
  <AppPage
    title="Toggle Group"
    description="TamanToggleGroup wraps PToggleGroup and adds single or multiple selection rules: allow clear, max selections and a before-change callback."
  >
    <AppCard title="Basic Usage">
      <template #trailingHeader>
        <AppCardAction>
          <PButton @click="resetValues">
            Clear values
          </PButton>
        </AppCardAction>
      </template>

      <p>
        Single: {{ radioValue }}
      </p>
      <div class="mt-2">
        <TamanToggleGroup
          v-model="radioValue"
          :items="options"
          v-bind="state"
          @item-click="onItemClick"
        />
      </div>

      <p class="mt-4">
        Single with default slot: {{ radioValue }}
      </p>
      <div class="mt-2">
        <TamanToggleGroup
          v-model="radioValue"
          :items="options"
          v-bind="state"
        >
          <template #default="{ item }">
            <span>{{ item.label }}</span>
            <span class="ms-2 opacity-60">{{ item.value }}</span>
            <span
              v-if="item.num"
              class="ms-2"
            >{{ item.num }}</span>
          </template>
        </TamanToggleGroup>
      </div>

      <p class="mt-4">
        Multiple: {{ checkValue }}
      </p>
      <div class="mt-2">
        <TamanToggleGroup
          v-model="checkValue"
          type="multiple"
          :items="options"
          v-bind="state"
        />
      </div>

      <p class="mt-4">
        Custom icon (leading slot): {{ checkValue }}
      </p>
      <div class="mt-2">
        <TamanToggleGroup
          v-model="checkValue"
          type="multiple"
          :items="options"
          v-bind="state"
        >
          <template #leading="{ item, pressed, ui }">
            <PIcon
              :name="item.loading ? 'lucide:loader-circle' : pressed ? 'lucide:square-check-big' : 'lucide:square'"
              :class="ui.leadingIcon?.({ class: item.loading && 'animate-spin' })"
            />
          </template>
        </TamanToggleGroup>
      </div>
    </AppCard>

    <AppCard
      title="Settings"
      class="mt-4"
    >
      <Form />
    </AppCard>
  </AppPage>
</template>
