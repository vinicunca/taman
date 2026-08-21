<script setup lang="ts">
import type { CSSProperties } from 'vue';

import { computed } from 'vue';

interface Props {
  /**
   * Whether fixed to the bottom
   */
  fixed?: boolean;
  height: number;
  /**
   * Whether visible
   * @default true
   */
  show?: boolean;
  width: string;
  zIndex: number;
}

const props = withDefaults(
  defineProps<Props>(),
  {
    show: true,
  },
);

const style = computed<CSSProperties>(() => {
  const { fixed, height, show, width, zIndex } = props;

  return {
    height: `${height}px`,
    marginBottom: show ? '0' : `-${height}px`,
    position: fixed ? 'fixed' : 'static',
    transform: show ? 'translateY(0)' : 'translateY(100%)',
    width,
    zIndex,
  };
});
</script>

<template>
  <footer
    :style="style"
    class="bg-background-elevated shrink-0 w-full transition-all-280 bottom-0"
  >
    <slot />
  </footer>
</template>
