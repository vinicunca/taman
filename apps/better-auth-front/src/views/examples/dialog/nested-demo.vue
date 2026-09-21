<script lang="ts" setup>
import { useTamanDialog } from '@taman/app-ui';

import DragDemo from './drag-demo.vue';

const [ParentDialog] = useTamanDialog({
  destroyOnClose: true,
});
const [NestedDialog, nestedDialogApi] = useTamanDialog({
  connectedComponent: DragDemo,
});

function openNestedModal() {
  nestedDialogApi.open();
}
</script>

<template>
  <ParentDialog title="Nested dialog example">
    <PButton
      @click="openNestedModal"
    >
      Open nested dialog
    </PButton>

    <NestedDialog />
  </ParentDialog>
</template>
