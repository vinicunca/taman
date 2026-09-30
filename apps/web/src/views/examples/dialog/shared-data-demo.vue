<script lang="ts" setup>
import { ref } from 'vue';
import { useTamanDialog, useTamanToast } from '@taman/app-ui';

const { toaster } = useTamanToast();

const data = ref();

const [DialogSharedData, dialogSharedDataApi] = useTamanDialog({
  onCancel() {
    dialogSharedDataApi.close();
  },
  onConfirm() {
    toaster.info('onConfirm');
  },
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      data.value = dialogSharedDataApi.getData();
    }
  },
});
</script>

<template>
  <DialogSharedData title="Data sharing example">
    <div class="flex-col-center">
      External passed data: {{ data }}
    </div>
  </DialogSharedData>
</template>
