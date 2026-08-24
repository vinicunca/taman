<script setup lang="ts">
import type { LabelProps } from 'akar';
import type { HTMLAttributes } from 'vue';

import { reactiveOmit } from '@vueuse/core';
import { Label } from 'akar';

const props = defineProps<
LabelProps & { class?: HTMLAttributes['class'] }
>();

const delegatedProps = reactiveOmit(props, 'class');
</script>

<template>
  <Label
    data-slot="label"
    v-bind="delegatedProps"
    class="text-sm leading-none font-500 flex gap-2 select-none items-center group-data-[disabled=true]:(opacity-50 pointer-events-none) peer-disabled:(opacity-50 cursor-not-allowed)"
    :class="
      [
        props.class,
      ]
    "
  >
    <slot />
  </Label>
</template>
