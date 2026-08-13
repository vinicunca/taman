<script lang="ts" setup>
import { z } from 'zod';

import { useTamanForm } from '../../use-taman-form';

const emit = defineEmits<{ submitted: [values: Record<string, any>] }>();

const [Form, formApi] = useTamanForm({
  fields: [
    { component: 'Input', label: 'Name', name: 'name', rules: z.string().min(1, 'name required') },
    {
      component: 'Input',
      dependencies: {
        if: (values) => values.name !== '',
        triggerFields: ['name'],
      },
      label: 'Slug',
      name: 'meta.slug',
      rules: z.string().min(1, 'slug required'),
    },
    {
      component: 'Input',
      label: 'Window',
      name: 'window',
      transform: {
        in: (_v, values) => [values.from, values.to].filter(Boolean).join('|'),
        out: (value: any, setExtra) => {
          const [from, to] = String(value ?? '').split('|');
          setExtra('from', from || undefined);
          setExtra('to', to || undefined);
          return undefined;
        },
      },
    },
  ],
  handleSubmit: (values) => emit('submitted', values),
  // meta.slug is seeded even though its field only mounts once the
  // `name` dependency is satisfied: nested-object rules in composeZodSchema
  // require the ancestor object to exist in `values`, or zod fails the
  // parent path (`meta`) with a generic "expected object" error that no
  // PFormField's `name` matches (see deps-form.vue for the same pattern
  // applied to conditionally-mounted fields).
  initialValues: { meta: { slug: '' }, name: '', window: '' },
});

defineExpose({ formApi });
</script>

<template>
  <Form />
</template>
