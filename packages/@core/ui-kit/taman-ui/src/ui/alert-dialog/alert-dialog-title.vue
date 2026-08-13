<script setup lang="ts">
import type { AlertDialogTitleProps } from 'akar';
import type { HTMLAttributes } from 'vue';

import { reactiveOmit } from '@vueuse/core';
import { AlertDialogTitle } from 'akar';

const props = defineProps<
  AlertDialogTitleProps & { class?: HTMLAttributes['class'] }
>();

const delegatedProps = reactiveOmit(props, 'class');
</script>

<template>
  <AlertDialogTitle
    data-slot="alert-dialog-title"
    v-bind="delegatedProps"
    class="text-lg font-semibold"
    :class="[props.class]"
  >
    <slot />
  </AlertDialogTitle>
</template>
