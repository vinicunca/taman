<script setup lang="ts">
import type { TamanContentCompactType } from '@taman-core/typings';
import type { CSSProperties } from 'vue';

import { useLayoutContentStyle } from '@taman-core/composables';
import { Slot } from '@taman-core/taman-ui';
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

const props = withDefaults(defineProps<Props>(), {});

// @ts-expect-error - unused
const { contentElement, overlayStyle } = useLayoutContentStyle();

const style = computed((): CSSProperties => {
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
    ref="contentElement"
    :style="style"
    class="bg-background-elevated relative"
  >
    <Slot :style="overlayStyle">
      <slot name="overlay" />
    </Slot>

    <slot />
  </main>
</template>
