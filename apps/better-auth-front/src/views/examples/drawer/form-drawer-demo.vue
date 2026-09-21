<script lang="ts" setup>
import { useTamanDrawer } from '@taman/app-ui';

import { useTamanForm } from '#/adapter/form';

defineOptions({
  name: 'FormDrawerDemo',
});

interface FormDrawerData {
  values?: Record<string, unknown>;
}

const [Form, formApi] = useTamanForm({
  schema: [
    {
      component: 'Input',
      componentProps: {
        placeholder: 'Please enter',
      },
      fieldName: 'field1',
      label: 'Field 1',
      rules: 'required',
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: 'Please enter',
      },
      fieldName: 'field2',
      label: 'Field 2',
      rules: 'required',
    },
  ],
  showDefaultActions: false,
});
const [Drawer, drawerApi] = useTamanDrawer<FormDrawerData>({
  onCancel() {
    drawerApi.close();
  },
  onConfirm: async () => {
    await formApi.submit();
    drawerApi.close();
  },
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      const data = drawerApi.getData();
      if (data?.values) {
        formApi.setValues(data.values);
      } else {
        formApi.reset();
      }
    }
  },
  title: 'Embedded form example',
});

defineExpose({ drawerApi });
</script>

<template>
  <Drawer>
    <Form />
  </Drawer>
</template>
