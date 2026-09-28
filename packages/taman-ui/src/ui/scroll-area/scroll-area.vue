<script lang="ts" setup>
import type { ScrollAreaRootProps } from 'akar';
import type { HTMLAttributes } from 'vue';

import { reactiveOmit } from '@vueuse/core';
import { ScrollAreaCorner, ScrollAreaRoot, ScrollAreaViewport } from 'akar';
import ScrollBar from './scroll-bar.vue';

const props = defineProps<
  ScrollAreaRootProps & {
    class?: HTMLAttributes['class'];
    onScroll?: (event: Event) => void;
  }
>();

const delegatedProps = reactiveOmit(props, 'class', 'onScroll');
</script>

<template>
  <ScrollAreaRoot
    data-slot="scroll-area"
    v-bind="delegatedProps"
    class="relative overflow-hidden"
    :class="props.class"
  >
    <ScrollAreaViewport
      as-child
      data-slot="scroll-area-viewport"
      class="rounded-inherit size-full focus:outline-hidden"
      @scroll="props.onScroll"
    >
      <slot />
    </ScrollAreaViewport>

    <ScrollBar />

    <ScrollAreaCorner />
  </ScrollAreaRoot>
</template>
