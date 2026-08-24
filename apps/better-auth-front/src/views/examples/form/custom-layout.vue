<script lang="ts" setup>
import { h } from 'vue';

import { Page } from '@taman/common-ui';

import { Card } from 'antdv-next';

import { useTamanForm } from '#/adapter/form';

import DocButton from '../doc-button.vue';

const [CustomLayoutForm] = useTamanForm({
  // Shared by all form items; can be overridden per form
  commonConfig: {
    // All form items
    componentProps: {
      class: 'w-full',
    },
  },
  layout: 'horizontal',
  schema: [
    {
      component: 'Select',
      fieldName: 'field1',
      label: '字符串',
    },
    {
      component: 'TreeSelect',
      fieldName: 'field2',
      label: '字符串',
    },
    {
      component: 'Mentions',
      fieldName: 'field3',
      label: '字符串',
    },
    {
      component: 'Input',
      fieldName: 'field4',
      label: '字符串',
    },
    {
      component: 'InputNumber',
      fieldName: 'field5',
      // Start from column 3 (leaves one empty column in the middle)
      formItemClass: 'col-start-3',
      label: '前面空了一列',
    },
    {
      component: 'Divider',
      fieldName: '_divider',
      formItemClass: 'col-span-3',
      hideLabel: true,
      renderComponentContent: () => {
        return {
          default: () => h('div', '分割线'),
        };
      },
    },
    {
      component: 'Textarea',
      fieldName: 'field6',
      // Span 3 columns with baseline alignment
      formItemClass: 'col-span-3 items-baseline',
      label: '占满三列',
    },
    {
      component: 'Input',
      fieldName: 'field7',
      // Span 2 columns starting at column 2 (leaves one empty column before)
      formItemClass: 'col-span-2 col-start-2',
      label: '占满2列',
    },
    {
      component: 'Input',
      fieldName: 'field8',
      // Horizontal padding
      formItemClass: 'col-start-2',
      label: '左右留空',
    },
    {
      component: 'InputPassword',
      fieldName: 'field9',
      formItemClass: 'col-start-1',
      label: '字符串',
    },
  ],
  // Three columns total
  wrapperClass: 'grid-cols-3',
});
</script>

<template>
  <Page
    content-class="flex flex-col gap-4"
    description="使用tailwind自定义表单项的布局"
    title="表单自定义布局"
  >
    <template #description>
      <div class="text-muted-foreground">
        <p>使用tailwind自定义表单项的布局，使用Divider分割表单。</p>
      </div>
    </template>
    <template #extra>
      <DocButton class="mb-2" path="/components/common-ui/vben-form" />
    </template>
    <Card title="使用tailwind自定义布局">
      <CustomLayoutForm />
    </Card>
  </Page>
</template>
