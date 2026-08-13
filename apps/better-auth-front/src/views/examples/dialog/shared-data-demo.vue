<script lang="ts" setup>
import { useTamanDialog, useTamanToast } from '@taman/common-ui';
import { ref } from 'vue';

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
      data.value = dialogSharedDataApi.getData<Record<string, any>>();
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
