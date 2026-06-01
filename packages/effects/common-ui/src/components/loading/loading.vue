<script lang="ts" setup>
import { PohonLoading } from '@taman-core/pohon-ui';

interface LoadingProps {
  class?: string;
  /**
   * Minimum loading time
   */
  minLoadingTime?: number;

  /**
   * Loading state enabled
   */
  spinning?: boolean;
  /**
   * Text
   */
  text?: string;
}

defineOptions({ name: 'Loading' });
const props = defineProps<LoadingProps>();
</script>

<template>
  <div
    class="relative min-h-20"
    :class="props.class"
  >
    <slot />
    <PohonLoading
      :min-loading-time="props.minLoadingTime"
      :spinning="props.spinning"
      :text="props.text"
    >
      <template
        v-if="$slots.icon"
        #icon
      >
        <slot name="icon" />
      </template>
    </PohonLoading>
  </div>
</template>
