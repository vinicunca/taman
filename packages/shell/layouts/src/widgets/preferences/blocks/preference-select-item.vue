<script setup lang="ts">
import type { SelectOption } from '@taman/types';
import PIcon from 'pohon-ui/components/Icon.vue';
import PSelect from 'pohon-ui/components/Select.vue';
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

const selectValue = defineModel<string>();
</script>

<template>
  <div
    :class="{
      'hover:bg-background-elevated': !props.tip,
      'pointer-events-none opacity-50': props.disabled,
    }"
    class="px-2 py-1 rounded-lg flex w-full items-center justify-between"
  >
    <span class="text-sm font-500 inline-flex gap-2 items-center">
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

    <PSelect
      v-model="selectValue"
      :placeholder="props.placeholder"
      :items="props.items"
      size="sm"
    />
  </div>
</template>
