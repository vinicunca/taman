<script setup lang="ts">
import { useScrollLock } from '@taman-core/composables';

const {
  position = 'fixed',
  zIndex,
  overlayBlur,
} = defineProps<{
  overlayBlur?: number;
  position?: 'absolute' | 'fixed';
  zIndex?: number;
}>();

// Use v-if to control mounting/unmounting; useScrollLock automatically unlocks scrolling when the component is unmounted.
useScrollLock();
</script>

<template>
  <div
    :style="{
      ...(zIndex ? { zIndex } : {}),
      position,
      backdropFilter:
        overlayBlur && overlayBlur > 0 ? `blur(${overlayBlur}px)` : 'none',
    }"
    class="bg-background-elevated/75 inset-0 fixed z-popup isolate"
  />
</template>
