<script lang="ts" setup>
import type { DialogDescriptionProps } from 'akar';
import type { HTMLAttributes } from 'vue';
import { reactiveOmit } from '@vueuse/core';
import { DialogDescription } from 'akar';

const props = defineProps<
  DialogDescriptionProps & { class?: HTMLAttributes['class'] }
>();

const delegatedProps = reactiveOmit(props, 'class');
</script>

<template>
  <DialogDescription
    data-slot="sheet-description"
    v-bind="delegatedProps"
    class="text-sm color-text-muted"
    :class="props.class"
  >
    <slot />
  </DialogDescription>
</template>
