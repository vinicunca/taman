<script setup lang="ts">
import type { Recordable } from '@taman/types';

import type { VbenFormSchema } from '@taman-core/form-ui';

import { computed, reactive } from 'vue';

import { $t } from '@taman/locales';

import { useTamanForm } from '@taman-core/form-ui';
import { VbenButton } from '@vben-core/shadcn-ui';

interface Props {
  formSchema?: VbenFormSchema[];
}

const props = withDefaults(defineProps<Props>(), {
  formSchema: () => [],
});

const emit = defineEmits<{
  submit: [Recordable<any>];
}>();

const [Form, formApi] = useTamanForm(
  reactive({
    commonConfig: {
      // All form fields
      componentProps: {
        class: 'w-full',
      },
    },
    layout: 'horizontal',
    schema: computed(() => props.formSchema),
    showDefaultActions: false,
  }),
);

async function handleSubmit() {
  const { valid } = await formApi.validate();
  const values = await formApi.getValues();
  if (valid) {
    emit('submit', values);
  }
}

defineExpose({
  getFormApi: () => formApi,
});
</script>
<template>
  <div @keydown.enter.prevent="handleSubmit">
    <Form />
    <VbenButton type="submit" class="mt-4" @click="handleSubmit">
      {{ $t('profile.updateBasicProfile') }}
    </VbenButton>
  </div>
</template>
