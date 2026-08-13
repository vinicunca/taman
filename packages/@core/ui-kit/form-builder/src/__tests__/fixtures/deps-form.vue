<script lang="ts" setup>
import { z } from 'zod';

import { useTamanForm } from '../../use-taman-form';

const trigger = { calls: 0 };

const [Form, formApi] = useTamanForm({
  fields: [
    { component: 'Input', name: 'kind' },
    {
      component: 'Input',
      dependencies: {
        if: (values) => values.kind !== 'none',
        triggerFields: ['kind'],
      },
      name: 'conditional',
      rules: z.string().min(1, 'conditional required'),
    },
    {
      component: 'Input',
      dependencies: {
        show: (values) => values.kind !== 'hide-me',
        triggerFields: ['kind'],
      },
      name: 'peekaboo',
    },
    {
      component: 'Input',
      dependencies: {
        disabled: (values) => values.kind === 'lock',
        props: (values) => ({ placeholder: `kind:${values.kind}` }),
        rules: (values) =>
          values.kind === 'strict' ? z.string().min(5, 'min5') : undefined,
        trigger: () => {
          trigger.calls += 1;
        },
        triggerFields: ['kind'],
      },
      name: 'reactiveField',
      rules: z.string().optional(),
    },
    {
      component: 'Input',
      dependencies: {
        // Async props whose latency depends on the value: 'slow' resolves
        // well after a subsequent fast run — exercises last-wins guarding.
        props: async (values) => {
          const kind = values.kind;
          await new Promise((resolve) =>
            setTimeout(resolve, kind === 'slow' ? 30 : 0),
          );
          return { placeholder: `race:${kind}` };
        },
        triggerFields: ['kind'],
      },
      name: 'racer',
    },
  ],
  initialValues: {
    kind: 'a',
    conditional: '',
    peekaboo: '',
    racer: '',
    reactiveField: '',
  },
  showDefaultActions: false,
});

defineExpose({ formApi, trigger });
</script>

<template>
  <Form />
</template>
