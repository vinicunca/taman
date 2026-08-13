<script setup lang="ts">
import { Switch, VbenTooltip } from '@vben-core/shadcn-ui';
import { CircleHelp } from '@vben/icons';
import { useSlots } from 'vue';

defineOptions({
  name: 'PreferenceSwitchItem',
});

withDefaults(defineProps<{ disabled?: boolean; tip?: string }>(), {
  disabled: false,
  tip: '',
});

const checked = defineModel<boolean>();

const slots = useSlots();

function handleClick() {
  checked.value = !checked.value;
}
</script>

<template>
  <div
    :class="{
      'pointer-events-none opacity-50': disabled,
    }"
    class="hover:bg-background-accented my-1 px-2 py-2.5 rounded-md flex w-full items-center justify-between"
    @click="handleClick"
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
    <span
      v-if="$slots.shortcut"
      class="text-xs ml-auto mr-2 opacity-60"
    >
      <slot name="shortcut" />
    </span>
    <Switch
      v-model="checked"
      @click.stop
    />
  </div>
</template>
