<script lang="ts" setup>
import type { HTMLAttributes } from 'vue';

import { cn } from '@taman-core/shared/utils';

const props = defineProps<{
  class?: HTMLAttributes['class'];
}>();
</script>

<template>
  <span
    data-slot="breadcrumb-page"
    role="link"
    aria-disabled="true"
    aria-current="page"
    :class="cn('color-text font-normal', props.class)"
  >
    <slot></slot>
  </span>
</template>
