<script setup lang="ts">
import type { TamanBuiltinThemeType } from '@taman/types';
import type { BuiltinThemePreset, ThemeBrandColors } from '@vinicunca/taman-core/preferences';
import type { ComponentPublicInstance } from 'vue';

import { $t } from '@taman/locales';
import { toTitleCase } from '@taman/utils';
import { BUILT_IN_THEME_PRESETS } from '@vinicunca/taman-core/preferences';
import PColorPicker from 'pohon-ui/components/ColorPicker.vue';
import PIcon from 'pohon-ui/components/Icon.vue';
import PPopover from 'pohon-ui/components/Popover.vue';
import { onMounted, ref, watch } from 'vue';

defineOptions({
  name: 'PreferencesBuiltinTheme',
});

const props = defineProps<{ isDark: boolean }>();

const colorInput = ref<string>();
const modelValue = defineModel<TamanBuiltinThemeType>({ default: 'default' });
const themeBrands = defineModel<ThemeBrandColors>('themeBrands');

watch(
  () => [modelValue.value, props.isDark],
  ([modelValue_, isDark_]) => {
    const theme = BUILT_IN_THEME_PRESETS.find((item) => item.type === modelValue_);

    if (!theme || !themeBrands.value) {
      return;
    }

    const primary = (
      isDark_
        ? theme.darkPrimaryColor ?? theme.primaryColor
        : theme.primaryColor
    ) ?? theme.color;

    themeBrands.value = {
      ...themeBrands.value,
      primary,
    };
  },
);

const isOpen = ref(false);
const referenceEl = ref<HTMLElement>();

function setCustomRef(el: Element | ComponentPublicInstance | null) {
  referenceEl.value = el instanceof HTMLElement ? el : undefined;
}

function handleSelect(theme: BuiltinThemePreset) {
  if (theme.type === 'custom') {
    isOpen.value = true;
  }

  modelValue.value = theme.type;
}

watch(
  colorInput,
  (colorInput_) => {
    if (!themeBrands.value || !colorInput_) {
      return;
    }

    themeBrands.value = {
      ...themeBrands.value,
      primary: colorInput_,
    };
  },
);

onMounted(() => {
  if (modelValue.value === 'custom') {
    colorInput.value = themeBrands.value?.primary;
  }
});
</script>

<template>
  <div class="gap-4 grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))] justify-between">
    <button
      v-for="theme in BUILT_IN_THEME_PRESETS"
      :key="theme.type"
      :ref="theme.type === 'custom' ? setCustomRef : undefined"
      class="group flex flex-col gap-2"
      @click="handleSelect(theme)"
    >
      <div
        class="outline-box flex-col-center pohon:py-3"
        :class="{
          'outline-box-active': theme.type === modelValue,
        }"
      >
        <div
          v-if="theme.type !== 'custom'"
          :style="{ backgroundColor: theme.color }"
          class="rounded-md size-5"
        />

        <div v-else>
          <PIcon name="lucide:user-round-pen" />
        </div>
      </div>

      <div class="text-xs color-text-muted text-center">
        {{ toTitleCase($t(theme.type)) }}
      </div>
    </button>

    <PPopover
      v-model:open="isOpen"
      :reference="referenceEl"
    >
      <template #content>
        <PColorPicker
          v-model="colorInput"
          class="p-4"
          :throttle="300"
          :ui="{
            selectorThumb: 'border-2',
          }"
        />
      </template>
    </PPopover>
  </div>
</template>
