<script lang="ts" setup>
import { useTamanDialog, useTamanToast } from '@taman/common-ui';
import { ref } from 'vue';

const { toaster } = useTamanToast();

const [DialogInContent, dialogInContentApi] = useTamanDialog({
  destroyOnClose: false,

  onCancel() {
    dialogInContentApi.close();
  },

  onConfirm() {
    toaster.info('onConfirm');
  },
});
const value = ref();
</script>

<template>
  <DialogInContent
    append-to-main
    class="w-150"
    title="In content dialog example"
    title-tooltip="Title prompt"
  >
    This dialog is specified to open in the content area, and the dialog content will not be destroyed after closing

    <PInput
      v-model="value"
      placeholder="KeepAlive test"
    />
  </DialogInContent>
</template>
