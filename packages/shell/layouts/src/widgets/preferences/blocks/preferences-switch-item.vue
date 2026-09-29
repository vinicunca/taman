<script setup lang="ts">
import type { KbdProps } from 'pohon-ui';
import PIcon from 'pohon-ui/components/Icon.vue';
import PKbd from 'pohon-ui/components/Kbd.vue';
import PSwitch from 'pohon-ui/components/Switch.vue';
import PTooltip from 'pohon-ui/components/Tooltip.vue';

defineOptions({
  name: 'PreferenceSwitchItem',
});

const props = withDefaults(
  defineProps<{
    label: string;
    disabled?: boolean;
    tip?: string;
    kbds?: Array<KbdProps['value']>;
  }>(),
  {
    disabled: false,
    tip: '',
    kbds: () => [],
  },
);

const checked = defineModel<boolean>();
</script>

<template>
  <PSwitch
    v-model="checked"
    :disabled="props.disabled"
    :ui="{
      root: 'flex-row-reverse justify-between py-2 hover:bg-background-elevated rounded-lg px-2 transition-colors-280',
      wrapper: 'pohon:ms-0',
    }"
  >
    <template #label>
      <div class="inline-flex gap-2 items-center">
        {{ props.label }}

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

        <div class="flex gap-0.5">
          <PKbd
            v-for="(kbd, index) in props.kbds"
            :key="index"
            :value="kbd"
          />
        </div>
      </div>
    </template>
  </PSwitch>
</template>
