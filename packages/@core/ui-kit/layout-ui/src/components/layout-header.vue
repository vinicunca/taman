<script setup lang="ts">
import type { CSSProperties } from 'vue';

import { computed, useSlots } from 'vue';

interface Props {
  /**
   * Landscape orientation
   */
  fullWidth: boolean;
  /**
   * Height
   */
  height: number;
  /**
   * Whether mobile layout
   */
  isMobile: boolean;
  /**
   * Whether visible
   */
  show: boolean;
  /**
   * Sidebar menu width
   */
  sidebarWidth: number;
  /**
   * Theme
   */
  theme: string | undefined;
  /**
   * Width
   */
  width: string;
  /**
   * zIndex
   */
  zIndex: number;
}

const props = withDefaults(defineProps<Props>(), {});

const slots = useSlots();

const style = computed((): CSSProperties => {
  const { fullWidth, height, show } = props;
  const right = !show || !fullWidth ? undefined : 0;

  return {
    height: `${height}px`,
    marginTop: show ? 0 : `-${height}px`,
    right,
  };
});

const logoStyle = computed((): CSSProperties => {
  return {
    minWidth: `${props.isMobile ? 40 : props.sidebarWidth}px`,
  };
});
</script>

<template>
  <header
    :class="theme"
    :style="style"
    class="pl-2 border-b border-border bg-header flex flex-[0_0_auto] w-full transition-[margin]-200 items-center top-0"
  >
    <div
      v-if="slots.logo"
      :style="logoStyle"
    >
      <slot name="logo" />
    </div>

    <slot name="toggle-button" />

    <slot />
  </header>
</template>
