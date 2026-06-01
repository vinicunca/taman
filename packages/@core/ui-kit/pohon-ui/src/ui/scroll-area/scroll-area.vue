<script setup lang="ts">
import type { ScrollAreaRootProps } from 'akar';
import type { HTMLAttributes } from 'vue';

import { reactiveOmit } from '@vueuse/core';
import { ScrollAreaCorner, ScrollAreaRoot, ScrollAreaViewport } from 'akar';

import ScrollBar from './scroll-bar.vue';

const props = defineProps<
  ScrollAreaRootProps & { class?: HTMLAttributes['class'] }
>();

const delegatedProps = reactiveOmit(props, 'class');
</script>

<template>
  <ScrollAreaRoot
    data-slot="scroll-area"
    v-bind="delegatedProps"
    class="relative overflow-hidden"
    :class="[props.class]"
  >
    <ScrollAreaViewport
      as-child
      data-slot="scroll-area-viewport"
      class="rounded-[inherit] h-full w-full focus:outline-hidden"
    >
      <slot />
    </ScrollAreaViewport>

    <ScrollBar />

    <ScrollAreaCorner />
  </ScrollAreaRoot>
</template>
