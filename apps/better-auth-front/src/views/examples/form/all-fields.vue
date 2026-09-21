<script lang="ts" setup>
import type { DateValue } from '@taman/utils';
import { Time } from '@internationalized/date';
import { AppCard, AppCardAction, AppPage } from '@taman/app-ui';
import { CalendarDate } from '@taman/utils';
import { useTamanForm, z } from '#/adapter/form';
import { getAllMenusApi } from '#/api';
import { $t } from '#/locales';

interface AllFieldsDateRange {
  end: DateValue | undefined;
  start: DateValue | undefined;
}

interface AllFieldsEncodedDateRange {
  end?: string;
  start?: string;
}

interface AllFieldsFormValues {
  api?: string;
  checkbox: boolean;
  checkboxGroup: Array<string>;
  date: DateValue;
  dateRange?: AllFieldsDateRange;
  desc?: string;
  fileUpload: Array<File>;
  inputMenu: string;
  month: DateValue;
  monthRange?: AllFieldsDateRange;
  username: string;
  year: DateValue;
  yearRange?: AllFieldsDateRange;
}

interface AllFieldsSubmitValues {
  api?: string;
  checkbox: boolean;
  checkboxGroup: Array<string>;
  date: string;
  dateRange?: AllFieldsEncodedDateRange;
  desc?: string;
  fileUpload: Array<File>;
  inputMenu: string;
  month: string;
  monthRange?: AllFieldsEncodedDateRange;
  username: string;
  year: string;
  yearRange?: AllFieldsEncodedDateRange;
}

const toast = useToast();
const [FormAllFields, formAllFieldsApi] = useTamanForm<
  AllFieldsFormValues,
  AllFieldsSubmitValues
>({
  // 3 columns on large screens, 2 on medium, 1 on small
  wrapperClass: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',

  commonConfig: {
    componentProps: {
      class: 'w-full',
    },
  },

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
    },

    {
      component: 'Input',
      fieldName: 'username',
      label: 'Input',
      componentProps: {
        placeholder: 'Please enter your username',
      },
      rules: 'required',
    },

    {
      component: 'Input',
      fieldName: 'desc',
      label: 'Input with description',
      description: 'This is a description of the form field',
    },

    {
      component: 'InputDate',
      fieldName: 'date',
      label: 'InputDate',
      rules: 'required',
    },

    {
      component: 'InputDate',
      fieldName: 'dateRange',
      label: 'InputDateRange',
      componentProps: {
        range: true,
      },
    },

    {
      component: 'InputDate',
      fieldName: 'month',
      componentProps: {
        type: 'month',
      },
      label: 'InputDate Month',
      rules: 'required',
    },

    {
      component: 'InputDate',
      fieldName: 'monthRange',
      componentProps: {
        type: 'month',
        range: true,
      },
      label: 'InputDate Month Range',
    },

    {
      component: 'InputDate',
      fieldName: 'year',
      componentProps: {
        type: 'year',
      },
      label: 'InputDate Year',
      rules: 'required',
    },

    {
      component: 'InputDate',
      fieldName: 'yearRange',
      componentProps: {
        type: 'year',
        range: true,
      },
      label: 'InputDate Year Range',
    },

    {
      component: 'InputMenu',
      fieldName: 'inputMenu',
      label: 'InputMenu',
      componentProps: {
        items: ['Backlog', 'Todo', 'In Progress', 'Done'],
        ui: {
          trailingIcon: 'group-data-[state=open]:rotate-180 transition-transform-280',
        },
      },
      rules: 'selectRequired',
    },

    {
      component: 'InputNumber',
      fieldName: 'inputNumber',
      label: 'InputNumber',
      componentProps: {
        min: 0,
        max: 100,
        step: 1,
      },
      rules: 'required',
    },

    {
      component: 'InputCurrency',
      fieldName: 'inputCurrency',
      label: 'InputCurrency',
      componentProps: {
        formatOptions: {
          style: 'currency',
          currency: 'IDR',
        },
      },
    },

    {
      component: 'InputRating',
      fieldName: 'inputRating',
      label: 'InputRating',
    },

    {
      component: 'InputTags',
      fieldName: 'inputTags',
      label: 'InputTags',
      defaultValue: ['Vue'],
    },

    {
      component: 'InputTime',
      fieldName: 'inputTime',
      label: 'InputTime',
      defaultValue: new Time(12, 30, 0),
      componentProps: {
        ui: {
          base: 'justify-center',
        },
      },
    },

    {
      component: 'PinInput',
      fieldName: 'pinInput',
      label: 'PinInput',
      rules: 'required',
    },

    {
      component: 'RadioGroup',
      fieldName: 'radioGroup',
      label: 'RadioGroup',
      componentProps: {
        items: [
          {
            label: 'Option 1',
            value: 1,
          },
          {
            label: 'Option 2',
            value: 2,
          },
          {
            label: 'Option 3',
            value: 3,
          },
        ],
      },
      defaultValue: 2,
      rules: 'required',
    },

    {
      component: 'Select',
      fieldName: 'select',
      label: 'Select',
      componentProps: {
        items: ['Backlog', 'Todo', 'In Progress', 'Done'],
      },
      rules: 'required',
    },

    {
      component: 'SelectMenu',
      fieldName: 'selectMenu',
      label: 'SelectMenu',
      componentProps: {
        items: [
          ['Apple', 'Banana', 'Blueberry', 'Grapes', 'Pineapple'],
          ['Aubergine', 'Broccoli', 'Carrot', 'Courgette', 'Leek'],
        ],
      },
      rules: 'required',
    },

    {
      component: 'Slider',
      fieldName: 'slider',
      label: 'Slider',
      rules: 'required',
    },

    {
      component: 'Switch',
      fieldName: 'switch',
      label: 'Switch',
      rules: 'required',
    },

    {
      component: 'Textarea',
      fieldName: 'textarea',
      label: 'Textarea',
      rules: 'required',
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
      fieldName: 'selectFetch',
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

function handleSetFormValue() {
  const date = new CalendarDate(2026, 9, 15);

  formAllFieldsApi.setValues({
    checkbox: true,
    checkboxGroup: ['1', '2'],
    date,
    dateRange: {
      end: date.add({ days: 7 }),
      start: date,
    },
    month: date,
    monthRange: {
      end: date.add({ months: 1 }),
      start: date,
    },
    year: date,
    yearRange: {
      end: date.add({ years: 1 }),
      start: date,
    },
    username: 'test',
    inputMenu: 'Backlog',
  });
}

function onSubmit(
  values: AllFieldsSubmitValues,
) {
  console.warn('🚀 ~ onSubmit ~ values:', values);
}

function onCompactSubmit(values: Record<string, any>) {
  console.warn('🚀 ~ onCompactSubmit ~ values:', values);
}

const [CompactForm] = useTamanForm({
  compact: true,
  commonConfig: {
    componentProps: {
      class: 'w-full',
    },
    hideRequiredMark: true,
  },
  handleSubmit: onCompactSubmit,
  schema: [
    {
      component: 'Input',
      componentProps: {
        placeholder: 'Please enter your username',
      },
      fieldName: 'compactUsername',
      label: 'Username',
      rules: 'required',
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: 'name@example.com',
      },
      fieldName: 'compactEmail',
      label: 'Email',
      rules: 'required',
    },
  ],
  wrapperClass: 'grid-cols-1 md:grid-cols-2',
});
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

    <AppCard title="Compact, Hidden Required Mark">
      <p class="text-muted-foreground text-sm mb-4">
        <code>compact</code> removes the space reserved under each field for its validation
        message, and suppresses the inline validation message entirely &mdash; a compact form
        must surface errors another way (here, the control's own error colour) since no
        message renders. <code>commonConfig.hideRequiredMark</code> hides the asterisk on
        required fields. Try submitting empty: both fields turn red with no message or
        asterisk, which is <code>compact</code> working as designed, not a broken form.
      </p>
      <CompactForm />
    </AppCard>
  </AppPage>
</template>
