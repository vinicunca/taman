<script lang="ts" setup>
import { TooltipProvider } from 'akar';
import { z } from 'zod';

import { useTamanForm } from '../../use-taman-form';

const [Form, formApi] = useTamanForm({
  errorDisplay: 'tooltip',
  fields: [
    { component: 'Heading', label: 'Section' }, // display-only, no name
    { component: 'Input', name: 'a', rules: z.string().min(1, 'a required'), span: 2 },
    { component: 'Input', name: 'b', newRow: true },
    { component: 'Input', name: 'c', span: 'full' },
  ],
  initialValues: { a: '', b: '', c: '' },
  layout: { cols: { base: 2, md: 3 } },
  showDefaultActions: false,
});

defineExpose({ formApi });
</script>

<template>
  <TooltipProvider>
    <Form />
  </TooltipProvider>
</template>
