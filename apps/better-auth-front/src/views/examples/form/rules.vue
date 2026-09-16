<script lang="ts" setup>
import { AppCard, AppCardAction, AppPage } from '@taman/app-ui';

import { useTamanForm, z } from '#/adapter/form';

const toast = useToast();

const [Form, formApi] = useTamanForm({
  commonConfig: {
    componentProps: {
      class: 'w-full',
    },
  },

  handleSubmit: onSubmit,
  layout: 'vertical',
  schema: [
    {
      component: 'Input',
      componentProps: {
        placeholder: 'Please input',
      },
      fieldName: 'field1',
      label: 'Field 1',
      rules: 'required',
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: 'Please input',
      },
      defaultValue: 'Default Value',
      fieldName: 'field2',
      label: 'Default Value (Required)',
      rules: 'required',
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: 'Please input',
      },
      fieldName: 'field3',
      label: 'Default Value (Optional)',
      rules: z.string().default('Default Value').optional(),
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: 'Please input',
      },
      fieldName: 'field31',
      label: 'Custom Information',
      rules: z.string().min(1, { message: 'Minimum 1 character' }),
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: 'Please input',
      },
      fieldName: 'field4',
      label: 'Email',
      rules: z.email('Please input a valid email'),
    },
    {
      component: 'InputNumber',
      componentProps: {
        placeholder: 'Please input',
      },
      fieldName: 'number',
      label: 'Number',
      rules: 'required',
    },
    {
      component: 'Select',
      componentProps: {
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
        placeholder: 'Please select',
      },
      defaultValue: undefined,
      fieldName: 'options',
      label: 'Dropdown',
      rules: 'selectRequired',
    },
    {
      component: 'RadioGroup',
      componentProps: {
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
      fieldName: 'radioGroup',
      label: 'Radio Group',
      rules: 'selectRequired',
    },
    {
      component: 'CheckboxGroup',
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
      fieldName: 'checkboxGroup',
      label: 'Checkbox Group',
      rules: 'selectRequired',
    },
    {
      component: 'Checkbox',
      fieldName: 'checkbox',
      componentProps: {
        label: 'I have read and agree.',
      },
      rules: z.boolean().refine((value) => value, {
        message: 'Please check the box',
      }),
    },
    {
      component: 'InputDate',
      defaultValue: undefined,
      fieldName: 'datePicker',
      label: 'Date Picker',
      rules: 'selectRequired',
    },
    {
      component: 'InputDate',
      defaultValue: undefined,
      componentProps: {
        range: true,
      },
      fieldName: 'rangePicker',
      label: 'Range Picker',
      rules: 'selectRequired',
    },
    {
      component: 'InputPassword',
      componentProps: {
        placeholder: 'Please input',
      },
      fieldName: 'password',
      label: 'Password',
      rules: 'required',
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: 'Please input',
      },
      fieldName: 'input-blur',
      formFieldProps: {
        validateOn: ['blur'],
      },
      help: 'Validation will only trigger when the input is blurred',
      label: 'Blur Trigger',
      rules: 'required',
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: 'Please input',
      },
      fieldName: 'input-async',
      label: 'Async Validation',
      rules: z
        .string()
        .min(3, 'Username must be at least 3 characters')
        .refine(
          async (username) => {
            // Async validator simulating a username availability check
            const checkUsernameExists = async (
              username: string,
            ): Promise<boolean> => {
              await new Promise((resolve) => {
                setTimeout(resolve, 1000);
              });
              return username === 'existingUser';
            };
            const exists = await checkUsernameExists(username);
            return !exists;
          },
          {
            message: 'Username already exists',
          },
        ),
    },
  ],
  // 3 columns on large screens, 2 on medium, 1 on small
  wrapperClass: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
});

function onSubmit(values: Record<string, any>) {
  toast.add({
    color: 'success',
    title: `form values: ${JSON.stringify(values)}`,
    duration: 2_000,
  });
}
</script>

<template>
  <AppPage
    content-class="flex flex-col gap-4"
    description="Form Validation Example"
    title="Form Components"
  >
    <AppCard :title="$t('examples.form.allFields.title')">
      <template #trailingHeader>
        <AppCardAction class="flex gap-2">
          <PButton
            variant="outline"
            @click="() => formApi.validate()"
          >
            Validate Form
          </PButton>

          <PButton
            variant="outline"
            @click="() => formApi.clearValidation()"
          >
            Reset Validation
          </PButton>
        </AppCardAction>
      </template>

      <Form />
    </AppCard>
  </AppPage>
</template>
