<script setup lang="ts">
import type { TamanButtonCheckGroupOption, TamanButtonCheckGroupValue } from '@vinicunca/taman-ui';

import { TamanButtonCheckGroup } from '@vinicunca/taman-ui';
import PIcon from 'pohon-ui/components/Icon.vue';
import PTooltip from 'pohon-ui/components/Tooltip.vue';

defineOptions({
  name: 'PreferenceCheckboxItem',
});

const props = withDefaults(
  defineProps<{
    disabled?: boolean;
    items?: Array<TamanButtonCheckGroupOption>;
    multiple?: boolean;
    tip?: string;
    onBtnClick?: (value: TamanButtonCheckGroupValue | undefined) => void;
    placeholder?: string;
  }>(),
  {
    disabled: false,
    items: () => [],
    onBtnClick: () => {},
    multiple: false,
  },
);

const inputValue = defineModel<Array<string>>();
</script>

<template>
  <div
    :class="{
      'hover:bg-background-elevated': !props.tip,
      'pointer-events-none opacity-50': props.disabled,
    }"
    class="p-2 rounded-lg flex w-full items-center justify-between"
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

    <TamanButtonCheckGroup
      v-model="inputValue"
      size="sm"
      :options="items"
      :disabled="disabled"
      :multiple="multiple"
      @btn-click="onBtnClick"
    />
  </div>
</template>
