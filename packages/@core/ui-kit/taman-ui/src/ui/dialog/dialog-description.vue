<script lang="ts" setup>
import type { DialogDescriptionProps } from 'akar';
import type { HTMLAttributes } from 'vue';
import { reactiveOmit } from '@vueuse/core';
import { DialogDescription, useForwardProps } from 'akar';

const props = defineProps<
  DialogDescriptionProps & { class?: HTMLAttributes['class'] }
>();

const delegatedProps = reactiveOmit(props, 'class');

const forwardedProps = useForwardProps(delegatedProps);
</script>

<template>
  <DialogDescription
    data-slot="dialog-description"
    v-bind="forwardedProps"
    class="text-sm color-text-muted"
    :class="props.class"
  >
    <slot />
  </DialogDescription>
</template>
