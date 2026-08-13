<script lang="ts">
import type { PropType } from 'vue';

import type { DescriptionsItemSpan, DescriptionsRenderNode } from './types';

import { defineComponent } from 'vue';

import { DESCRIPTIONS_ITEM_NAME } from './use-descriptions';

/**
 * Marker component for child-node usage; renders nothing itself.
 * Parent VbenDescriptions collects its props and default slot as list items.
 */
const VbenDescriptionsItem = defineComponent({
  name: DESCRIPTIONS_ITEM_NAME,
  props: {
    content: {
      default: undefined,
      type: [
        String,
        Number,
        Function,
        Object,
      ] as PropType<DescriptionsRenderNode>,
    },
    contentStyle: {
      default: undefined,
      type: Object,
    },
    label: {
      default: undefined,
      type: [
        String,
        Number,
        Function,
        Object,
      ] as PropType<DescriptionsRenderNode>,
    },
    labelStyle: {
      default: undefined,
      type: Object,
    },
    span: {
      default: undefined,
      type: [Number, String, Object] as PropType<DescriptionsItemSpan>,
    },
  },
  setup() {
    return () => null;
  },
});

// Extra marker for reliable vnode identification
(VbenDescriptionsItem as Record<string, any>).__isDescriptionsItem = true;

export default VbenDescriptionsItem;
</script>
