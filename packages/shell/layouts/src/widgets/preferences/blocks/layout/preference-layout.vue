<script lang="ts" setup>
import type { TamanLayoutType } from '@taman/types';
import type { Component } from 'vue';
import { $t } from '@taman/locales';
import { computed } from 'vue';

import {
  IconLayoutFullContent,
  IconLayoutHeaderMixedNav,
  IconLayoutHeaderNav,
  IconLayoutHeaderSidebarNav,
  IconLayoutMixedNav,
  IconLayoutSidebarMixedNav,
  IconLayoutSidebarNav,
} from './icons';

interface PresetItem {
  name: string;
  tip: string;
  type: TamanLayoutType;
}

const LAYOUT_PRESET = computed<Array<PresetItem>>(() => [
  {
    name: $t('preferences.vertical'),
    tip: $t('preferences.verticalTip'),
    type: 'sidebar-nav',
  },
  {
    name: $t('preferences.twoColumn'),
    tip: $t('preferences.twoColumnTip'),
    type: 'sidebar-mixed-nav',
  },
  {
    name: $t('preferences.horizontal'),
    tip: $t('preferences.horizontalTip'),
    type: 'header-nav',
  },
  {
    name: $t('preferences.headerSidebarNav'),
    tip: $t('preferences.headerSidebarNavTip'),
    type: 'header-sidebar-nav',
  },
  {
    name: $t('preferences.mixedMenu'),
    tip: $t('preferences.mixedMenuTip'),
    type: 'mixed-nav',
  },
  {
    name: $t('preferences.headerTwoColumn'),
    tip: $t('preferences.headerTwoColumnTip'),
    type: 'header-mixed-nav',
  },
  {
    name: $t('preferences.fullContent'),
    tip: $t('preferences.fullContentTip'),
    type: 'full-content',
  },
]);

const components: Record<TamanLayoutType, Component> = {
  'full-content': IconLayoutFullContent,
  'header-nav': IconLayoutHeaderNav,
  'mixed-nav': IconLayoutMixedNav,
  'sidebar-mixed-nav': IconLayoutSidebarMixedNav,
  'sidebar-nav': IconLayoutSidebarNav,
  'header-mixed-nav': IconLayoutHeaderMixedNav,
  'header-sidebar-nav': IconLayoutHeaderSidebarNav,
};

const modelValue = defineModel<TamanLayoutType>({ default: 'sidebar-nav' });

function activeClass(theme: string): Array<string> {
  return theme === modelValue.value ? ['outline-box-active'] : [];
}

function handleLayoutChange(layout: TamanLayoutType) {
  modelValue.value = layout;
}
</script>

<template>
  <div class="flex flex-wrap gap-5 justify-between">
    <button
      v-for="layout in LAYOUT_PRESET"
      :key="layout.name"
      class="group flex flex-col gap-2 w-25"
      @click="handleLayoutChange(layout.type)"
    >
      <div
        :class="activeClass(layout.type)"
        class="outline-box flex-center"
      >
        <component :is="components[layout.type]" />
      </div>

      <div class="text-xs color-text-muted text-center flex-center gap-1 group-hover:color-text">
        {{ layout.name }}

        <PTooltip
          :content="{
            side: 'bottom',
          }"
          :text="layout.tip"
        >
          <PIcon
            name="lucide:info"
            class="cursor-help"
          />
        </PTooltip>
      </div>
    </button>
  </div>
</template>
