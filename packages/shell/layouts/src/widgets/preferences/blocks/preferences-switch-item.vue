<script setup lang="ts">
import PSwitch from 'pohon-ui/components/Switch.vue';
import PTooltip from 'pohon-ui/components/Tooltip.vue';
import PIcon from 'pohon-ui/runtime/vue/components/Icon.vue';

defineOptions({
  name: 'PreferenceSwitchItem',
});

const {
  label,
  disabled = false,
  tip = '',
} = defineProps<{
  label: string;
  disabled?: boolean;
  tip?: string;
}>();

const checked = defineModel<boolean>();
</script>

<template>
  <PSwitch
    v-model="checked"
    :disabled="disabled"
    :ui="{
      root: 'flex-row-reverse justify-between py-2 hover:bg-background-elevated rounded-lg px-2 transition-colors-280',
      wrapper: 'pohon:ms-0',
    }"
  >
    <template #label>
      <div class="inline-flex gap-2 items-center">
        {{ label }}

        <PTooltip
          v-if="tip"
          :text="tip"
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
      </div>
    </template>
  </PSwitch>
</template>
