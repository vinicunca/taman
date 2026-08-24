<script lang="ts" setup>
import { Page } from '@taman/common-ui';

import { Card, message } from 'antdv-next';

import { useTamanForm } from '#/adapter/form';

const [QueryForm] = useTamanForm({
  // Expanded by default
  collapsed: false,
  // Shared by all form items; can be overridden per form
  commonConfig: {
    // All form items
    componentProps: {
      class: 'w-full',
    },
  },
  // Submit handler
  handleSubmit: onSubmit,
  // Vertical layout: label and input on separate rows (value: vertical)
  // Horizontal layout: label and input on the same row
  layout: 'horizontal',
  schema: [
    {
      // Component must be registered in #/adapter.ts with proper types
      component: 'Input',
      // Props passed to the component
      componentProps: {
        placeholder: '请输入用户名',
      },
      // Field name
      fieldName: 'username',
      // Label shown in the UI
      label: '字符串',
    },
    {
      component: 'InputPassword',
      componentProps: {
        placeholder: '请输入密码',
      },
      fieldName: 'password',
      label: '密码',
    },
    {
      component: 'InputNumber',
      componentProps: {
        placeholder: '请输入',
      },
      fieldName: 'number',
      label: '数字(带后缀)',
      suffix: () => '¥',
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        filterOption: true,
        options: [
          {
            label: '选项1',
            value: '1',
          },
          {
            label: '选项2',
            value: '2',
          },
        ],
        placeholder: '请选择',
        showSearch: true,
      },
      fieldName: 'options',
      label: '下拉选',
    },
    {
      component: 'DatePicker',
      fieldName: 'datePicker',
      label: '日期选择框',
    },
  ],
  // Whether expandable
  showCollapseButton: true,
  submitButtonOptions: {
    content: '查询',
  },
  // 3 columns on large screens, 2 on medium, 1 on small
  wrapperClass: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
});

const [InlineForm] = useTamanForm({
  layout: 'inline',
  schema: [
    {
      // Component must be registered in #/adapter.ts with proper types
      component: 'Input',
      // Props passed to the component
      componentProps: {
        placeholder: '请输入用户名',
      },
      // Field name
      fieldName: 'username',
      // Label shown in the UI
      label: '字符串',
    },
    {
      component: 'InputPassword',
      componentProps: {
        placeholder: '请输入密码',
      },
      fieldName: 'password',
      label: '密码',
    },
    {
      component: 'InputNumber',
      componentProps: {
        placeholder: '请输入',
      },
      fieldName: 'number',
      label: '数字(带后缀)',
      suffix: () => '¥',
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        filterOption: true,
        options: [
          {
            label: '选项1',
            value: '1',
          },
          {
            label: '选项2',
            value: '2',
          },
        ],
        placeholder: '请选择',
        showSearch: true,
      },
      fieldName: 'options',
      label: '下拉选',
    },
  ],
});

const [QueryForm1] = useTamanForm({
  // Expanded by default
  collapsed: true,
  collapsedRows: 2,
  // Shared by all form items; can be overridden per form
  commonConfig: {
    // All form items
    componentProps: {
      class: 'w-full',
    },
  },
  // Submit handler
  handleSubmit: onSubmit,
  // Vertical layout: label and input on separate rows (value: vertical)
  // Horizontal layout: label and input on the same row
  layout: 'horizontal',
  schema: (() => {
    const schema = [];
    for (let index = 0; index < 14; index++) {
      schema.push({
        // Component must be registered in #/adapter.ts with proper types
        component: 'Input',
        // Field name
        fieldName: `field${index}`,
        // Label shown in the UI
        label: `字段${index}`,
      });
    }
    return schema;
  })(),
  // Whether expandable
  showCollapseButton: true,
  submitButtonOptions: {
    content: '查询',
  },
  // 3 columns on large screens, 2 on medium, 1 on small
  wrapperClass: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
});

const [QueryForm2] = useTamanForm({
  // Action button group: newLine = new row; rowEnd = inline, right-aligned (default); inline = grid default
  actionLayout: 'newLine',
  actionPosition: 'left', // Show action buttons on the left
  // Collapsed by default
  collapsed: true,
  collapsedRows: 3,
  // Shared by all form items; can be overridden per form
  commonConfig: {
    // All form items
    componentProps: {
      class: 'w-full',
    },
  },
  // Submit handler
  handleSubmit: onSubmit,
  // Vertical layout: label and input on separate rows (value: vertical)
  // Horizontal layout: label and input on the same row
  layout: 'vertical',
  schema: [
    {
      // Component must be registered in #/adapter.ts with proper types
      component: 'Input',
      // Props passed to the component
      componentProps: {
        placeholder: '请输入用户名',
      },
      // Field name
      fieldName: 'username',
      // Label shown in the UI
      label: '字符串',
    },
    {
      component: 'InputPassword',
      componentProps: {
        placeholder: '请输入密码',
      },
      fieldName: 'password',
      label: '密码',
    },
    {
      component: 'InputNumber',
      componentProps: {
        placeholder: '请输入',
      },
      fieldName: 'number',
      label: '数字(带后缀)',
      suffix: () => '¥',
    },
    {
      component: 'DatePicker',
      fieldName: 'datePicker',
      label: '日期选择框',
    },
  ],
  // Whether expandable
  showCollapseButton: true,
  submitButtonOptions: {
    content: '查询',
  },
  // 3 columns on large screens, 2 on medium, 1 on small
  wrapperClass: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
});

function onSubmit(values: Record<string, any>) {
  message.success({
    content: `form values: ${JSON.stringify(values)}`,
  });
}
</script>

<template>
  <Page
    description="查询表单，常用语和表格组合使用，可进行收缩展开。"
    title="表单组件"
  >
    <Card class="mb-5" title="查询表单，默认展开">
      <QueryForm />
    </Card>

    <Card class="mb-5" title="查询表单，单行表单">
      <InlineForm />
    </Card>

    <Card class="mb-5" title="查询表单，默认展开，垂直布局">
      <QueryForm2 />
    </Card>

    <Card title="查询表单，默认折叠，折叠时保留2行">
      <QueryForm1 />
    </Card>
  </Page>
</template>
