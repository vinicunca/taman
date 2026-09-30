<script setup lang="ts">
import { useTamanDrawer } from '@taman/app-ui';
import { ref } from 'vue';

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
