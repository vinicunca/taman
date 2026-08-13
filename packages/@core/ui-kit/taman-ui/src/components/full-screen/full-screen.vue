<script lang="ts" setup>
import { useFullscreen } from '@vueuse/core';

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
  <PButton
    class="pohon:rounded-full"
    size="sm"
    variant="ghost"
    color="neutral"
    :icon="isFullscreen ? 'lucide:minimize' : 'lucide:maximize'"
    @click="toggle"
  />
</template>
