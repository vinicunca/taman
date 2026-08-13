<script lang="ts" setup>
import { z } from 'zod';

import { useTamanForm } from '../../use-taman-form';

const [Form, formApi] = useTamanForm({
  fields: [
    {
      component: 'Input',
      name: 'contacts',
      repeat: {
        addLabel: 'Add contact',
        fields: [
          { component: 'Input', label: 'Email', name: 'email', rules: z.string().min(1, 'email required') },
        ],
        max: 3,
        min: 1,
        sortable: true,
      },
    },
  ],
  initialValues: { contacts: [{ email: 'first@x.co' }] },
  showDefaultActions: false,
});

defineExpose({ formApi });
</script>

<template>
  <Form />
</template>
