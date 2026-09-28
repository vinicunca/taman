<script setup lang="ts">
import type { AlertDialogActionProps } from 'akar';

import { AlertDialogAction } from 'akar';

const props = defineProps<AlertDialogActionProps>();
</script>

<template>
  <AlertDialogAction v-bind="props">
    <slot />
  </AlertDialogAction>
</template>
