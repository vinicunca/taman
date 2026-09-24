<script setup lang="ts">
import type { SelectOption } from '@taman/types';

import { Input, VbenTooltip } from '@vben-core/shadcn-ui';
import { useSlots } from 'vue';

defineOptions({
  name: 'PreferenceSelectItem',
});

withDefaults(
  defineProps<{
    disabled?: boolean;
    items?: Array<SelectOption>;
    placeholder?: string;
    tip?: string;
  }>(),
  {
    disabled: false,
    placeholder: '',
    tip: '',
    items: () => [],
  },
);

const inputValue = defineModel<string>();

const slots = useSlots();
</script>

<template>
  <div
    :class="{
      'hover:bg-background-accented': !(slots.tip || tip),
      'pointer-events-none opacity-50': disabled,
    }"
    class="my-1 px-2 py-1 rounded-md flex w-full items-center justify-between"
  >
    <span class="text-sm flex items-center">
      <slot />

      <VbenTooltip
        v-if="slots.tip || tip"
        side="bottom"
      >
        <template #trigger>
          <CircleHelp class="ml-1 size-3 cursor-help" />
        </template>
        <slot name="tip">
          <template v-if="tip">
            <p
              v-for="(line, index) in tip.split('\n')"
              :key="index"
            >
              {{ line }}
            </p>
          </template>
        </slot>
      </VbenTooltip>
    </span>
    <div class="relative">
      <Input
        v-model="inputValue"
        class="h-8 w-41.25"
        :placeholder="placeholder"
      />
      <CircleX
        v-if="inputValue"
        class="color-text/60 size-3 cursor-pointer transform right-2 top-1/2 absolute hover:color-text -translate-y-1/2"
        @click="() => (inputValue = '')"
      />
    </div>
  </div>
</template>
