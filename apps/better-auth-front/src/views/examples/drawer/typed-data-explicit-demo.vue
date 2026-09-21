<script setup lang="ts">
import type { ExplicitDrawerData } from './typed-data-contract';

import { useTamanDrawer } from '@taman/app-ui';
import { ref } from 'vue';

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
