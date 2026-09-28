<script setup lang="ts">
import type { DialogTriggerProps } from 'akar';

import { DialogTrigger } from 'akar';

const props = defineProps<DialogTriggerProps>();
</script>

<template>
  <DialogTrigger
    data-slot="dialog-trigger"
    v-bind="props"
  >
    <slot />
  </DialogTrigger>
</template>
