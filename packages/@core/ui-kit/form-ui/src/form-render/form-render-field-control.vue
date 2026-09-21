<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import type { FormCustomRenderType } from '../form.types';

import { FormControl, TamanRenderContent } from '@taman-core/taman-ui';

interface Props {
  controlClass?: HTMLAttributes['class'];
  suffix?: FormCustomRenderType;
  wrapperClass?: HTMLAttributes['class'];
}

const props = defineProps<Props>();
</script>

<template>
  <div
    class="flex w-full items-center relative"
    :class="[props.wrapperClass]"
  >
    <FormControl :class="props.controlClass">
      <slot />
    </FormControl>

    <!-- Custom suffix -->
    <div
      v-if="props.suffix"
      class="ml-1"
    >
      <TamanRenderContent :content="props.suffix" />
    </div>
  </div>
</template>
