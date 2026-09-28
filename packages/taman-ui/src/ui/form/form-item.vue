<script lang="ts" setup>
import type { HTMLAttributes } from 'vue';

import { useId } from 'akar';
import { provide } from 'vue';

import { FORM_ITEM_INJECTION_KEY } from './injection-keys';

const props = defineProps<{
  class?: HTMLAttributes['class'];
}>();

const id = useId();
provide(FORM_ITEM_INJECTION_KEY, id);
</script>

<template>
  <div
    data-slot="form-item"
    :class="[props.class]"
  >
    <slot />
  </div>
</template>
