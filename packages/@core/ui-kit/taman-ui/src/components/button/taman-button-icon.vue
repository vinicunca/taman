<script lang="ts" setup>
import type { ButtonProps } from 'pohon-ui';
import { computed } from 'vue';

const {
  showTooltip = true,
  tooltipText,
  icon,
  disabled,
} = defineProps<ButtonProps & {
  showTooltip?: boolean;
  tooltipText?: string;
}>();

const emits = defineEmits<{
  click: [event: MouseEvent];
}>();

/**
 * PTooltip injects TooltipProviderContext even when disabled — only mount it when needed.
 * This case is needed for the alert dialogs in `alert-builder.ts` since it's being rendered outside of the base Vue app.
 * TODO: revisit this if we can render the alert dialogs inside the base Vue app.
 */
const withTooltip = computed(
  () => Boolean(showTooltip && tooltipText),
);
</script>

<template>
  <PTooltip
    v-if="withTooltip"
    :text="tooltipText"
  >
    <PButton
      class="pohon:rounded-full"
      variant="ghost"
      color="neutral"
      :icon="icon"
      :disabled="disabled"
      @click="emits('click', $event)"
    />
  </PTooltip>

  <PButton
    v-else
    class="pohon:rounded-full"
    variant="ghost"
    color="neutral"
    :icon="icon"
    :disabled="disabled"
    @click="emits('click', $event)"
  />
</template>
