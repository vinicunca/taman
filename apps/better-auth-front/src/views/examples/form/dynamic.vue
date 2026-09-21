<script lang="ts" setup>
import { AppCard, AppCardAction, AppPage } from '@taman/app-ui';

import { useTamanForm } from '#/adapter/form';

const [Form, formApi] = useTamanForm({
  handleSubmit: onSubmit,
  submitOnChange: true,

  schema: [
    {
      component: 'Input',
      defaultValue: 'hidden value',
      dependencies: {
        resolve: () => ({ show: false }),
        triggerFields: ['field1Switch'],
      },
      fieldName: 'hiddenField',
      label: 'Hidden Field',
    },
    {
      component: 'Switch',
      defaultValue: true,
      fieldName: 'field1Switch',
      help: 'Destroyed by DOM control',
      label: 'Show Field 1',
    },
    {
      component: 'Switch',
      defaultValue: true,
      fieldName: 'field2Switch',
      help: 'Hidden by CSS control',
      label: 'Show Field 2',
    },
    {
      component: 'Switch',
      fieldName: 'field3Switch',
      label: 'Disable Field 3',
    },
    {
      component: 'Switch',
      fieldName: 'field4Switch',
      label: 'Field 4 Required',
    },
    {
      component: 'Input',
      dependencies: {
        resolve({ values }) {
          return { if: !!values.field1Switch };
        },
        triggerFields: ['field1Switch'],
      },
      fieldName: 'field1',
      label: 'Field 1',
    },
    {
      component: 'Input',
      dependencies: {
        resolve({ values }) {
          return { show: !!values.field2Switch };
        },
        triggerFields: ['field2Switch'],
      },
      fieldName: 'field2',
      label: 'Field 2',
    },
    {
      component: 'Input',
      dependencies: {
        resolve({ values }) {
          return { disabled: !!values.field3Switch };
        },
        triggerFields: ['field3Switch'],
      },
      fieldName: 'field3',
      label: 'Field 3',
    },
    {
      component: 'Input',
      dependencies: {
        resolve({ values }) {
          return { required: !!values.field4Switch };
        },
        triggerFields: ['field4Switch'],
      },
      fieldName: 'field4',
      label: 'Field 4',
    },
    {
      component: 'Input',
      dependencies: {
        resolve({ values }) {
          if (values.field1 === '123') {
            return { rules: 'required' };
          }
          return { rules: null };
        },
        triggerFields: ['field1'],
      },
      fieldName: 'field5',
      help: 'When the value of field 1 is `123`, it is required',
      label: 'Dynamic Rules',
    },
    {
      component: 'Select',
      componentProps: {
        class: 'w-full',
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
      dependencies: {
        resolve({ values }) {
          if (values.field2 === '123') {
            return {
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
                  {
                    label: 'Option 3',
                    value: '3',
                  },
                ],
              },
            };
          }
          return { componentProps: {} };
        },
        triggerFields: ['field2'],
      },
      fieldName: 'field6',
      help: 'When the value of field 2 is `123`, change the dropdown options',
      label: 'Dynamic Configuration',
    },
    {
      component: 'Input',
      fieldName: 'field7',
      label: 'Field 7',
    },
  ],

  wrapperClass: 'grid-cols-1 md:grid-cols-3 lg:grid-cols-4',
});

const [SyncForm] = useTamanForm({
  handleSubmit: onSubmit,
  schema: [
    {
      component: 'Input',
      fieldName: 'field1',
      label: 'Field 1',
    },
    {
      component: 'Input',
      componentProps: {
        disabled: true,
      },
      dependencies: {
        resolve({ actions, values }) {
          actions.setFieldValue('field2', values.field1);
        },
        triggerFields: ['field1'],
      },
      fieldName: 'field2',
      label: 'Field 2',
    },
  ],
  wrapperClass: 'grid-cols-1 md:grid-cols-3 lg:grid-cols-4',
});

const toast = useToast();

function onSubmit(values: Record<string, any>) {
  toast.add({
    color: 'success',
    title: `form values: ${JSON.stringify(values)}`,
    duration: 2_000,
  });
}

function handleDelete() {
  formApi.setState((prev) => {
    return {
      schema: prev.schema?.filter((item) => item.fieldName !== 'field7'),
    };
  });
}

function handleAdd() {
  formApi.setState((prev) => {
    return {
      schema: [
        ...(prev?.schema ?? []),
        {
          component: 'Input',
          fieldName: `field${Date.now()}`,
          label: 'Field +',
        },
      ],
    };
  });
}

function handleUpdate() {
  formApi.setState((prev) => {
    return {
      schema: prev.schema?.map((item) => {
        if (item.fieldName === 'field3') {
          return {
            ...item,
            label: 'Field 3-Modify',
          };
        }
        return item;
      }),
    };
  });
}
</script>

<template>
  <AppPage
    content-class="flex flex-col gap-4"
    description="Form dynamic linking example, including common scenarios. Add, delete, and modify,本质上上是修改schema，你也可以通过 `setState` 动态修改schema。"
    title="Form Components"
  >
    <AppCard title="Form Dynamic Linking Example">
      <template #trailingHeader>
        <AppCardAction class="flex gap-2">
          <PButton
            variant="outline"
            @click="handleUpdate"
          >
            Modify Field 3
          </PButton>

          <PButton
            variant="outline"
            @click="handleDelete"
          >
            Delete Field 7
          </PButton>

          <PButton
            variant="outline"
            @click="handleAdd"
          >
            Add Field
          </PButton>
        </AppCardAction>
      </template>

      <p class="text-muted-foreground text-sm mb-4">
        <code>submitOnChange</code> submits the form as field values change, debounced by
        <code>changeDebouncedTime</code> (default 300ms) so rapid typing only submits once.
      </p>

      <Form />
    </AppCard>

    <AppCard title="Field synchronization, field 1 data and field 2 data synchronization">
      <SyncForm />
    </AppCard>
  </AppPage>
</template>
