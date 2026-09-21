<script lang="ts" setup>
import { useTamanDrawer, useTamanToast } from '@taman/app-ui';
import { ref } from 'vue';

import { useTamanForm } from '#/adapter/form';

const { toaster } = useTamanToast();
const value = ref('');

const [Form] = useTamanForm({
  schema: [
    {
      component: 'Input',
      componentProps: {
        placeholder: 'KeepAlive test: internal component',
      },
      fieldName: 'field1',
      hideLabel: true,
      label: 'Field 1',
    },
  ],
  showDefaultActions: false,
});

const [Drawer, drawerApi] = useTamanDrawer({
  destroyOnClose: false,
  onCancel() {
    drawerApi.close();
  },
  onConfirm() {
    toaster.info('onConfirm');
    // drawerApi.close();
  },
});
</script>

<template>
  <Drawer
    append-to-main
    title="Basic drawer example"
    title-tooltip="Title tooltip content"
  >
    <template #extra>
      extra
    </template>

    This drawer is specified to open in the content area, and the content of the drawer will not be destroyed after closing

    <PInput
      v-model="value"
      placeholder="KeepAlive test: connectedComponent"
    />

    <Form />
  </Drawer>
</template>
