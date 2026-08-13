<script setup lang="ts">
import type { DialogCloseProps } from 'akar';

import { DialogClose } from 'akar';

const props = defineProps<DialogCloseProps>();
</script>

<template>
  <DialogClose
    data-slot="sheet-close"
    v-bind="props"
  >
    <slot />
  </DialogClose>
</template>
