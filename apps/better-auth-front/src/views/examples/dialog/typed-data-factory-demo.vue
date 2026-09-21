<script setup lang="ts">
import type { FactoryDialogData } from './typed-data-contract';

import { ref } from 'vue';

import { useFactoryDialog } from './typed-data-contract';

const data = ref<FactoryDialogData>();

const [Dialog, dialogApi] = useFactoryDialog({
  onOpenChange(isOpen) {
    data.value = isOpen ? dialogApi.getData() : undefined;
  },
});
</script>

<template>
  <Dialog title="Factory contract">
    <div class="px-2 space-y-2">
      <p>Type source: {{ data?.method }}</p>
      <p>Received content: {{ data?.message }}</p>
    </div>
  </Dialog>
</template>
