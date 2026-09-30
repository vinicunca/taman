<script setup lang="ts">
import type { ExplicitDialogData } from './typed-data-contract';

import { ref } from 'vue';
import { useTamanDialog } from '@taman/app-ui';

const data = ref<ExplicitDialogData>();

const [Dialog, dialogApi] = useTamanDialog<ExplicitDialogData>({
  onOpenChange(isOpen) {
    data.value = isOpen ? dialogApi.getData() : undefined;
  },
});
</script>

<template>
  <Dialog title="Explicit generics">
    <div class="px-2 space-y-2">
      <p>Type source: {{ data?.method }}</p>
      <p>Received content: {{ data?.message }}</p>
    </div>
  </Dialog>
</template>
