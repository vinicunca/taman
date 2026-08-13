<script lang="ts" setup>
import { Maximize, Minimize } from '@taman-core/icons';
import { useFullscreen } from '@vueuse/core';

import { VbenIconButton } from '../button';

defineOptions({ name: 'FullScreen' });

const { isFullscreen, toggle } = useFullscreen();

// Re-check fullscreen state on mount
isFullscreen.value = !!(
  document.fullscreenElement
  // @ts-expect-error - vendor fullscreen APIs are not included in the standard DOM typings
  || document.webkitFullscreenElement
  // @ts-expect-error - vendor fullscreen APIs are not included in the standard DOM typings
  || document.mozFullScreenElement
  // @ts-expect-error - vendor fullscreen APIs are not included in the standard DOM typings
  || document.msFullscreenElement
);
</script>

<template>
  <VbenIconButton
    class="hover:animate-[shrink_0.3s_ease-in-out]"
    @click="toggle"
  >
    <Minimize
      v-if="isFullscreen"
      class="color-text size-4"
    />
    <Maximize
      v-else
      class="color-text size-4"
    />
  </VbenIconButton>
</template>
