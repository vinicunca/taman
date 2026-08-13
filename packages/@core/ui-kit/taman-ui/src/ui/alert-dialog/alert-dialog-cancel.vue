<script setup lang="ts">
import type { AlertDialogCancelProps } from 'akar';

import { AlertDialogCancel } from 'akar';

const props = defineProps<AlertDialogCancelProps>();
</script>

<template>
  <AlertDialogCancel v-bind="props">
    <slot />
  </AlertDialogCancel>
</template>
