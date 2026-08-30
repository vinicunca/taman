<script setup lang="ts">
import type { Component } from 'vue';

import { $t } from '@taman/locales';
import { computed } from 'vue';

import {
  IconLayoutContentCompact,
  IconLayoutHeaderNav,
} from './icons';

defineOptions({
  name: 'PreferencesContent',
});

const modelValue = defineModel<string>({ default: 'wide' });

const components: Record<string, Component> = {
  wide: IconLayoutHeaderNav,
  compact: IconLayoutContentCompact,
};

const CONTENT_PRESET = computed(() => [
  {
    name: $t('preferences.wide'),
    type: 'wide',
  },
  {
    name: $t('preferences.compact'),
    type: 'compact',
  },
]);

function activeClass(theme: string): Array<string> {
  return theme === modelValue.value ? ['outline-box-active'] : [];
}
</script>

<template>
  <div class="flex gap-5 w-full">
    <button
      v-for="theme in CONTENT_PRESET"
      :key="theme.name"
      class="group flex flex-col gap-2 w-25"
      @click="modelValue = theme.type"
    >
      <div
        :class="activeClass(theme.type)"
        class="outline-box flex-center"
      >
        <component :is="components[theme.type]" />
      </div>

      <div class="text-xs color-text-muted font-500 text-center group-hover:color-text">
        {{ theme.name }}
      </div>
    </button>
  </div>
</template>
