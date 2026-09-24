<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import type { FormCustomRenderType } from '../form.types';
import { useForwardExpose } from '@taman-core/composables';
import {
  FormLabel,
  TamanRenderContent,
} from '@taman-core/taman-ui';
import PTooltip from 'pohon-ui/components/Tooltip.vue';
import PIcon from 'pohon-ui/components/Icon.vue';

interface Props {
  class?: HTMLAttributes['class'];
  help?: FormCustomRenderType;
  label?: FormCustomRenderType;
  required?: boolean;
}

const props = defineProps<Props>();

const { forwardRef } = useForwardExpose();

// eslint-disable-next-line style/quotes -- a template literal avoids escaping the embedded apostrophes in `'*'`
const REQUIRED_CLASS = `after:content-['*'] after:color-error after:ml-0.5 after:order-1`;
</script>

<template>
  <FormLabel
    :ref="forwardRef"
    class="flex items-center"
    :class="[
      props.class,
      props.required ? REQUIRED_CLASS : '',
    ]"
  >
    <slot />

    <PTooltip
      v-if="help"
      class="order-2"
    >
      <PIcon name="lucide:circle-question-mark" />

      <template #content>
        <TamanRenderContent :content="help" />
      </template>
    </PTooltip>
  </FormLabel>
</template>
