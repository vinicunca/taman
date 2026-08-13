<script setup lang="ts">
import type { AlertDialogTriggerProps } from 'akar';

import { AlertDialogTrigger } from 'akar';

const props = defineProps<AlertDialogTriggerProps>();
</script>

<template>
  <AlertDialogTrigger
    data-slot="alert-dialog-trigger"
    v-bind="props"
  >
    <slot />
  </AlertDialogTrigger>
</template>
