<script lang="ts" setup>
import { useTamanDialog, useTamanToast } from '@taman/common-ui';

const { toaster } = useTamanToast();

const [DialogDrag, dialogDragApi] = useTamanDialog({
  draggable: true,
  onCancel() {
    dialogDragApi.close();
  },
  onConfirm() {
    toaster.info('onConfirm');
  },
});
</script>

<template>
  <DialogDrag title="Draggable example">
    Drag the dialog by moving the mouse to the header
  </DialogDrag>
</template>
