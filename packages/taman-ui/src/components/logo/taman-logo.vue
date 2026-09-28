<script setup lang="ts">
import PAvatar from 'pohon-ui/components/Avatar.vue';
import { computed } from 'vue';

defineOptions({
  name: 'TamanLogo',
});

const props = withDefaults(
  defineProps<{
    collapsed?: boolean;
    fullLogoHeight?: number | string;
    logoMode?: 'full' | 'icon';
    href?: string;
    showText?: boolean;
    src?: string;
    srcDark?: string;
    text: string;
    theme?: string;
  }>(),
  {
    collapsed: false,
    href: 'javascript:void 0',
    src: '',
    srcDark: '',
    theme: 'light',
  },
);

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

const shouldUseFullLogo = computed(() => {
  return props.logoMode === 'full' && !props.collapsed;
});

const shouldShowText = computed(() => {
  return (
    props.showText
    && !props.collapsed
    && !shouldUseFullLogo.value
    && !!props.text
  );
});

const fullLogoStyle = computed(() => ({
  height:
    typeof props.fullLogoHeight === 'number'
      ? `${props.fullLogoHeight}px`
      : props.fullLogoHeight,
}));
</script>

<template>
  <a
    :href="href"
    class="text-lg leading-normal flex h-full items-center overflow-hidden"
    :class="[
      shouldShowText
        ? 'gap-2 px-3 justify-start'
        : 'w-full p-0 justify-center',
    ]"
  >
    <img
      v-if="logoSrc && shouldUseFullLogo"
      :alt="text"
      :src="logoSrc"
      :style="fullLogoStyle"
      class="w-full"
    >

    <PAvatar
      v-else-if="logoSrc"
      :alt="text"
      :src="logoSrc"
      class="pohon:rounded-none"
    />

    <template v-if="!collapsed">
      <slot name="text">
        <span class="color-text font-600 text-nowrap truncate">
          {{ text }}
        </span>
      </slot>
    </template>
  </a>
</template>
