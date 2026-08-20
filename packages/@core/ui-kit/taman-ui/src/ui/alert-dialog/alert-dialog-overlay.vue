<script setup lang="ts">
import { useScrollLock } from '@taman-core/composables';

const {
  position = 'fixed',
  zIndex,
  overlayBlur,
  open,
} = defineProps<{
  open?: boolean;
  overlayBlur?: number;
  position?: 'absolute' | 'fixed';
  zIndex?: number;
}>();

// Use v-if to control mounting/unmounting; useScrollLock automatically unlocks scrolling when the component is unmounted.
useScrollLock();
</script>

<template>
  <div
    :data-state="open ? 'open' : 'closed'"
    :style="{
      ...(zIndex ? { zIndex } : {}),
      position,
      backdropFilter:
        overlayBlur && overlayBlur > 0 ? `blur(${overlayBlur}px)` : 'none',
    }"
    class="bg-background-elevated/75 inset-0 fixed z-popup isolate data-[state=closed]:(animate-out fade-out-0) data-[state=open]:(animate-in fade-in-0) pohon:animate-duration-280"
  />
</template>
