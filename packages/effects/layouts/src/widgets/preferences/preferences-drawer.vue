<script lang="ts" setup>
import type { TamanThemeModeType } from '@taman/types';
import type { TabsItem } from 'pohon-ui';
import { useTamanDrawer } from '@taman-core/popup-ui';
import { $t } from '@taman/locales';
import { usePreferences } from '@taman/preferences';
import { computed } from 'vue';
import {
  PreferenceBlock,
  PreferenceTheme,
} from './blocks';

const {
  customPreferences,
  diffCustomPreference,
  diffPreference,
  isDark,
  isFullContent,
  isHeaderNav,
  isHeaderSidebarNav,
  isMixedNav,
  preferencesExtension,
  isSideMixedNav,
  isSideMode,
  isSideNav,
} = usePreferences();

/**
 * ----------
 * Theme
 * ----------
 */
const themeSemiDarkSidebar = defineModel<boolean>('themeSemiDarkSidebar');
const themeSemiDarkSidebarSub = defineModel<boolean>('themeSemiDarkSidebarSub');
const themeSemiDarkHeader = defineModel<boolean>('themeSemiDarkHeader');

const customPreferencesTab = computed(() => {
  return preferencesExtension.value;
});

const customTabLabel = computed(() => {
  return customPreferencesTab.value?.tabLabel
    ? $t(customPreferencesTab.value.tabLabel)
    : '';
});

const showCustomTab = computed(() => {
  return (customPreferencesTab.value?.fields.length ?? 0) > 0;
});

const tabs = computed<Array<TabsItem>>(() => {
  const items: Array<TabsItem> = [
    {
      label: $t('preferences.appearance'),
      value: 'appearance',
      slot: 'appearance',
    },
    {
      label: $t('preferences.layout'),
      value: 'layout',
      slot: 'layout',
    },
    {
      label: $t('preferences.shortcutKeys.title'),
      value: 'shortcutKey',
      slot: 'shortcutKey',
    },
    {
      label: $t('preferences.general'),
      value: 'general',
      slot: 'general',
    },
  ];

  if (showCustomTab.value) {
    items.push({
      label: customTabLabel.value,
      value: 'custom',
      slot: 'custom',
    });
  }

  return items;
});

const [Drawer] = useTamanDrawer();
</script>

<template>
  <Drawer
    :description="$t('preferences.subtitle')"
    :title="$t('preferences.title')"
    class="pohon:w-auto"
  >
    <template #extra>
      <PTooltip :text="$t('preferences.resetTip')">
        <PButton
          icon="lucide:rotate-cw"
          class="pohon:rounded-full"
          variant="ghost"
          color="neutral"
        />
      </PTooltip>

      <PTooltip :text="$t('preferences.enableStickyPreferencesNavigationBar')">
        <PButton
          icon="lucide:pin"
          class="pohon:rounded-full"
          variant="ghost"
          color="neutral"
        />
      </PTooltip>
    </template>

    <PTabs
      :items="tabs"
      default-value="appearance"
    >
      <template #appearance>
        <PreferenceBlock :title="$t('preferences.theme.title')">
          <PreferenceTheme
            v-model:theme-semi-dark-header="themeSemiDarkHeader"
            v-model:theme-semi-dark-sidebar="themeSemiDarkSidebar"
            v-model:theme-semi-dark-sidebar-sub="themeSemiDarkSidebarSub"
          />
        </PreferenceBlock>
      </template>
    </PTabs>

    <template #footer>
      <PButton
        block
        icon="lucide:copy"
        size="sm"
      >
        {{ $t('preferences.copyPreferences') }}
      </PButton>

      <PButton
        variant="outline"
        block
        color="neutral"
        size="sm"
      >
        {{ $t('preferences.clearAndLogout') }}
      </PButton>
    </template>
  </Drawer>
</template>
