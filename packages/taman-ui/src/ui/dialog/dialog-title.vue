<script setup lang="ts">
import type { DialogTitleProps } from 'akar';
import type { HTMLAttributes } from 'vue';

import { reactiveOmit } from '@vueuse/core';
import { DialogTitle, useForwardProps } from 'akar';

const props = defineProps<
  DialogTitleProps & { class?: HTMLAttributes['class'] }
>();

const delegatedProps = reactiveOmit(props, 'class');

const forwardedProps = useForwardProps(delegatedProps);
</script>

<template>
  <DialogTitle
    data-slot="dialog-title"
    v-bind="forwardedProps"
    class="text-lg leading-none font-600"
    :class="props.class"
  >
    <slot />
  </DialogTitle>
</template>
