<script lang="ts" setup>
import type { ScrollAreaScrollbarProps } from 'akar';
import type { HTMLAttributes } from 'vue';
import { reactiveOmit } from '@vueuse/core';
import { ScrollAreaScrollbar, ScrollAreaThumb } from 'akar';

const props = withDefaults(
  defineProps<ScrollAreaScrollbarProps & { class?: HTMLAttributes['class'] }>(),
  {
    orientation: 'vertical',
  },
);

const delegatedProps = reactiveOmit(props, 'class');
</script>

<template>
  <ScrollAreaScrollbar
    data-slot="scroll-area-scrollbar"
    v-bind="delegatedProps"
    class="p-px flex select-none transition-colors touch-none"
    :class="[
      {
        'h-full w-2.5 border-l border-l-transparent': orientation === 'vertical',
        'h-2.5 flex-col border-t border-t-transparent': orientation === 'horizontal',
      },
      props.class,
    ]"
  >
    <ScrollAreaThumb
      data-slot="scroll-area-thumb"
      class="rounded-full bg-border flex-1 relative"
    />
  </ScrollAreaScrollbar>
</template>
