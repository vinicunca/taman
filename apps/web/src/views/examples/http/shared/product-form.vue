<script setup lang="ts">
import { useTamanForm, z } from '#/adapter/form';
import { watch } from 'vue';

const props = withDefaults(defineProps<{
  initial?: { title: string; price: number };
  submitting?: boolean;
  submitLabel?: string;
}>(), {
  initial: undefined,
  submitting: false,
  submitLabel: 'Save',
});

const emit = defineEmits<{
  submit: [values: { title: string; price: number }];
  cancel: [];
}>();

const [Form, formApi] = useTamanForm({
  showDefaultActions: false,
  submitOnEnter: true,
  handleSubmit: (values) => {
    emit('submit', { title: String(values.title), price: Number(values.price) });
  },
  schema: [
    {
      component: 'Input',
      fieldName: 'title',
      label: 'Title',
      componentProps: { placeholder: 'Product name' },
      rules: z.string().min(1, 'Title is required'),
    },
    {
      component: 'InputNumber',
      fieldName: 'price',
      label: 'Price',
      componentProps: { min: 0, step: 0.01 },
      defaultValue: 0,
      rules: z.number().min(0, 'Price must be at least 0'),
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
        Cancel
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
