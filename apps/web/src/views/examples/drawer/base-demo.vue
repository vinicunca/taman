<script lang="ts" setup>
import { useTamanDrawer, useTamanToast } from '@taman/app-ui';

const { toaster } = useTamanToast();
const [Drawer, drawerApi] = useTamanDrawer({
  onCancel() {
    drawerApi.close();
  },
  onClosed() {
    drawerApi.setState({ overlayBlur: 0, placement: 'right' });
  },
  onConfirm() {
    toaster.info('onConfirm');
  },
});

function lockDrawer() {
  drawerApi.lock();
  setTimeout(() => {
    drawerApi.unlock();
  }, 3000);
}
</script>

<template>
  <Drawer
    title="Basic drawer example"
    title-tooltip="Title tooltip content"
  >
    <template #extra>
      extra
    </template>
    Base demo
    <PButton
      @click="lockDrawer"
    >
      Lock drawer state
    </PButton>
    <!-- <template #prepend-footer> slot </template> -->
    <!-- <template #append-footer> prepend slot </template> -->
    <!-- <template #center-footer> center slot </template> -->
  </Drawer>
</template>
