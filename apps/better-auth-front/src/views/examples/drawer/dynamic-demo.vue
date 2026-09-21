<script lang="ts" setup>
import { useTamanDrawer, useTamanToast } from '@taman/app-ui';

const { toaster } = useTamanToast();
const [Drawer, drawerApi] = useTamanDrawer({
  onCancel() {
    drawerApi.close();
  },
  onConfirm() {
    toaster.info('onConfirm');
  },
  title: 'Dynamic configuration example',
});

function handleUpdateTitle() {
  drawerApi.setState({ title: 'Internal dynamic title' });
}
</script>

<template>
  <Drawer>
    <div class="flex-col-center">
      <PButton
        class="mb-3"
        @click="handleUpdateTitle()"
      >
        Internal dynamic modify title
      </PButton>
    </div>
  </Drawer>
</template>
