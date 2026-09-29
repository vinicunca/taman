<script setup lang="ts">
import type { SelectOption } from '@taman/types';
import PIcon from 'pohon-ui/components/Icon.vue';
import PInputNumber from 'pohon-ui/components/InputNumber.vue';
import PTooltip from 'pohon-ui/components/Tooltip.vue';

defineOptions({
  name: 'PreferenceSelectItem',
});

const props = withDefaults(
  defineProps<{
    disabled?: boolean;
    items?: Array<SelectOption>;
    placeholder?: string;
    tip?: string;
  }>(),
  {
    disabled: false,
    items: () => [],
  },
);

const inputValue = defineModel<number>();
</script>

<template>
  <div
    :class="{
      'hover:bg-background-elevated': !props.tip,
      'pointer-events-none opacity-50': props.disabled,
    }"
    class="p-2 rounded-lg flex w-full items-center justify-between"
  >
    <span class="text-sm inline-flex gap-2 items-center">
      <slot />

      <PTooltip
        v-if="props.tip"
        :text="props.tip"
        :ui="{
          content: 'pohon:h-auto',
          text: 'pohon:whitespace-normal',
        }"
      >
        <PIcon
          name="lucide:circle-help"
          class="color-text-muted"
        />
      </PTooltip>
    </span>

    <PInputNumber
      v-model="inputValue"
    />
  </div>
</template>
