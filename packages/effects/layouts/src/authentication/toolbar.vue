<script setup lang="ts">
import type { ToolbarType } from './types';

import { preferences } from '@taman/preferences';
import { computed } from 'vue';

import {
  AuthenticationColorToggle,
  AuthenticationLayoutToggle,
  WidgetLanguageToggle,
  WidgetThemeToggle,
} from '../widgets';

interface Props {
  toolbarList?: Array<ToolbarType>;
}

defineOptions({
  name: 'AuthenticationToolbar',
});

const props = withDefaults(defineProps<Props>(), {
  toolbarList: () => ['color', 'language', 'layout', 'theme'],
});

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
    <!-- Only show on medium and larger screens -->
    <div class="hidden md:flex">
      <AuthenticationColorToggle v-if="showColor" />
      <AuthenticationLayoutToggle v-if="showLayout" />
    </div>

    <!-- Always show Language and Theme toggles -->
    <WidgetLanguageToggle v-if="showLanguage && preferences.widget.languageToggle" />
    <WidgetThemeToggle v-if="showTheme && preferences.widget.themeToggle" />
  </div>
</template>
