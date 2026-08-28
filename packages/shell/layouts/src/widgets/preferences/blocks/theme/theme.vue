<script setup lang="ts">
import type { TamanThemeModeType } from '@taman/types';
import type { Component } from 'vue';

import { $t } from '@taman/locales';
import { usePreferences } from '@taman/preferences';
import { MoonStar, Sun, SunMoon } from '@vben/icons';
import { watch } from 'vue';

import SwitchItem from '../switch-item.vue';

defineOptions({
  name: 'PreferenceTheme',
});

const modelValue = defineModel<string>({ default: 'auto' });
const themeSemiDarkSidebar = defineModel<boolean>('themeSemiDarkSidebar');
const themeSemiDarkSidebarSub = defineModel<boolean>('themeSemiDarkSidebarSub');
const themeSemiDarkHeader = defineModel<boolean>('themeSemiDarkHeader');

const { layout } = usePreferences();

watch(
  () => themeSemiDarkSidebar.value,
  () => {
    if (!themeSemiDarkSidebar.value) {
      themeSemiDarkSidebarSub.value = themeSemiDarkSidebar.value;
    }
  },
);

const THEME_PRESET: Array<{ icon: Component; name: TamanThemeModeType }> = [
  {
    icon: Sun,
    name: 'light',
  },
  {
    icon: MoonStar,
    name: 'dark',
  },
  {
    icon: SunMoon,
    name: 'auto',
  },
];

function activeClass(theme: string): Array<string> {
  return theme === modelValue.value ? ['outline-box-active'] : [];
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
</script>

<template>
  <div class="flex flex-wrap w-full justify-between">
    <template
      v-for="theme in THEME_PRESET"
      :key="theme.name"
    >
      <div
        class="flex flex-col cursor-pointer"
        @click="modelValue = theme.name"
      >
        <div
          :class="activeClass(theme.name)"
          class="outline-box py-4 flex-center"
        >
          <component
            :is="theme.icon"
            class="mx-9 size-5"
          />
        </div>

        <div class="text-muted-foreground text-xs mt-2 text-center">
          {{ nameView(theme.name) }}
        </div>
      </div>
    </template>

    <SwitchItem
      v-model="themeSemiDarkSidebar"
      :disabled="
        modelValue === 'dark'
          || layout === 'header-nav'
          || layout === 'full-content'
      "
      :tip="$t('preferences.theme.darkSidebarTip')"
      class="mt-6"
    >
      {{ $t('preferences.theme.darkSidebar') }}
    </SwitchItem>
    <SwitchItem
      v-model="themeSemiDarkSidebarSub"
      :disabled="
        modelValue === 'dark'
          || (layout !== 'header-mixed-nav' && layout !== 'sidebar-mixed-nav')
          || !themeSemiDarkSidebar
      "
      :tip="$t('preferences.theme.darkSidebarSubTip')"
    >
      {{ $t('preferences.theme.darkSidebarSub') }}
    </SwitchItem>
    <SwitchItem
      v-model="themeSemiDarkHeader"
      :disabled="modelValue === 'dark'"
    >
      {{ $t('preferences.theme.darkHeader') }}
    </SwitchItem>
  </div>
</template>
