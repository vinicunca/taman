<script setup lang="ts">
import { useScrollLock } from '@taman-core/composables';
import { DISMISSABLE_DRAWER_ID } from '@taman-core/shared/constants';
import { inject } from 'vue';

const props = withDefaults(
  defineProps<{
    class?: any;
    overlayBlur?: number;
    position?: 'absolute' | 'fixed';
    zIndex?: number;
  }>(),
  {
    position: 'fixed',
  },
);

useScrollLock();

const dismissableDrawerId = inject(DISMISSABLE_DRAWER_ID, undefined);
</script>

<template>
  <div
    :data-dismissable-drawer="dismissableDrawerId"
    :style="{
      ...(zIndex ? { zIndex } : {}),
      position: props.position,
      backdropFilter:
        props.overlayBlur && props.overlayBlur > 0 ? `blur(${props.overlayBlur}px)` : 'none',
    }"
    class="bg-background-elevated/75 inset-0 fixed z-popup isolate"
  />
</template>
