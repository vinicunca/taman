<script setup lang="ts">
import type { TamanButtonCheckGroupValue } from '@taman-core/taman-ui';
import type { SelectOption } from '@taman/types';

import { TamanButtonCheckGroup } from '@taman-core/taman-ui';
import PIcon from 'pohon-ui/components/Icon.vue';
import PTooltip from 'pohon-ui/components/Tooltip.vue';
import { useSlots } from 'vue';

defineOptions({
  name: 'PreferenceCheckboxItem',
});

withDefaults(
  defineProps<{
    disabled?: boolean;
    items?: Array<SelectOption>;
    multiple?: boolean;
    onBtnClick?: (value: TamanButtonCheckGroupValue | undefined) => void;
    placeholder?: string;
  }>(),
  {
    disabled: false,
    placeholder: '',
    items: () => [],
    onBtnClick: () => {},
    multiple: false,
  },
);

const inputValue = defineModel<Array<string> | undefined>({ default: undefined });

const slots = useSlots();
</script>

<template>
  <div
    :class="{
      'hover:bg-background-accented': !slots.tip,
      'pointer-events-none opacity-50': disabled,
    }"
    class="my-1 px-2 py-1 rounded-md flex w-full items-center justify-between"
  >
    <span class="text-sm flex items-center">
      <slot />

      <PTooltip
        v-if="slots.tip"
        :content="{ side: 'bottom' }"
      >
        <PIcon
          name="lucide:circle-help"
          class="ml-1 size-3 cursor-help"
        />

        <template #content>
          <slot name="tip" />
        </template>
      </PTooltip>
    </span>
    <TamanButtonCheckGroup
      v-model="inputValue"
      class="h-8 w-41.25"
      size="sm"
      :options="items"
      :disabled="disabled"
      :multiple="multiple"
      @btn-click="onBtnClick"
    />
  </div>
</template>
