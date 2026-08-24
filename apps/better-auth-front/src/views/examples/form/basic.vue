<script lang="ts" setup>
import { AppCard, AppCardAction, AppPage } from '@taman/app-ui';
import { useDebounceFn } from '@vueuse/core';
import dayjs from 'dayjs';
import { h, ref, toRaw } from 'vue';

import { useTamanForm, z } from '#/adapter/form';
import { getAllMenusApi } from '#/api';
import { upload_file } from '#/api/examples/upload';
import { $t } from '#/locales';

const keyword = ref('');
const fetching = ref(false);
// Mock remote data fetch
function fetchRemoteOptions({ keyword = '选项' }: Record<string, any>) {
  fetching.value = true;
  return new Promise((resolve) => {
    setTimeout(() => {
      const options = Array.from({ length: 10 }).map((_, index) => ({
        label: `${keyword}-${index}`,
        value: `${keyword}-${index}`,
      }));
      resolve(options);
      fetching.value = false;
    }, 1000);
  });
}

const [BaseForm, baseFormApi] = useTamanForm({
  // Shared by all form items; can be overridden per form
  commonConfig: {
    // Show a colon after the label
    colon: true,
    // All form items
    componentProps: {
      class: 'w-full',
    },
  },
  fieldMappingTime: [['rangePicker', ['startTime', 'endTime'], 'YYYY-MM-DD']],
  // Submit handler
  handleSubmit: onSubmit,
  handleValuesChange(_values, fieldsChanged) {
    message.info(`表单以下字段发生变化：${fieldsChanged.join('，')}`);
  },

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
      rules: 'required',
    },
    {
      component: 'Input',
      fieldName: 'desc',
      // Description shown in the UI
      description: '这是表单描述',
      label: '字符串(带描述)',
    },
    {
      // Component must be registered in #/adapter.ts with proper types
      component: 'ApiSelect',
      // Props passed to the component
      componentProps: {
        // Transform menu API response to options format
        afterFetch: (data: Array<{ name: string; path: string }>) => {
          return data.map((item: any) => ({
            label: item.name,
            value: item.path,
          }));
        },
        // Menu API
        api: getAllMenusApi,
        autoSelect: 'first',
      },
      // Field name
      fieldName: 'api',
      // Label shown in the UI
      label: 'ApiSelect',
    },
    {
      component: 'ApiSelect',
      // Props passed to the component
      componentProps: () => {
        return {
          api: fetchRemoteOptions,
          // Disable local filtering
          filterOption: false,
          // Show loading via slot while fetching data
          notFoundContent: fetching.value ? undefined : null,
          // Track search term changes; debounce with useDebounceFn.
          onSearch: useDebounceFn((value: string) => {
            keyword.value = value;
          }, 300),
          // Remote search params; updated when search term changes
          params: {
            keyword: keyword.value || undefined,
          },
          // Remote search gate; API is called only when true
          shouldFetch: (params: any) => {
            return !!params?.keyword;
          },
          showSearch: true,
        };
      },
      // Field name
      fieldName: 'remoteSearch',
      // Label shown in the UI
      label: '远程搜索',
      help: '远程查询，仅有输入时方进行查询',
      renderComponentContent: () => {
        return {
          notFoundContent: fetching.value ? h(Spin) : undefined,
        };
      },
      rules: 'selectRequired',
    },
    {
      component: 'ApiTreeSelect',
      // Props passed to the component
      componentProps: {
        // Menu API
        api: getAllMenusApi,
        // Transform menu API response to options format
        labelField: 'name',
        valueField: 'path',
        childrenField: 'children',
      },
      // Field name
      fieldName: 'apiTree',
      // Label shown in the UI
      label: 'ApiTreeSelect',
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
      component: 'IconPicker',
      fieldName: 'icon',
      label: '图标',
    },
    {
      colon: false,
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
      label: () => h('div', { color: 'warning' }, () => '😎自定义：'),
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
    },
    {
      component: 'Radio',
      fieldName: 'radio',
      label: '',
      renderComponentContent: () => {
        return {
          default: () => ['Radio'],
        };
      },
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
      rules: z
        .boolean()
        .refine((v) => v, { message: '为什么不同意？勾上它！' }),
    },
    {
      component: 'Mentions',
      componentProps: {
        options: [
          {
            label: 'afc163',
            value: 'afc163',
          },
          {
            label: 'zombieJ',
            value: 'zombieJ',
          },
        ],
        placeholder: '请输入',
      },
      fieldName: 'mentions',
      label: '提及',
    },
    {
      component: 'Rate',
      fieldName: 'rate',
      label: '评分',
    },
    {
      component: 'Switch',
      componentProps: {
        class: 'w-auto',
      },
      fieldName: 'switch',
      help: () =>
        ['这是一个多行帮助信息', '第二行', '第三行'].map((v) => h('p', v)),
      label: '开关',
    },
    {
      component: 'DatePicker',
      fieldName: 'datePicker',
      help: (values) =>
        [`这是一个可输出其他字段值的帮助信息${values?.rate}`].map((v) =>
          h('p', v),
        ),
      label: '日期选择框',
    },
    {
      component: 'RangePicker',
      fieldName: 'rangePicker',
      label: '范围选择器',
    },
    {
      component: 'TimePicker',
      fieldName: 'timePicker',
      label: '时间选择框',
    },
    {
      component: 'TreeSelect',
      componentProps: {
        allowClear: true,
        placeholder: '请选择',
        showSearch: true,
        treeData: [
          {
            label: 'root 1',
            value: 'root 1',
            children: [
              {
                label: 'parent 1',
                value: 'parent 1',
                children: [
                  {
                    label: 'parent 1-0',
                    value: 'parent 1-0',
                    children: [
                      {
                        label: 'my leaf',
                        value: 'leaf1',
                      },
                      {
                        label: 'your leaf',
                        value: 'leaf2',
                      },
                    ],
                  },
                  {
                    label: 'parent 1-1',
                    value: 'parent 1-1',
                  },
                ],
              },
              {
                label: 'parent 2',
                value: 'parent 2',
              },
            ],
          },
        ],
        treeNodeFilterProp: 'label',
      },
      fieldName: 'treeSelect',
      label: '树选择',
    },
    {
      component: 'Upload',
      componentProps: {
        // More props: https://ant.design/components/upload-cn
        accept: '.png,.jpg,.jpeg',
        // Automatically attach auth credentials
        customRequest: upload_file,
        disabled: false,
        maxCount: 3,
        // Unit: MB
        maxSize: 2,
        multiple: false,
        showUploadList: true,
        // Built-in upload list styles: text, picture, picture-card, picture-circle
        listType: 'picture-card',
        draggable: true, // Enable drag-and-drop reordering
        // onChange is overridden; extend here for custom behavior
        handleChange: ({ file }: { file: UploadFile }) => {
          const { name, status } = file;
          if (status === 'done') {
            message.success(`${name} ${$t('examples.form.upload-success')}`);
          } else if (status === 'error') {
            message.error(`${name} ${$t('examples.form.upload-fail')}`);
          }
        },
        onDragSort: (oldIndex: number, newIndex: number) => {
          console.warn(`图片从 ${oldIndex} 移动到 ${newIndex}`);
        },
      },
      fieldName: 'files',
      label: $t('examples.form.file'),
      renderComponentContent: () => {
        return {
          default: () => $t('examples.form.upload-image'),
        };
      },
      rules: 'selectRequired',
    },
    {
      component: 'Upload',
      componentProps: {
        accept: '.png,.jpg,.jpeg',
        customRequest: upload_file,
        maxCount: 1,
        maxSize: 2,
        listType: 'picture-card',
        // Enable image cropping (skipped for multi-select or non-image files)
        crop: true,
        // Crop aspect ratio
        aspectRatio: '1:1',
      },
      fieldName: 'cropImage',
      label: $t('examples.form.crop-image'),
      renderComponentContent: () => {
        return {
          default: () => $t('examples.form.upload-image'),
        };
      },
      rules: 'selectRequired',
    },
    {
      component: 'RichEditor',
      fieldName: 'richEditor',
      label: '富文本',
      formItemClass: 'col-span-3 items-baseline',
    },
  ],
  // 3 columns on large screens, 2 on medium, 1 on small
  wrapperClass: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
});

function onSubmit(values: Record<string, any>) {
  const files = toRaw(values.files) as Array<UploadFile>;
  const cropImage = (toRaw(values.cropImage) ?? []) as Array<UploadFile>;
  const doneFiles = files.filter((file) => file.status === 'done');
  const failedFiles = files.filter((file) => file.status !== 'done');
  const doneCrop = cropImage.filter((file) => file.status === 'done');
  const failedCrop = cropImage.filter((file) => file.status !== 'done');

  const msg = [
    ...doneFiles.map((file) => file.response?.url || file.url),
    ...failedFiles.map((file) => file.name),
  ].join(', ');
  const msgCrop = [
    ...doneCrop.map((file) => file.response?.url || file.url),
    ...failedCrop.map((file) => file.name),
  ].join(', ');

  if (failedFiles.length === 0) {
    message.success({
      content: `${$t('examples.form.upload-urls')}: ${msg}`,
    });
  } else {
    message.error({
      content: `${$t('examples.form.upload-error')}: ${msg}`,
    });
    return;
  }
  if (doneCrop.length > 0 && failedCrop.length === 0) {
    message.success({
      content: `${$t('examples.form.upload-urls')}: ${msgCrop}`,
    });
  } else if (failedCrop.length > 0) {
    message.error({
      content: `${$t('examples.form.upload-error')}: ${msgCrop}`,
    });
    return;
  }
  // Replace with actual URLs before submit if needed
  values.files = doneFiles.map((file) => file.response?.url || file.url);
  values.cropImage = doneCrop.map((file) => file.response?.url || file.url);
  message.success({
    content: `form values: ${JSON.stringify(values)}`,
  });
}

function handleSetFormValue() {
  /**
   * Set multiple form field values
   */
  baseFormApi.setValues({
    checkboxGroup: ['1'],
    datePicker: dayjs('2022-01-01'),
    files: [
      {
        name: 'example.png',
        status: 'done',
        uid: '-1',
        url: 'https://unpkg.com/@vbenjs/static-source@0.1.7/source/logo-v1.webp',
      },
    ],
    mentions: '@afc163',
    number: 3,
    options: '1',
    password: '2',
    radioGroup: '1',
    rangePicker: [dayjs('2022-01-01'), dayjs('2022-01-02')],
    rate: 3,
    switch: true,
    timePicker: dayjs('2022-01-01 12:00:00'),
    treeSelect: 'leaf1',
    username: '1',
    richEditor: `
      <h1>Vben Tiptap</h1>
      <p>这个编辑器已经被封装在 <code>packages/effects/plugins/src/tiptap</code> 中。</p>
      <p>你可以直接在各个 app 里通过 <code>@vben/plugins/tiptap</code> 引入。</p>
      <blockquote>默认内置 StarterKit、Underline、TextAlign、Placeholder。</blockquote>
    `,
  });

  // Set a single form field value
  baseFormApi.setFieldValue('checkbox', true);
}
</script>

<template>
  <AppPage
    content-class="flex flex-col gap-4"
    description="This is a basic example of a form component. Please note that the parameter code used on this page will have some simple comments added for easier understanding. Please review them carefully."
    title="Basic Form"
  >
    <AppCard title="Basic Form">
      <template #trailingHeader>
        <AppCardAction>
          <Button
            type="primary"
            @click="handleSetFormValue"
          >
            Set Form Value
          </Button>
        </AppCardAction>
      </template>
      <BaseForm />
    </AppCard>
  </AppPage>
</template>
