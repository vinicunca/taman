<script lang="ts" setup>
import type { ButtonProps } from 'pohon-ui';
import PButton from 'pohon-ui/components/Button.vue';
import PTooltip from 'pohon-ui/components/Tooltip.vue';
import { computed } from 'vue';

defineOptions({ name: 'TamanButtonIcon' });

const props = withDefaults(
  defineProps<ButtonProps & {
    showTooltip?: boolean;
    tooltipText?: string;
  }>(),
  {
    showTooltip: true,
    tooltipText: '',
  },
);

const emits = defineEmits<{
  click: [event: MouseEvent];
}>();

/**
 * PTooltip injects TooltipProviderContext even when disabled — only mount it when needed.
 * This case is needed for the alert dialogs in `alert-builder.ts` since it's being rendered outside of the base Vue app.
 * TODO: revisit this if we can render the alert dialogs inside the base Vue app.
 */
const withTooltip = computed(
  () => Boolean(props.showTooltip && props.tooltipText),
);
</script>

<template>
  <PTooltip
    v-if="withTooltip"
    :text="props.tooltipText"
  >
    <PButton
      class="pohon:rounded-full"
      variant="ghost"
      color="neutral"
      :icon="props.icon"
      :disabled="props.disabled"
      :ui="props.ui"
      @click="emits('click', $event)"
    />
  </PTooltip>

  <PButton
    v-else
    class="pohon:rounded-full"
    variant="ghost"
    color="neutral"
    :icon="props.icon"
    :disabled="props.disabled"
    :ui="props.ui"
    @click="emits('click', $event)"
  />
</template>
