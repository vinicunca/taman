<script setup lang="ts">
import type { LayoutAuthToolbarType } from './layout.auth.types';

import { preferences } from '@taman/preferences';
import { computed } from 'vue';

import {
  LayoutWidgetLanguageToggle,
  LayoutWidgetThemeToggle,
  WidgetAuthLayoutToggle,
  WidgetColorToggle,
} from '../widgets';

interface Props {
  toolbarList?: Array<LayoutAuthToolbarType>;
}

defineOptions({
  name: 'LayoutAuthToolbar',
});

const props = withDefaults(
  defineProps<Props>(),
  {
    toolbarList: () => ['color', 'language', 'layout', 'theme'],
  },
);

const showColor = computed(() => props.toolbarList.includes('color'));
const showLayout = computed(() => props.toolbarList.includes('layout'));
const showLanguage = computed(() => props.toolbarList.includes('language'));
const showTheme = computed(() => props.toolbarList.includes('theme'));
</script>

<template>
  <div
    :class="{
      'rounded-3xl bg-background-accented px-3 py-1': toolbarList.length > 1,
    }"
    class="flex-center right-2 top-4 absolute z-10"
  >
    <div class="hidden md:flex">
      <WidgetColorToggle v-if="showColor" />
      <WidgetAuthLayoutToggle v-if="showLayout" />
    </div>

    <LayoutWidgetLanguageToggle v-if="showLanguage && preferences.widget.languageToggle" />
    <LayoutWidgetThemeToggle v-if="showTheme && preferences.widget.themeToggle" />
  </div>
</template>
