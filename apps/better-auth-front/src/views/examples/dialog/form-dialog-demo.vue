<script lang="ts" setup>
import { useTamanDialog, useTamanToast } from '@taman/app-ui';
import { useTamanForm } from '#/adapter/form';

defineOptions({
  name: 'FormModelDemo',
});

interface FormModalData {
  values?: Record<string, unknown>;
}

const { toast } = useTamanToast();

const [FormDemo, formDemoApi] = useTamanForm({
  handleSubmit: onSubmit,
  schema: [
    {
      component: 'Input',
      componentProps: {
        placeholder: 'type here',
      },
      fieldName: 'field1',
      label: 'Field 1',
      rules: 'required',
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: 'type here',
      },
      fieldName: 'field2',
      label: 'Field 2',
      rules: 'required',
    },
    {
      component: 'Select',
      componentProps: {
        items: [
          { label: 'Option 1', value: '1' },
          { label: 'Option 2', value: '2' },
        ],
        placeholder: 'type here',
      },
      fieldName: 'field3',
      label: 'Field 3',
      rules: 'required',
    },
  ],
  showDefaultActions: false,
});

const [Modal, modalApi] = useTamanDialog<FormModalData>({
  fullscreenButton: false,
  onCancel() {
    modalApi.close();
  },
  onConfirm: async () => {
    await formDemoApi.validateAndSubmit();
  },
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      const data = modalApi.getData();
      if (data?.values) {
        formDemoApi.setValues(data.values);
      }
    }
  },
  title: 'Embedded form example',
});

function onSubmit(values: Record<string, any>) {
  const toastLoading = toast.add({
    title: 'Loading...',
    icon: 'lucide:loader-circle',
    color: 'primary',
    ui: {
      icon: 'animate-spin',
    },
    duration: 0,
  });

  modalApi.lock();

  setTimeout(() => {
    modalApi.close();
    toast.add({
      title: `Value: ${JSON.stringify(values)}`,
      icon: 'lucide:check',
      color: 'success',
      duration: 2000,
      id: toastLoading.id,
      ui: {
        icon: 'animate-none',
      },
    });
  }, 3000);
}
</script>

<template>
  <Modal>
    <FormDemo />
  </Modal>
</template>
