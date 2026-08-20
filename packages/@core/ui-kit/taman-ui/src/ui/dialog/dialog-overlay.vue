<script setup lang="ts">
import { useScrollLock } from '@taman-core/composables';
import { DISMISSABLE_DIALOG_ID } from '@taman-core/shared/constants';
import { inject } from 'vue';

const props = withDefaults(
  defineProps<{
    class?: any;
    overlayBlur?: number;
    position?: 'absolute' | 'fixed';
    zIndex?: number;
    open?: boolean;
  }>(),
  {
    position: 'fixed',
  },
);

useScrollLock();

const dismissableDialogId = inject(DISMISSABLE_DIALOG_ID, undefined);
</script>

<template>
  <div
    :data-dismissable-dialog="dismissableDialogId"
    :data-state="open ? 'open' : 'closed'"
    :style="{
      ...(zIndex ? { zIndex } : {}),
      position: props.position,
      backdropFilter:
        props.overlayBlur && props.overlayBlur > 0 ? `blur(${props.overlayBlur}px)` : 'none',
    }"
    class="bg-background-elevated/75 inset-0 fixed z-popup isolate data-[state=closed]:(animate-out fade-out-0) data-[state=open]:(animate-in fade-in-0) pohon:animate-duration-280"
  />
</template>
