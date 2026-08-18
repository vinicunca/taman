<script setup lang="ts">
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
      root: 'flex-row-reverse justify-between',
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
