<script setup lang="ts">
import type { FormCustomRenderType } from '../form.types';

import { useForwardExpose } from '@taman-core/composables';
import {
  FormLabel,
  TamanRenderContent,
  VbenHelpTooltip,
} from '@taman-core/taman-ui';

interface Props {
  class?: string;
  colon?: boolean;
  help?: FormCustomRenderType;
  label?: FormCustomRenderType;
  required?: boolean;
}

const props = defineProps<Props>();

const { forwardRef } = useForwardExpose();
</script>

<template>
  <FormLabel
    :ref="forwardRef"
    class="flex items-center"
    :class="[props.class]"
  >
    <span
      v-if="required"
      class="text-destructive mr-0.5"
    >*</span>
    <slot />
    <VbenHelpTooltip
      v-if="help"
      trigger-class="size-3.5 ml-1"
    >
      <TamanRenderContent :content="help" />
    </VbenHelpTooltip>
    <slot name="extra" />
    <span
      v-if="colon && label"
      class="ml-0.5"
    >:</span>
  </FormLabel>
</template>
