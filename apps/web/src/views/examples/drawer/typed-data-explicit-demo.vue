<script setup lang="ts">
import type { ExplicitDrawerData } from './typed-data-contract';

import { ref } from 'vue';
import { useTamanDrawer } from '@taman/app-ui';

const data = ref<ExplicitDrawerData>();

const [Drawer, drawerApi] = useTamanDrawer<ExplicitDrawerData>({
  onOpenChange(isOpen) {
    data.value = isOpen ? drawerApi.getData() : undefined;
  },
});
</script>

<template>
  <Drawer title="Explicit generic data type">
    <div class="px-2 space-y-2">
      <p>Type source: {{ data?.method }}</p>
      <p>Received content: {{ data?.message }}</p>
    </div>
  </Drawer>
</template>
