<script lang="ts" setup>
import type { HTMLAttributes } from 'vue';

import { useFormField } from './use-form-field';

const props = defineProps<{
  class?: HTMLAttributes['class'];
}>();

const { formDescriptionId } = useFormField();
</script>

<template>
  <p
    :id="formDescriptionId"
    data-slot="form-description"
    class="text-sm color-text-muted"
    :class="[props.class]"
  >
    <slot />
  </p>
</template>
