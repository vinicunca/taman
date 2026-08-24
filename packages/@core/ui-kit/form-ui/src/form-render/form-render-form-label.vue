<script setup lang="ts">
import type { FormCustomRenderType } from '../form.types';

import { useForwardExpose } from '@taman-core/composables';
import {
  FormLabel,
  TamanRenderContent,
} from '@taman-core/taman-ui';
import PTooltip from 'pohon-ui/components/Tooltip.vue';
import PIcon from 'pohon-ui/runtime/vue/components/Icon.vue';

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

    <PTooltip
      v-if="help"
    >
      <PIcon name="lucide:circle-question-mark" />

      <template #content>
        <TamanRenderContent :content="help" />
      </template>
    </PTooltip>

    <span
      v-if="colon && label"
      class="ml-0.5"
    >:</span>
  </FormLabel>
</template>
