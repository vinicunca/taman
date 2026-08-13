<script setup lang="ts">
import { cn } from '@taman-core/shared/utils';

import { CircleHelp } from '@lucide/vue';

import Tooltip from './tooltip.vue';

defineOptions({
  inheritAttrs: false,
});

defineProps<{ triggerClass?: string }>();
</script>

<template>
  <Tooltip :delay-duration="300" side="right">
    <template #trigger>
      <slot name="trigger">
        <CircleHelp
          :class="
            cn(
              'color-text/80 hover:color-text inline-flex size-5 cursor-pointer',
              triggerClass,
            )
          "
        />
      </slot>
    </template>
    <slot></slot>
  </Tooltip>
</template>
