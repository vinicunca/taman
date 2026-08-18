<script lang="ts" setup>
import type { TamanThemeModeType } from '@taman/types';
import { $t } from '@taman/locales';
import { usePreferences } from '@taman/preferences';
import { watch } from 'vue';
import PreferencesSwitchItem from '../preferences-switch-item.vue';

const themeSemiDarkSidebar = defineModel<boolean>('themeSemiDarkSidebar');
const themeSemiDarkSidebarSub = defineModel<boolean>('themeSemiDarkSidebarSub');
const themeSemiDarkHeader = defineModel<boolean>('themeSemiDarkHeader');

const { colorMode, layout } = usePreferences();

watch(
  () => themeSemiDarkSidebar.value,
  () => {
    if (!themeSemiDarkSidebar.value) {
      themeSemiDarkSidebarSub.value = themeSemiDarkSidebar.value;
    }
  },
);

interface PresetItem {
  icon: string;
  name: TamanThemeModeType;
}

const THEME_PRESET: Array<PresetItem> = [
  {
    icon: 'lucide:sun',
    name: 'light',
  },
  {
    icon: 'lucide:moon-star',
    name: 'dark',
  },
  {
    icon: 'lucide:sun-moon',
    name: 'auto',
  },
];

function activeClass(theme: string): Array<string> {
  return theme === colorMode.store.value ? ['outline-box-active'] : [];
}

function nameView(name: string) {
  switch (name) {
    case 'auto': {
      return $t('preferences.followSystem');
    }
    case 'dark': {
      return $t('preferences.theme.dark');
    }
    case 'light': {
      return $t('preferences.theme.light');
    }
  }
}

function handleThemeChange(theme: TamanThemeModeType) {
  colorMode.store.value = theme;
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <div class="flex flex-wrap gap-12 w-full justify-between">
      <button
        v-for="theme in THEME_PRESET"
        :key="theme.name"
        class="flex flex-1 flex-col"
        @click="handleThemeChange(theme.name)"
      >
        <div
          class="outline-box flex-center pohon:py-4"
          :class="activeClass(theme.name)"
        >
          <PIcon
            :name="theme.icon"
            class="size-5"
          />
        </div>

        <div class="text-xs color-text-muted mt-2 text-center">
          {{ nameView(theme.name) }}
        </div>
      </button>
    </div>

    <PreferencesSwitchItem
      v-model="themeSemiDarkSidebar"
      :disabled="
        colorMode === 'dark'
          || layout === 'header-nav'
          || layout === 'full-content'
      "
      :label="$t('preferences.theme.darkSidebar')"
      :tip="$t('preferences.theme.darkSidebarTip')"
    />

    <PreferencesSwitchItem
      v-model="themeSemiDarkSidebarSub"
      :disabled="
        colorMode === 'dark'
          || (layout !== 'header-mixed-nav' && layout !== 'sidebar-mixed-nav')
          || !themeSemiDarkSidebar
      "
      :label="$t('preferences.theme.darkSidebarSub')"
      :tip="$t('preferences.theme.darkSidebarSubTip')"
    />

    <PreferencesSwitchItem
      v-model="themeSemiDarkHeader"
      :disabled="colorMode === 'dark'"
      :label="$t('preferences.theme.darkHeader')"
    />
  </div>
</template>
