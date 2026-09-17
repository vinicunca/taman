<script lang="ts" setup>
import { AppCard, AppPage } from '@taman/app-ui';

import { useTamanForm } from '#/adapter/form';

const [CustomLayoutForm] = useTamanForm({
  commonConfig: {
    componentProps: {
      class: 'w-full',
    },
  },
  layout: 'horizontal',
  schema: [
    {
      component: 'Select',
      fieldName: 'field1',
      label: 'Select',
    },
    {
      component: 'Select',
      fieldName: 'field2',
      label: 'TreeSelect',
    },
    {
      component: 'Input',
      fieldName: 'field3',
      label: 'Mentions',
    },
    {
      component: 'Input',
      fieldName: 'field4',
      label: 'Input',
    },
    {
      component: 'InputNumber',
      fieldName: 'field5',
      // Start from column 3 (leaves one empty column in the middle)
      formItemClass: 'col-start-3',
      label: 'InputNumber',
    },
    {
      component: 'Separator',
      fieldName: '_divider',
      formItemClass: 'col-span-3',
      hideLabel: true,
      componentProps: {
        label: 'Separator',
      },
    },
    {
      component: 'Textarea',
      fieldName: 'field6',
      // Span 3 columns with baseline alignment
      formItemClass: 'col-span-3 items-baseline',
      label: 'Fill three columns',
    },
    {
      component: 'Input',
      fieldName: 'field7',
      // Span 2 columns starting at column 2 (leaves one empty column before)
      formItemClass: 'col-span-2 col-start-2',
      label: 'Fill two columns',
    },
    {
      component: 'Input',
      fieldName: 'field8',
      // Horizontal padding
      formItemClass: 'col-start-2',
      label: 'Leave two empty columns',
    },
    {
      component: 'InputPassword',
      fieldName: 'field9',
      formItemClass: 'col-start-1',
      label: 'Fill one column',
    },
  ],
  wrapperClass: 'grid-cols-3',
});
</script>

<template>
  <AppPage
    content-class="flex flex-col gap-4"
    description="Use tailwind to customize the layout of the form items, use Divider to split the form."
    title="Custom Layout"
  >
    <AppCard title="Custom Layout">
      <CustomLayoutForm />
    </AppCard>
  </AppPage>
</template>
