<script lang="ts" setup>
import { useTamanDialog, useTamanToast } from '@taman/common-ui';

const { toaster } = useTamanToast();

const [DialogBasic, dialogBasicApi] = useTamanDialog({
  onCancel() {
    dialogBasicApi.close();
  },
  onClosed() {
    toaster.info('Dialog closed');
  },
  onConfirm() {
    toaster.info('Dialog confirmed');
  },
  onOpened() {
    toaster.info('Dialog opened');
  },
});

function lockDialog() {
  dialogBasicApi.lock();
  setTimeout(() => {
    dialogBasicApi.unlock();
  }, 3000);
}
</script>

<template>
  <DialogBasic
    class="pohon:w-150"
    title="Basic dialog example Basic dialog example Basic dialog example Basic dialog example Basic dialog example"
    title-tooltip="Title Prompt"
  >
    <div class="flex flex-col items-start">
      <p>click to lock</p>

      <PButton @click="lockDialog">
        Lock
      </PButton>
    </div>
  </DialogBasic>
</template>
