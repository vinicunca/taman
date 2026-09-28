<script setup lang="ts">
import type { AlertDialogEmits, AlertDialogProps } from 'akar';

import { AlertDialogRoot, useForwardPropsEmits } from 'akar';

const props = defineProps<AlertDialogProps>();
const emits = defineEmits<AlertDialogEmits>();

const forwarded = useForwardPropsEmits(props, emits);
</script>

<template>
  <AlertDialogRoot
    v-slot="slotProps"
    data-slot="alert-dialog"
    v-bind="forwarded"
  >
    <slot v-bind="slotProps" />
  </AlertDialogRoot>
</template>
