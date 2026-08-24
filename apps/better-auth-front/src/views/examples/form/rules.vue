<script lang="ts" setup>
import { Page } from '@taman/common-ui';

import { Button, Card, message } from 'antdv-next';

import { useTamanForm, z } from '#/adapter/form';

const [Form, formApi] = useTamanForm({
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
        placeholder: '请输入',
      },
      // Field name
      fieldName: 'field1',
      // Label shown in the UI
      label: '字段1',
      rules: 'required',
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: '请输入',
      },
      defaultValue: '默认值',
      fieldName: 'field2',
      label: '默认值(必填)',
      rules: 'required',
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: '请输入',
      },
      fieldName: 'field3',
      label: '默认值(非必填)',
      rules: z.string().default('默认值').optional(),
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: '请输入',
      },
      fieldName: 'field31',
      label: '自定义信息',
      rules: z.string().min(1, { message: '最少输入1个字符' }),
    },
    {
      component: 'Input',
      // Props passed to the component
      componentProps: {
        placeholder: '请输入',
      },
      // Field name
      fieldName: 'field4',
      // Label shown in the UI
      label: '邮箱',
      rules: z.string().email('请输入正确的邮箱'),
    },
    {
      component: 'InputNumber',
      componentProps: {
        placeholder: '请输入',
      },
      fieldName: 'number',
      label: '数字',
      rules: 'required',
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
      defaultValue: undefined,
      fieldName: 'options',
      label: '下拉选',
      rules: 'selectRequired',
    },
    {
      component: 'RadioGroup',
      componentProps: {
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
      },
      fieldName: 'radioGroup',
      label: '单选组',
      rules: 'selectRequired',
    },
    {
      component: 'CheckboxGroup',
      componentProps: {
        name: 'cname',
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
      },
      fieldName: 'checkboxGroup',
      label: '多选组',
      rules: 'selectRequired',
    },
    {
      component: 'Checkbox',
      fieldName: 'checkbox',
      label: '',
      renderComponentContent: () => {
        return {
          default: () => ['我已阅读并同意'],
        };
      },
      rules: z.boolean().refine((value) => value, {
        message: '请勾选',
      }),
    },
    {
      component: 'DatePicker',
      defaultValue: undefined,
      fieldName: 'datePicker',
      label: '日期选择框',
      rules: 'selectRequired',
    },
    {
      component: 'RangePicker',
      defaultValue: undefined,
      fieldName: 'rangePicker',
      label: '区间选择框',
      rules: 'selectRequired',
    },
    {
      component: 'InputPassword',
      componentProps: {
        placeholder: '请输入',
      },
      fieldName: 'password',
      label: '密码',
      rules: 'required',
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: '请输入',
      },
      fieldName: 'input-blur',
      formFieldProps: {
        validateOnChange: false,
        validateOnModelUpdate: false,
      },
      help: 'blur时才会触发校验',
      label: 'blur触发',
      rules: 'required',
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: '请输入',
      },
      fieldName: 'input-async',
      label: '异步校验',
      rules: z
        .string()
        .min(3, '用户名至少需要3个字符')
        .refine(
          async (username) => {
            // Async validator simulating a username availability check
            const checkUsernameExists = async (
              username: string,
            ): Promise<boolean> => {
              await new Promise((resolve) => setTimeout(resolve, 1000));
              return username === 'existingUser';
            };
            const exists = await checkUsernameExists(username);
            return !exists;
          },
          {
            message: '用户名已存在',
          },
        ),
    },
  ],
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
  <Page description="表单校验示例" title="表单组件">
    <Card title="基础组件校验示例">
      <template #extra>
        <Button @click="() => formApi.validate()">校验表单</Button>
        <Button class="mx-2" @click="() => formApi.resetValidate()">
          清空校验信息
        </Button>
      </template>
      <Form />
    </Card>
  </Page>
</template>
