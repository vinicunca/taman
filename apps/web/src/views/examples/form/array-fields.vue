<script setup lang="ts">
import type { TamanFormSchema } from '#/adapter/form';
import { AppCard, AppPage } from '@taman/app-ui';
import { computed, ref } from 'vue';

import { useTamanForm, z } from '#/adapter/form';

interface ContactFormValues {
  enabled: boolean;
  name: string;
  phone?: string;
  role: 'member' | 'owner' | 'viewer';
}

interface ArrayFormValues extends Record<string, unknown> {
  contacts: Array<ContactFormValues>;
  description?: string;
  planName: string;
}

function encodeArrayFormValues(values: Readonly<ArrayFormValues>) {
  return {
    ...values,
    contacts: values.contacts.map(({ phone, ...contact }) => {
      const trimmedPhone = phone?.trim();
      return {
        ...contact,
        name: contact.name.trim(),
        ...(trimmedPhone ? { phone: trimmedPhone } : {}),
      };
    }),
  };
}

type ArraySubmitValues = ReturnType<typeof encodeArrayFormValues>;

function decodeArrayFormValues(
  values: Readonly<ArraySubmitValues>,
): ArrayFormValues {
  return {
    ...values,
    contacts: values.contacts.map((contact) => ({
      ...contact,
      phone: contact.phone ?? '',
    })),
  };
}

const submitValues = ref<Partial<ArraySubmitValues>>({});
const formattedSubmitValues = computed(() =>
  JSON.stringify(submitValues.value, null, 2),
);
const outputClass = [
  'bg-background-muted',
  'color-text-muted',
  'max-h-105',
  'overflow-auto',
  'rounded-md',
  'p-3',
  'text-xs',
];

const schema: Array<TamanFormSchema<ArrayFormValues>> = [
  {
    component: 'Input',
    componentProps: {
      placeholder: 'Please enter the plan name.',
    },
    defaultValue: 'On-Duty Contact Configuration',
    fieldName: 'planName',
    label: 'Proposal Name',
    rules: z.string().min(1, 'Please enter the plan name.'),
  },
  {
    component: 'Textarea',
    dependencies: {
      resolve({ values }) {
        const planName = values.planName;
        return {
          componentProps: {
            disabled: !planName,
            placeholder: planName ? `${planName} additional description` : 'Please enter the plan name first',
            rows: 2,
          },
          required: String(values.planName ?? '').includes('On-Duty'),
          rules: String(values.planName ?? '').includes('On-Duty')
            ? z.string().min(2, 'Please enter at least 2 characters')
            : z.string().optional(),
        };
      },
      triggerFields: ['planName'],
    },
    fieldName: 'description',
    formItemClass: 'col-span-1 md:col-span-2',
    label: 'Plan Description',
  },
  {
    arrayProps: {
      addButtonText: 'Add Contact',
      createRow: () => ({
        enabled: true,
        name: '',
        phone: '',
        role: 'member',
      }),
      max: 5,
      min: 1,
    },
    children: [
      {
        component: 'Input',
        componentProps: (ctx) => ({
          placeholder: `第 ${(ctx.rowIndex ?? 0) + 1} row name`,
        }),
        defaultValue: '',
        fieldName: 'name',
        label: 'Name',
        rules: z.string().trim().min(1, 'Please enter the name'),
      },
      {
        component: 'Select',
        componentProps: {
          items: [
            { label: 'Owner', value: 'owner' },
            { label: 'Member', value: 'member' },
            { label: 'Observer', value: 'viewer' },
          ],
        },
        defaultValue: 'member',
        fieldName: 'role',
        label: 'Role',
        rules: 'selectRequired',
      },
      {
        component: 'Input',
        dependencies: {
          resolve({ schema }) {
            return {
              componentProps: {
                disabled: schema?.row?.role === 'viewer',
                placeholder:
                  schema?.row?.role === 'viewer' ? 'Observer does not need a phone' : 'Please enter the phone',
              },
            };
          },
          triggerFields: ['role'],
        },
        fieldName: 'phone',
        label: 'Phone',
        rules: z.string().optional(),
      },
      {
        component: 'Switch',
        componentProps: {
          checkedChildren: 'Enabled',
          unCheckedChildren: 'Disabled',
        },
        defaultValue: true,
        fieldName: 'enabled',
        label: 'Status',
      },
    ],
    defaultValue: [
      {
        enabled: true,
        name: 'John Doe',
        phone: ' 10086 ',
        role: 'owner',
      },
    ],
    fieldName: 'contacts',
    formItemClass: 'col-span-1 md:col-span-2',
    label: 'Contacts',
    rules: z.array(z.any()).min(1, 'Please add at least one contact'),
    type: 'array',
  },
];

const toast = useToast();
const [Form, formApi] = useTamanForm({
  codec: {
    decode: decodeArrayFormValues,
    encode: encodeArrayFormValues,
  },
  handleSubmit: (values) => {
    submitValues.value = values;
    toast.add({
      title: 'Validation passed',
      color: 'success',
    });
  },
  schema,
  showDefaultActions: false,
  wrapperClass: 'grid-cols-1 gap-x-4 md:grid-cols-2',
});

async function handleSubmit() {
  await formApi.validateAndSubmit();
}

async function handleGetValues() {
  submitValues.value = await formApi.getValues();
}

function handlePatchChildRule() {
  formApi.updateSchema([
    {
      fieldName: 'contacts.phone',
      rules: z.string().min(5, 'Phone must be at least 5 characters'),
    },
  ]);
  toast.add({
    title: 'Dynamic update child field rules',
    color: 'success',
  });
}
</script>

<template>
  <AppPage title="Form Array Demo">
    <div class="gap-4 grid xl:grid-cols-[minmax(0,1fr)_360px]">
      <AppCard title="Array Fields">
        <Form />

        <div class="mt-4 flex flex-wrap gap-4">
          <PButton
            @click="handleSubmit"
          >
            Submit
          </PButton>
          <PButton @click="handleGetValues">
            Get Values
          </PButton>
          <PButton @click="handlePatchChildRule">
            Update Phone Rule
          </PButton>
        </div>
      </AppCard>

      <AppCard title="Output">
        <pre
          :class="outputClass"
          v-text="formattedSubmitValues"
        />
      </AppCard>
    </div>
  </AppPage>
</template>
