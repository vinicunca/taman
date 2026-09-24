<script lang="ts" setup>
import type {
  TamanButtonCheckGroupModel,
  TamanButtonCheckGroupProps,
  TamanButtonCheckGroupValue,
} from '@taman/app-ui';
import {
  AppCard,
  AppCardAction,
  AppPage,
  TamanButtonCheckGroup,
  useTamanToast,
} from '@taman/app-ui';
import { reactive, ref } from 'vue';
import { useTamanForm } from '#/adapter/form';

const radioValue = ref<TamanButtonCheckGroupModel>('a');
const checkValue = ref<TamanButtonCheckGroupModel>(['a', 'b']);

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

function beforeChange(value: TamanButtonCheckGroupValue, isChecked: boolean) {
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
  TamanButtonCheckGroupProps,
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

function onBtnClick(value: TamanButtonCheckGroupValue | undefined) {
  const option = options.find((o) => o.value === value);
  if (option) {
    toaster.success(`Clicked ${option.label}, value = ${value}`);
  }
}
</script>

<template>
  <AppPage
    title="Button Group"
    description="Plain button groups use PFieldGroup to join PButtons into one control. TamanButtonCheckGroup is a form component built on top of it that provides single or multiple selection."
  >
    <AppCard title="Basic Usage">
      <template #trailingHeader>
        <AppCardAction>
          <PButton @click="resetValues">
            Clear values
          </PButton>
        </AppCardAction>
      </template>

      <p>Button group (PFieldGroup):</p>
      <div class="mt-2 flex flex-col gap-2 items-start">
        <PFieldGroup :size="state.size">
          <PButton
            v-for="option in options"
            :key="option.value"
            color="neutral"
            variant="outline"
            :disabled="state.disabled"
            @click="onBtnClick(option.value)"
          >
            {{ option.label }}
          </PButton>
        </PFieldGroup>
        <PFieldGroup :size="state.size">
          <PButton
            v-for="option in options"
            :key="option.value"
            variant="soft"
            :disabled="state.disabled"
            @click="onBtnClick(option.value)"
          >
            {{ option.label }}
          </PButton>
        </PFieldGroup>
      </div>

      <p class="mt-4">
        Single: {{ radioValue }}
      </p>
      <div class="mt-2">
        <TamanButtonCheckGroup
          v-model="radioValue"
          :options="options"
          v-bind="state"
          @btn-click="onBtnClick"
        />
      </div>

      <p class="mt-4">
        Single with option slot: {{ radioValue }}
      </p>
      <div class="mt-2">
        <TamanButtonCheckGroup
          v-model="radioValue"
          :options="options"
          v-bind="state"
        >
          <template #option="{ label, value, data }">
            <span>{{ label }}</span>
            <span class="ml-2 opacity-60">{{ value }}</span>
            <span
              v-if="data.num"
              class="ml-2"
            >{{ data.num }}</span>
          </template>
        </TamanButtonCheckGroup>
      </div>

      <p class="mt-4">
        Multiple: {{ checkValue }}
      </p>
      <div class="mt-2">
        <TamanButtonCheckGroup
          v-model="checkValue"
          multiple
          :options="options"
          v-bind="state"
        />
      </div>

      <p class="mt-4">
        Custom icon: {{ checkValue }}
      </p>
      <div class="mt-2">
        <TamanButtonCheckGroup
          v-model="checkValue"
          multiple
          :options="options"
          v-bind="state"
        >
          <template #icon="{ loading, checked }">
            <PIcon
              v-if="loading"
              name="lucide:loader-circle"
              class="animate-spin"
            />
            <PIcon
              v-else-if="checked"
              name="lucide:square-check-big"
            />
            <PIcon
              v-else
              name="lucide:square"
            />
          </template>
        </TamanButtonCheckGroup>
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
