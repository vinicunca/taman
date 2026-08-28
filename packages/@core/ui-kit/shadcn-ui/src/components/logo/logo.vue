<script setup lang="ts">
import { computed } from 'vue';

import { VbenAvatar } from '../avatar';

interface Props {
  /**
   * Whether text is collapsed
   */
  collapsed?: boolean;
  /**
   * Logo image object-fit
   */
  fit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  /**
   * Logo link URL
   */
  href?: string;
  /**
   * Logo image size
   */
  logoSize?: number;
  /**
   * Logo image source
   */
  src?: string;
  /**
   * Dark theme logo (optional; falls back to src)
   */
  srcDark?: string;
  /**
   * Logo text
   */
  text: string;
  /**
   * Logo theme
   */
  theme?: string;
}

defineOptions({
  name: 'VbenLogo',
});

const props = withDefaults(defineProps<Props>(), {
  collapsed: false,
  href: 'javascript:void 0',
  logoSize: 32,
  src: '',
  srcDark: '',
  theme: 'light',
  fit: 'cover',
});

/**
 * Pick logo image based on theme
 */
const logoSrc = computed(() => {
  // Dark theme with srcDark: use dark logo
  if (props.theme === 'dark' && props.srcDark) {
    return props.srcDark;
  }
  // Otherwise use default src
  return props.src;
});
</script>

<template>
  <div
    :class="theme"
    class="text-lg flex h-full items-center"
  >
    <a
      :class="$attrs.class"
      :href="href"
      class="text-lg leading-normal px-3 flex gap-2 h-full transition-all duration-500 items-center overflow-hidden"
    >
      <VbenAvatar
        v-if="logoSrc"
        :alt="text"
        :src="logoSrc"
        :size="logoSize"
        :fit="fit"
        class="rounded-none bg-transparent relative"
      />
      <template v-if="!collapsed">
        <slot name="text">
          <span class="color-text font-600 text-nowrap truncate">
            {{ text }}
          </span>
        </slot>
      </template>
    </a>
  </div>
</template>
