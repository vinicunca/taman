<script lang="ts" setup>
import type { HTMLAttributes } from 'vue';

import { useFormField } from './use-form-field';

const props = defineProps<{
  class?: HTMLAttributes['class'];
}>();

const { error, formMessageId } = useFormField();
</script>

<template>
  <p
    v-if="error"
    :id="formMessageId"
    data-slot="form-message"
    class="text-sm color-error"
    :class="[props.class]"
  >
    {{ error }}
  </p>
</template>
