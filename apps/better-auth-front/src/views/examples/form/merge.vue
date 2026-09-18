<script lang="ts" setup>
import type { StepperItem } from 'pohon-ui';

import { AppCard, AppCardAction, AppPage } from '@taman/app-ui';
import { ref } from 'vue';

import { useTamanForm } from '#/adapter/form';

const toast = useToast();
const currentTab = ref(0);
function onFirstSubmit(values: Record<string, any>) {
  toast.add({
    color: 'success',
    title: `form1 values: ${JSON.stringify(values)}`,
    duration: 2_000,
  });
  currentTab.value = 1;
}
function onSecondReset() {
  currentTab.value = 0;
}
function onSecondSubmit(values: Record<string, any>) {
  toast.add({
    color: 'success',
    title: `form2 values: ${JSON.stringify(values)}`,
    duration: 2_000,
  });
}

const [FirstForm, firstFormApi] = useTamanForm({
  commonConfig: {
    componentProps: {
      class: 'w-full',
    },
  },
  handleSubmit: onFirstSubmit,
  layout: 'horizontal',
  resetButtonOptions: {
    show: false,
  },
  schema: [
    {
      component: 'Input',
      componentProps: {
        placeholder: 'Please enter',
      },
      fieldName: 'formFirst',
      label: 'Form 1 field',
      rules: 'required',
    },
  ],
  submitButtonOptions: {
    content: 'Next',
  },
  wrapperClass: 'grid-cols-1 md:grid-cols-1 lg:grid-cols-1',
});
const [SecondForm, secondFormApi] = useTamanForm({
  commonConfig: {
    componentProps: {
      class: 'w-full',
    },
  },
  handleReset: onSecondReset,
  handleSubmit: onSecondSubmit,
  layout: 'horizontal',
  resetButtonOptions: {
    content: 'Previous',
  },
  schema: [
    {
      component: 'Input',
      componentProps: {
        placeholder: 'Please enter',
      },
      fieldName: 'formSecond',
      label: 'Form 2 field',
      rules: 'required',
    },
  ],
  wrapperClass: 'grid-cols-1 md:grid-cols-1 lg:grid-cols-1',
});
const stepsItems: Array<StepperItem> = [
  {
    title: 'Form 1',
  },
  { title: 'Form 2' },
];
const needMerge = ref(true);

async function handleMergeSubmit() {
  const values = await firstFormApi
    .merge(secondFormApi)
    .submitAllForm(needMerge.value);
  toast.add({
    color: 'success',
    title: `merged form values: ${JSON.stringify(values)}`,
    duration: 2_000,
  });
}
</script>

<template>
  <AppPage
    description="Form component merge example: In some scenarios, such as multi-step forms, it is necessary to merge multiple forms and submit them together. By default, the Object.assign rule is used to merge forms. If special data processing is required, false can be passed in."
    title="Form Components"
  >
    <AppCard title="Basic Example">
      <template #trailingHeader>
        <AppCardAction class="flex gap-4 items-center">
          <PSwitch
            v-model="needMerge"
            class="flex-row-reverse gap-2"
            :label="needMerge ? 'field merge enabled' : 'field merge disabled'"
          />
          <PButton
            @click="handleMergeSubmit"
          >
            Merge submit
          </PButton>
        </AppCardAction>
      </template>
      <div class="mx-auto max-w-lg">
        <PStepper
          v-model="currentTab"
          :items="stepsItems"
          disabled
        />
        <div class="p-20">
          <FirstForm v-show="currentTab === 0" />
          <SecondForm v-show="currentTab === 1" />
        </div>
      </div>
    </AppCard>
  </AppPage>
</template>
