<script setup lang="ts">
import type { CSSProperties } from 'vue';

interface Props {
  dotClass?: string;
  dotStyle?: CSSProperties;
}

withDefaults(defineProps<Props>(), {
  dotClass: '',
  dotStyle: () => ({}),
});
</script>

<template>
  <span class="mr-1 flex size-1.5 relative">
    <span
      :class="dotClass"
      :style="dotStyle"
      class="rounded-full opacity-75 inline-flex size-full absolute animate-ping"
    />
    <span
      :class="dotClass"
      :style="dotStyle"
      class="rounded-full inline-flex size-1.5 relative"
    />
  </span>
</template>
