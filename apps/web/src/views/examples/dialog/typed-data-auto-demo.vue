<script setup lang="ts">
import { useTamanDialog } from '@taman/app-ui';
import { ref } from 'vue';

interface AutoDialogData {
  message: string;
  method: 'Automatic inference';
}

const data = ref<AutoDialogData>();

const [Dialog, dialogApi] = useTamanDialog<AutoDialogData>({
  onOpenChange(isOpen) {
    data.value = isOpen ? dialogApi.getData() : undefined;
  },
});

defineExpose({ dialogApi });
</script>

<template>
  <Dialog title="Automatic inference">
    <div class="px-2 space-y-2">
      <p>Type source: {{ data?.method }}</p>
      <p>Received content: {{ data?.message }}</p>
    </div>
  </Dialog>
</template>
