<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import type { FormCustomRenderType } from '../form.types';

import { FormControl, TamanRenderContent } from '../..';

interface Props {
  controlClass?: HTMLAttributes['class'];
  suffix?: FormCustomRenderType;
  wrapperClass?: HTMLAttributes['class'];
}

const props = defineProps<Props>();
</script>

<template>
  <div
    class="flex gap-1 w-full items-center relative"
    :class="[props.wrapperClass]"
  >
    <FormControl :class="props.controlClass">
      <slot />
    </FormControl>

    <!-- Custom suffix -->
    <div v-if="props.suffix">
      <TamanRenderContent :content="props.suffix" />
    </div>
  </div>
</template>
