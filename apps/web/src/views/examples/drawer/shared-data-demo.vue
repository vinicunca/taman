<script lang="ts" setup>
import { ref } from 'vue';
import { useTamanDrawer, useTamanToast } from '@taman/app-ui';

interface SharedData {
  content: string;
  payload: string;
}

const { toaster } = useTamanToast();
const data = ref<SharedData>();

const [Drawer, drawerApi] = useTamanDrawer<SharedData>({
  onCancel() {
    drawerApi.close();
  },
  onConfirm() {
    toaster.info('onConfirm');
  },
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      data.value = drawerApi.getData();
    }
  },
});

defineExpose({ drawerApi });
</script>

<template>
  <Drawer title="Shared data example">
    <div class="flex-col-center">
      External passed data: {{ data }}
    </div>
  </Drawer>
</template>
