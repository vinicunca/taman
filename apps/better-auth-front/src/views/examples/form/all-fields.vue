<script lang="ts" setup>
import { AppCard, AppCardAction, AppPage, TamanFileUpload } from '@taman/app-ui';
import { ref } from 'vue';
import { useTamanForm, z } from '#/adapter/form';
import { getAllMenusApi } from '#/api';
import { $t } from '#/locales';

const toast = useToast();
const [FormAllFields] = useTamanForm({
  // 3 columns on large screens, 2 on medium, 1 on small
  wrapperClass: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',

  commonConfig: {
    colon: true,
    componentProps: {
      class: 'w-full',
    },
  },

  layout: 'horizontal',

  schema: [
    {
      component: 'Checkbox',
      fieldName: 'checkbox',
      componentProps: {
        label: 'I have read and agree.',
      },
      rules: z
        .boolean()
        .refine((v) => v, { message: 'Why not agree? Check the box!' }),
    },

    {
      component: 'CheckboxGroup',
      fieldName: 'checkboxGroup',
      label: 'Checkbox Group',
      componentProps: {
        name: 'cname',
        items: [
          {
            label: 'Option 1',
            value: '1',
          },
          {
            label: 'Option 2',
            value: '2',
          },
        ],
      },
      rules: z
        .array(
          z.string(),
        )
        .min(1, { message: 'Please select at least one option' }),
    },

    {
      component: 'FileUpload',
      fieldName: 'fileUpload',
      label: 'File Upload',
      componentProps: {
        accept: 'image/*',
        label: 'Drop your images here',
        multiple: true,
        description: 'SVG, PNG, JPG or GIF (max. 2MB)',
        labelActions: 'Select images',
        labelPreview: 'Files',
        labelAddMore: 'Add more',
      },
      rules: 'selectRequired',
    },

    {
      component: 'Input',
      fieldName: 'username',
      label: 'String',
      componentProps: {
        placeholder: 'Please enter your username',
      },
      rules: 'required',
    },

    {
      component: 'Input',
      fieldName: 'desc',
      label: 'String with description',
      description: 'This is a description of the form field',
    },

    {
      component: 'SelectFetch',
      componentProps: {
        afterFetch: async (data: Array<{ name: string; path: string }>) => {
          return data.map((item) => ({
            label: item.name,
            value: item.path,
          }));
        },
        api: getAllMenusApi,
        autoSelect: 'first',
      },
      fieldName: 'api',
      label: 'Select Fetch',
    },
  ],

  handleSubmit: onSubmit,

  handleValuesChange: (_values, fields) => {
    toast.add({
      color: 'neutral',
      title: `The following fields in the form have changed: ${fields.join(', ')}`,
      duration: 2_000,
    });
  },
});

function onSubmit(values: Record<string, any>) {

}

function handleSetFormValue() {
  toast.add({
    color: 'neutral',
    title: 'Changed',
    duration: 2_000,
  });
}
</script>

<template>
  <AppPage
    content-class="flex flex-col gap-4"
    :description="$t('examples.form.allFields.description')"
    :title="$t('examples.form.allFields.title')"
  >
    <template #trailingHeader>
      <PButton
        color="neutral"
        size="sm"
        variant="outline"
      >
        {{ $t('page.viewDocs') }}
      </PButton>
    </template>

    <AppCard :title="$t('examples.form.allFields.title')">
      <template #trailingHeader>
        <AppCardAction>
          <PButton
            @click="handleSetFormValue"
          >
            {{ $t('examples.form.setFormValues') }}
          </PButton>
        </AppCardAction>
      </template>

      <FormAllFields />
    </AppCard>
  </AppPage>
</template>
