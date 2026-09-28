<script setup lang="ts">
import { useTamanDialog } from '../../use-taman-dialog';

interface TypedDialogData {
  id: number;
  mode: 'edit' | 'view';
}

const [, dialogApi] = useTamanDialog<TypedDialogData | null>();

defineExpose({ dialogApi });
</script>

<template>
  <div />
</template>
