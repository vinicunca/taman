<script setup lang="ts">
import type { TamanRenderContentType } from '../../components/render-content/render-content.types';
import type { TamanFormFieldArrayRowContext } from '../form.types';
import { computed } from 'vue';
import { TamanRenderContent } from '../..';

defineOptions({
  name: 'FormFieldArrayRowContent',
  inheritAttrs: false,
});

const props = defineProps<{
  context: TamanFormFieldArrayRowContext;
  render: (ctx: TamanFormFieldArrayRowContext) => TamanRenderContentType | null | undefined;
}>();

// Computed in this instance, so the callback tracks only this row's values and
// one row changing does not re-run the callback of another.
const content = computed(() => props.render(props.context));
</script>

<template>
  <div
    v-if="content"
    v-bind="$attrs"
  >
    <TamanRenderContent :content="content" />
  </div>
</template>
