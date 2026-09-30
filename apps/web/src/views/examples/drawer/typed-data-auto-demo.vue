<script setup lang="ts">
import { ref } from 'vue';
import { useTamanDrawer } from '@taman/app-ui';

interface AutoDrawerData {
  message: string;
  method: 'Automatic inference';
}

const data = ref<AutoDrawerData>();

const [Drawer, drawerApi] = useTamanDrawer<AutoDrawerData>({
  onOpenChange(isOpen) {
    data.value = isOpen ? drawerApi.getData() : undefined;
  },
});

defineExpose({ drawerApi });
</script>

<template>
  <Drawer title="Automatic inference data type">
    <div class="px-2 space-y-2">
      <p>Type source: {{ data?.method }}</p>
      <p>Received content: {{ data?.message }}</p>
    </div>
  </Drawer>
</template>
