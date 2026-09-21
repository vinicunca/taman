<script setup lang="ts">
import type { FactoryDrawerData } from './typed-data-contract';

import { ref } from 'vue';

import { useFactoryDrawer } from './typed-data-contract';

const data = ref<FactoryDrawerData>();

const [Drawer, drawerApi] = useFactoryDrawer({
  onOpenChange(isOpen) {
    data.value = isOpen ? drawerApi.getData() : undefined;
  },
});
</script>

<template>
  <Drawer title="Contract factory data type">
    <div class="px-2 space-y-2">
      <p>Type source: {{ data?.method }}</p>
      <p>Received content: {{ data?.message }}</p>
    </div>
  </Drawer>
</template>
