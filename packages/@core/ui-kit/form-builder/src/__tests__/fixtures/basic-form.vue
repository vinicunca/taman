<script lang="ts" setup>
import { z } from 'zod';

import { useTamanForm } from '../../use-taman-form';

const emit = defineEmits<{ submitted: [values: Record<string, any>] }>();

const [Form, formApi] = useTamanForm({
  fields: [
    { component: 'Input', label: 'Email', name: 'user.email', rules: z.string().min(1, 'required') },
    { component: 'Input', label: 'Nick', name: 'nick' },
    { component: 'Input', label: 'Custom', name: 'custom' },
  ],
  handleSubmit: (values) => emit('submitted', values),
  initialValues: { user: { email: '' }, nick: 'n0' },
});

defineExpose({ formApi });
</script>

<template>
  <Form>
    <template #custom="{ field }">
      <input class="custom-slot" :data-field="field.name" />
    </template>
  </Form>
</template>
