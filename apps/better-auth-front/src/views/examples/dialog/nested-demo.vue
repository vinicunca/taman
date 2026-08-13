<script lang="ts" setup>
import { useTamanDialog } from '@taman/common-ui';

import DragDemo from './drag-demo.vue';

const [ParentDialog] = useTamanDialog({
  destroyOnClose: true,
});
const nestedDialogApi = useTamanDialog({
  connectedComponent: DragDemo,
});

function openNestedModal() {
  nestedDialogApi.open();
}
</script>

<template>
  <ParentDialog title="Nested dialog example">
    <PButton
      type="primary"
      @click="openNestedModal"
    >
      Open nested dialog
    </PButton>
  </ParentDialog>
</template>
