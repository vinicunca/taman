<script lang="ts" setup>
import type { TamanLayoutType } from '@taman/types';
import type { TabsItem } from 'pohon-ui';
import { useTamanDrawer } from '@taman-core/popup-ui';
import { $t } from '@taman/locales';
import { usePreferences } from '@taman/preferences';
import { computed } from 'vue';
import {
  PreferenceBlock,
  PreferenceLayout,
  PreferenceTheme,
} from './blocks';

const {
  // customPreferences,
  // diffCustomPreference,
  // diffPreference,
  // isDark,
  // isFullContent,
  // isHeaderNav,
  // isHeaderSidebarNav,
  // isMixedNav,
  preferencesExtension,
  // isSideMixedNav,
  // isSideMode,
  // isSideNav,
} = usePreferences();

/**
 * ----------
 * Appearance
 * ----------
 */
const themeSemiDarkSidebar = defineModel<boolean>('themeSemiDarkSidebar');
const themeSemiDarkSidebarSub = defineModel<boolean>('themeSemiDarkSidebarSub');
const themeSemiDarkHeader = defineModel<boolean>('themeSemiDarkHeader');

/**
 * ----------
 * Layout
 * ----------
 */
const appLayout = defineModel<TamanLayoutType>('appLayout');

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
      label: $t('preferences.layout'),
      value: 'layout',
      slot: 'layout',
    },
    {
      label: $t('preferences.appearance'),
      value: 'appearance',
      slot: 'appearance',
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
    footer-class="pohon:justify-center"
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
      default-value="layout"
      size="sm"
    >
      <template #layout>
        <PreferenceBlock :title="$t('preferences.layout')">
          <PreferenceLayout v-model="appLayout" />
        </PreferenceBlock>

        <!-- <Block :title="$t('preferences.content')">
          <Content v-model="appContentCompact" />
        </Block> -->

        <!-- <Block :title="$t('preferences.sidebar.title')">
          <Sidebar
            v-model:sidebar-auto-activate-child="sidebarAutoActivateChild"
            v-model:sidebar-draggable="sidebarDraggable"
            v-model:sidebar-collapsed="sidebarCollapsed"
            v-model:sidebar-collapsed-show-title="sidebarCollapsedShowTitle"
            v-model:sidebar-enable="sidebarEnable"
            v-model:sidebar-expand-on-hover="sidebarExpandOnHover"
            v-model:sidebar-width="sidebarWidth"
            v-model:sidebar-collapsed-button="sidebarCollapsedButton"
            v-model:sidebar-fixed-button="sidebarFixedButton"
            :current-layout="appLayout"
            :disabled="!isSideMode"
          />
        </Block> -->

        <!-- <Block :title="$t('preferences.header.title')">
          <Header
            v-model:header-enable="headerEnable"
            v-model:header-menu-align="headerMenuAlign"
            v-model:header-mode="headerMode"
            :disabled="isFullContent"
          />
        </Block> -->

        <!-- <Block :title="$t('preferences.navigationMenu.title')">
          <Navigation
            v-model:navigation-accordion="navigationAccordion"
            v-model:navigation-split="navigationSplit"
            v-model:navigation-style-type="TamanNavigationStyleType"
            :disabled="isFullContent"
            :disabled-navigation-split="!isMixedNav"
          />
        </Block> -->

        <!-- <Block :title="$t('preferences.breadcrumb.title')">
          <Breadcrumb
            v-model:breadcrumb-enable="breadcrumbEnable"
            v-model:breadcrumb-hide-only-one="breadcrumbHideOnlyOne"
            v-model:breadcrumb-show-home="breadcrumbShowHome"
            v-model:breadcrumb-show-icon="breadcrumbShowIcon"
            :disabled="
              !showBreadcrumbConfig
                || !(isSideNav || isSideMixedNav || isHeaderSidebarNav)
            "
          />
        </Block> -->

        <!-- <Block :title="$t('preferences.tabbar.title')">
          <Tabbar
            v-model:tabbar-draggable="tabbarDraggable"
            v-model:tabbar-enable="tabbarEnable"
            v-model:tabbar-persist="tabbarPersist"
            v-model:tabbar-visit-history="tabbarVisitHistory"
            v-model:tabbar-show-icon="tabbarShowIcon"
            v-model:tabbar-show-maximize="tabbarShowMaximize"
            v-model:tabbar-show-more="tabbarShowMore"
            v-model:tabbar-style-type="tabbarStyleType"
            v-model:tabbar-wheelable="tabbarWheelable"
            v-model:tabbar-max-count="tabbarMaxCount"
            v-model:tabbar-middle-click-to-close="tabbarMiddleClickToClose"
          />
        </Block> -->

        <!-- <Block :title="$t('preferences.widget.title')">
          <Widget
            v-model:app-preferences-button-position="
              appPreferencesButtonPosition
            "
            v-model:widget-fullscreen="widgetFullscreen"
            v-model:widget-global-search="widgetGlobalSearch"
            v-model:widget-language-toggle="widgetLanguageToggle"
            v-model:widget-lock-screen="widgetLockScreen"
            v-model:widget-notification="widgetNotification"
            v-model:widget-refresh="widgetRefresh"
            v-model:widget-sidebar-toggle="widgetSidebarToggle"
            v-model:widget-theme-toggle="widgetThemeToggle"
            v-model:widget-timezone="widgetTimezone"
          />
        </Block> -->

        <!-- <Block :title="$t('preferences.footer.title')">
          <Footer
            v-model:footer-enable="footerEnable"
            v-model:footer-fixed="footerFixed"
          />
        </Block> -->

        <!-- <Block
          v-if="copyrightSettingShow"
          :title="$t('preferences.copyright.title')"
        >
          <Copyright
            v-model:copyright-company-name="copyrightCompanyName"
            v-model:copyright-company-site-link="copyrightCompanySiteLink"
            v-model:copyright-date="copyrightDate"
            v-model:copyright-enable="copyrightEnable"
            :disabled="!footerEnable"
          />
        </Block> -->
      </template>

      <template #appearance>
        <PreferenceBlock :title="$t('preferences.theme.title')">
          <PreferenceTheme
            v-model:theme-semi-dark-header="themeSemiDarkHeader"
            v-model:theme-semi-dark-sidebar="themeSemiDarkSidebar"
            v-model:theme-semi-dark-sidebar-sub="themeSemiDarkSidebarSub"
          />
        </PreferenceBlock>
      </template>

      <template #shortcutKey>
        shortcutKey
      </template>

      <template #general>
        general
      </template>

      <template #custom>
        custom
      </template>
    </PTabs>

    <template #footer>
      <PButton

        icon="lucide:copy"
        size="sm"
      >
        {{ $t('preferences.copyPreferences') }}
      </PButton>

      <PButton
        variant="outline"

        color="neutral"
        size="sm"
      >
        {{ $t('preferences.clearAndLogout') }}
      </PButton>
    </template>
  </Drawer>
</template>
