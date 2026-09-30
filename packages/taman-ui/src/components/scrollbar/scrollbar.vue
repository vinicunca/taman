<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { computed, ref } from 'vue';

import { AScrollArea, AScrollBar } from '../../ui';

interface Props {
  class?: HTMLAttributes['class'];
  horizontal?: boolean;
  scrollBarClass?: HTMLAttributes['class'];
  shadow?: boolean;
  shadowBorder?: boolean;
  shadowBottom?: boolean;
  shadowLeft?: boolean;
  shadowRight?: boolean;
  shadowTop?: boolean;
}

const props = withDefaults(
  defineProps<Props>(),
  {
    class: '',
    horizontal: false,
    shadow: false,
    shadowBorder: false,
    shadowBottom: true,
    shadowLeft: false,
    shadowRight: false,
    shadowTop: true,
  },
);

const emits = defineEmits<{
  scrollAt: [
    {
      bottom: boolean;
      left: boolean;
      right: boolean;
      top: boolean;
    },
  ];
}>();

const isAtTop = ref(true);
const isAtRight = ref(false);
const isAtBottom = ref(false);
const isAtLeft = ref(true);

/**
 * We have to check if the scroll amount is close enough to some threshold in order to
 * more accurately calculate arrivedState. This is because scrollTop/scrollLeft are non-rounded
 * numbers, while scrollHeight/scrollWidth and clientHeight/clientWidth are rounded.
 * https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollHeight#determine_if_an_element_has_been_totally_scrolled
 */
const ARRIVED_STATE_THRESHOLD_PIXELS = 1;

const showShadowTop = computed(() => props.shadow && props.shadowTop);
const showShadowBottom = computed(() => props.shadow && props.shadowBottom);
const showShadowLeft = computed(() => props.shadow && props.shadowLeft);
const showShadowRight = computed(() => props.shadow && props.shadowRight);

const hasBothShadow = computed(() => {
  return !isAtLeft.value
    && !isAtRight.value
    && showShadowLeft.value
    && showShadowRight.value;
});

function handleScroll(event: Event) {
  const target = event.target as HTMLElement;
  const scrollTop = target?.scrollTop ?? 0;
  const scrollLeft = target?.scrollLeft ?? 0;
  const clientHeight = target?.clientHeight ?? 0;
  const clientWidth = target?.clientWidth ?? 0;
  const scrollHeight = target?.scrollHeight ?? 0;
  const scrollWidth = target?.scrollWidth ?? 0;
  isAtTop.value = scrollTop <= 0;
  isAtLeft.value = scrollLeft <= 0;
  isAtBottom.value
    = Math.abs(scrollTop) + clientHeight
      >= scrollHeight - ARRIVED_STATE_THRESHOLD_PIXELS;
  isAtRight.value
    = Math.abs(scrollLeft) + clientWidth
      >= scrollWidth - ARRIVED_STATE_THRESHOLD_PIXELS;

  emits('scrollAt', {
    bottom: isAtBottom.value,
    left: isAtLeft.value,
    right: isAtRight.value,
    top: isAtTop.value,
  });
}
</script>

<template>
  <AScrollArea
    :class="[
      props.class,
      {
        'mask-linear-[90deg,transparent,#000_32px,#000_calc(100%-32px),transparent_100%]': hasBothShadow,
        'not-[[data-both-shadow]]:mask-linear-[90deg,transparent,#000_32px]': !isAtLeft && showShadowLeft,
        'not-[[data-both-shadow]]:mask-linear-[90deg,transparent,#000_32px,#000_calc(100%-32px),transparent_100%]': !isAtRight && showShadowRight,
      },
    ]"
    class="taman-scrollbar relative"
    :data-both-shadow="hasBothShadow || undefined"
    :on-scroll="handleScroll"
  >
    <div
      v-if="showShadowTop"
      :class="{
        'opacity-100': !isAtTop,
        'opacity-0': isAtTop,
        'border-border border-t': shadowBorder && !isAtTop,
      }"
      class="will-change-[opacity] h-12 w-full pointer-events-none transition-opacity-300 ease-in-out top-0 absolute z-10 from-background-sidebar to-transparent bg-gradient-to-b"
    />

    <slot />

    <div
      v-if="showShadowBottom"
      :class="{
        'opacity-100': !isAtTop && !isAtBottom,
        'opacity-0': isAtBottom,
        'border-border border-b': shadowBorder && !isAtTop && !isAtBottom,
      }"
      class="scrollbar-bottom-shadow will-change-[opacity] h-12 w-full pointer-events-none transition-opacity-300 ease-in-out bottom-0 absolute z-10"
    />

    <AScrollBar
      v-if="horizontal"
      :class="scrollBarClass"
      orientation="horizontal"
    />
  </AScrollArea>
</template>
