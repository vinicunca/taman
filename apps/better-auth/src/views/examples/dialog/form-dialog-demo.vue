<script lang="ts" setup>
import { useTamanDialog, useTamanForm, useTamanToast, z } from '@taman/common-ui';

defineOptions({
  name: 'FormModelDemo',
});

const { toast } = useTamanToast();

const [FormDemo, formDemoApi] = useTamanForm({
  fields: [
    {
      component: 'Input',
      props: {
        placeholder: 'type here',
      },
      name: 'field1',
      label: 'Field 1',
      rules: z.string().min(1, { message: 'Field 1 is required' }),
    },
  ],

  handleSubmit: onSubmit,
  // schema: [
  //   {
  //     component: 'Input',
  //     componentProps: {
  //       placeholder: '请输入',
  //     },
  //     fieldName: 'field1',
  //     label: '字段1',
  //     rules: 'required',
  //   },
  //   {
  //     component: 'Input',
  //     componentProps: {
  //       placeholder: '请输入',
  //     },
  //     fieldName: 'field2',
  //     label: '字段2',
  //     rules: 'required',
  //   },
  //   {
  //     component: 'Select',
  //     componentProps: {
  //       options: [
  //         { label: '选项1', value: '1' },
  //         { label: '选项2', value: '2' },
  //       ],
  //       placeholder: '请输入',
  //     },
  //     fieldName: 'field3',
  //     label: '字段3',
  //     rules: 'required',
  //   },
  // ],
  showDefaultActions: false,
});

const [Modal, modalApi] = useTamanDialog({
  fullscreenButton: false,
  onCancel() {
    modalApi.close();
  },
  onConfirm: async () => {
    await formDemoApi.submit();
  },
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      const { values } = modalApi.getData<Record<string, any>>();
      if (values) {
        formDemoApi.setValues(values);
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
