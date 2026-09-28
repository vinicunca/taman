<script lang="ts" setup>
import type { LabelProps } from 'akar';
import type { HTMLAttributes } from 'vue';

import { Label } from '../label';
import { useFormField } from './use-form-field';

const props = defineProps<
LabelProps & { class?: HTMLAttributes['class'] }
>();

const { error, formItemId } = useFormField();
</script>

<template>
  <Label
    data-slot="form-label"
    :data-error="!!error"
    :class="[props.class]"
    :for="formItemId"
  >
    <slot />
  </Label>
</template>
