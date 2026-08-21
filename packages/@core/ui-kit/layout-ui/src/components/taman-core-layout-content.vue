<script setup lang="ts">
import type { TamanContentCompactType } from '@taman-core/typings';
import type { CSSProperties } from 'vue';

import { computed } from 'vue';

interface Props {
  /**
   * Content width mode
   */
  contentCompact: TamanContentCompactType;
  /**
   * Fixed content layout width
   */
  contentCompactWidth: number;
  padding: number;
  paddingBottom: number;
  paddingLeft: number;
  paddingRight: number;
  paddingTop: number;
}

const props = withDefaults(
  defineProps<Props>(),
  {},
);

const overlayViewportStyle: CSSProperties = {
  height:
    'calc(var(--taman-viewport-height) - var(--taman-header-height, 0px) - var(--taman-footer-height, 0px))',
};

const style = computed<CSSProperties>(() => {
  const {
    contentCompact,
    padding,
    paddingBottom,
    paddingLeft,
    paddingRight,
    paddingTop,
  } = props;

  const compactStyle: CSSProperties
    = contentCompact === 'compact'
      ? { margin: '0 auto', width: `${props.contentCompactWidth}px` }
      : {};
  return {
    ...compactStyle,
    flex: 1,
    padding: `${padding}px`,
    paddingBottom: `${paddingBottom}px`,
    paddingLeft: `${paddingLeft}px`,
    paddingRight: `${paddingRight}px`,
    paddingTop: `${paddingTop}px`,
  };
});
</script>

<template>
  <main
    :style="style"
    class="min-h-0 min-w-0 relative"
  >
    <div
      v-if="$slots.overlay"
      data-layout-region="content-overlay"
      class="h-0 w-full pointer-events-none top-0 sticky z-150"
    >
      <div
        :style="overlayViewportStyle"
        data-layout-region="overlay-viewport"
        class="min-h-0 w-full pointer-events-none relative"
      >
        <slot name="overlay" />
      </div>
    </div>
    <slot />
  </main>
</template>
