<script setup lang="ts">
import type { AlertDialogDescriptionProps } from 'akar';
import type { HTMLAttributes } from 'vue';

import { reactiveOmit } from '@vueuse/core';
import { AlertDialogDescription, useForwardProps } from 'akar';

const props = defineProps<
  AlertDialogDescriptionProps & { class?: HTMLAttributes['class'] }
>();

const delegatedProps = reactiveOmit(props, 'class');
const forwardedProps = useForwardProps(delegatedProps);
</script>

<template>
  <AlertDialogDescription
    data-slot="alert-dialog-description"
    v-bind="forwardedProps"
    class="text-sm color-text-muted"
  >
    <slot />
  </AlertDialogDescription>
</template>
