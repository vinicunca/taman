<script setup lang="ts">
import { todoCreateInput } from '@taman/api-contract';
import { watch } from 'vue';
import { useTamanForm, z } from '#/adapter/form';
import { $t } from '#/locales';

const props = withDefaults(defineProps<{
  initial?: { title: string; completed: boolean };
  submitting?: boolean;
  submitLabel?: string;
}>(), {
  initial: undefined,
  submitting: false,
  submitLabel: () => $t('todo.action.save'),
});

const emit = defineEmits<{
  submit: [values: { title: string; completed: boolean }];
  cancel: [];
}>();

const [Form, formApi] = useTamanForm({
  showDefaultActions: false,
  submitOnEnter: true,
  handleSubmit: (values) => {
    emit('submit', { title: String(values.title), completed: Boolean(values.completed) });
  },
  schema: [
    {
      component: 'Input',
      fieldName: 'title',
      label: $t('todo.field.title'),
      componentProps: { placeholder: $t('todo.field.titlePlaceholder') },
      // Same zod rule the server enforces, straight from the published contract.
      rules: todoCreateInput.shape.title,
    },
    {
      component: 'Switch',
      fieldName: 'completed',
      label: $t('todo.field.completed'),
      defaultValue: false,
      rules: z.boolean().optional(),
    },
  ],
});

watch(
  () => props.initial,
  async (initial) => {
    await formApi.reset();
    if (initial) {
      await formApi.setValues(initial);
    }
  },
  { immediate: true },
);

defineExpose({ reset: () => formApi.reset() });
</script>

<template>
  <div class="flex flex-col gap-3">
    <Form />
    <div class="flex gap-2 justify-end">
      <PButton
        v-if="initial"
        color="neutral"
        variant="ghost"
        @click="emit('cancel')"
      >
        {{ $t('todo.action.cancel') }}
      </PButton>
      <PButton
        :loading="submitting"
        @click="formApi.submit()"
      >
        {{ submitLabel }}
      </PButton>
    </div>
  </div>
</template>
