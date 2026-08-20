<script lang="ts" setup>
import type { ButtonProps } from 'pohon-ui';

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
</script>

<template>
  <PTooltip
    :text="tooltipText"
    :disabled="!showTooltip || !tooltipText"
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
</template>
