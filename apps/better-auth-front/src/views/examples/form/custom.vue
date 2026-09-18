<script lang="ts" setup>
import type { Component } from 'vue';

import { AppCard, AppPage } from '@taman/app-ui';
import PInput from 'pohon-ui/components/Input.vue';
import PSelect from 'pohon-ui/components/Select.vue';
import { h, markRaw, ref } from 'vue';

import { useTamanForm, z } from '#/adapter/form';

import TwoFields from './modules/two-fields.vue';

interface CustomFormValues {
  field?: string;
  field1?: string;
  field2?: string;
  field3?: string;
  field4?: [string | undefined, string | undefined];
  field5?: string;
}

const dynamicComponentType = ref<'input' | 'select'>('input');

function encodeCustomFormValues(values: Readonly<CustomFormValues>) {
  const { field4, ...formValues } = values;
  return {
    ...formValues,
    phoneNumber: field4?.[1],
    phoneType: field4?.[0],
  };
}

type CustomSubmitValues = ReturnType<typeof encodeCustomFormValues>;

function decodeCustomFormValues(
  values: Readonly<CustomSubmitValues>,
): CustomFormValues {
  const { phoneNumber, phoneType, ...formValues } = values;
  return {
    ...formValues,
    field4: [phoneType, phoneNumber ?? ''],
  };
}

const [Form, formApi] = useTamanForm({
  codec: {
    decode: decodeCustomFormValues,
    encode: encodeCustomFormValues,
  },

  commonConfig: {
    componentProps: {
      class: 'w-full asd',
    },
    labelClass: 'w-2/6',
  },
  fieldMappingTime: [['field4', ['phoneType', 'phoneNumber'], null]],
  handleSubmit: onSubmit,
  layout: 'horizontal',
  schema: [
    {
      component: 'Input',
      fieldName: 'field',
      label: 'Custom Suffix',
      suffix: () => h('span', { class: 'text-red-600' }, 'Rupiah'),
    },
    {
      component: 'Input',
      fieldName: 'field1',
      label: 'Custom Component Slot',
      renderComponentContent: () => ({
        prefix: () => 'prefix',
        suffix: () => 'suffix',
      }),
    },
    {
      component: h(PInput as Component, { placeholder: 'Enter Field2' }),
      fieldName: 'field2',
      label: 'Custom Component',
      modelPropName: 'value',
      rules: 'required',
    },
    {
      component: 'Input',
      fieldName: 'field3',
      label: 'Custom Component (slot)',
      rules: 'required',
    },
    {
      component: markRaw(TwoFields),
      defaultValue: [undefined, ''],
      fieldName: 'field4',
      formItemClass: 'col-span-1',
      label: 'Combined Fields',
      rules: z
        .array(z.string().optional())
        .length(2, 'Please select a type and enter a phone number')
        .refine((v) => !!v[0], {
          message: 'Please select a type',
        })
        .refine((v) => !!v[1] && v[1] !== '', {
          message: 'Please enter a phone number',
        })
        .refine((v) => v[1]?.match(/^1[3-9]\d{9}$/), {
          message: 'Phone number format is incorrect',
        }),
    },
    {
      component: markRaw(PInput),
      componentProps: {
        placeholder: 'Enter Dynamic Component Value',
      },
      fieldName: 'field5',
      label: 'Dynamic Component',
      modelPropName: 'value',
    },
  ],
  wrapperClass: 'grid-cols-1 md:grid-cols-2',
});

function handleToggleDynamicComponent() {
  const nextType = dynamicComponentType.value === 'input' ? 'select' : 'input';
  dynamicComponentType.value = nextType;

  if (nextType === 'select') {
    formApi.updateSchema([
      {
        component: markRaw(PSelect),
        componentProps: {
          allowClear: true,
          items: [
            { label: 'Option 1', value: 'option-1' },
            { label: 'Option 2', value: 'option-2' },
          ],
          placeholder: 'Select Dynamic Component Value',
        },
        fieldName: 'field5',
        modelPropName: 'value',
      },
    ]);
    return;
  }

  formApi.updateSchema([
    {
      component: markRaw(PInput),
      componentProps: {
        placeholder: 'Enter Dynamic Component Value',
      },
      fieldName: 'field5',
      modelPropName: 'value',
    },
  ]);
}

const toast = useToast();
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
    description="Example of Customizing Form Components"
    title="Form Components"
  >
    <template #trailingHeader>
      <PButton
        color="neutral"
        size="sm"
        variant="outline"
        @click="handleToggleDynamicComponent"
      >
        {{
          dynamicComponentType === 'input' ? 'Switch to Select' : 'Switch to Input'
        }}
      </PButton>
    </template>

    <AppCard title="Basic Example">
      <Form>
        <template #field3="{ componentProps }">
          <PInput
            placeholder="Enter Field3"
            v-bind="componentProps"
          />
        </template>
      </Form>
    </AppCard>
  </AppPage>
</template>
