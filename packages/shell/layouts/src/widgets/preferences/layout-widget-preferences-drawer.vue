<script lang="ts" setup>
import type { ThemeBrandColors } from '@vinicunca/taman-core/preferences';
import type { TabsItem } from 'pohon-ui';
import type {
  TamanBuiltinThemeType,
  TamanContentCompactType,
  TamanLayoutHeaderMenuAlignType,
  TamanLayoutHeaderModeType,
  TamanLayoutType,
} from '@taman/types';
import { preferences, resetPreferences, usePreferences } from '@vinicunca/taman-core/preferences';
import { useTamanDrawer } from '@vinicunca/taman-ui/popup';
import PButton from 'pohon-ui/components/Button.vue';
import PChip from 'pohon-ui/components/Chip.vue';
import PTabs from 'pohon-ui/components/Tabs.vue';
import PTooltip from 'pohon-ui/components/Tooltip.vue';
import { computed } from 'vue';
import { $t, loadLocaleMessages } from '@taman/locales';
import {
  PreferencesBlock,
  PreferencesBuiltinTheme,
  PreferencesContent,
  PreferencesHeader,
  PreferencesLayout,
  PreferencesSidebar,
  PreferencesTheme,
} from './blocks';
import PreferencesGlobalShortcutKeys from './blocks/shortcut-keys/preferences-global-shortcut-keys.vue';

defineOptions({
  name: 'LayoutWidgetPreferencesDrawer',
});

const emits = defineEmits<{
  clearPreferencesAndLogout: [];
}>();

const appEnableStickyPreferencesNavigationBar = defineModel<boolean>('appEnableStickyPreferencesNavigationBar');

/**
 * ----------
 * Layout
 * ----------
 */
const appLayout = defineModel<TamanLayoutType | undefined>('appLayout', { default: undefined });
const appContentCompact = defineModel<TamanContentCompactType | undefined>('appContentCompact', { default: undefined });

const sidebarAutoActivateChild = defineModel<boolean>('sidebarAutoActivateChild');
const sidebarDraggable = defineModel<boolean>('sidebarDraggable');
const sidebarCollapsed = defineModel<boolean>('sidebarCollapsed');
const sidebarCollapsedShowTitle = defineModel<boolean>('sidebarCollapsedShowTitle');
const sidebarEnable = defineModel<boolean>('sidebarEnable');
const sidebarExpandOnHover = defineModel<boolean>('sidebarExpandOnHover');
const sidebarCollapsedButton = defineModel<boolean>('sidebarCollapsedButton');
const sidebarFixedButton = defineModel<boolean>('sidebarFixedButton');
const sidebarWidth = defineModel<number>('sidebarWidth');

const headerEnable = defineModel<boolean>('headerEnable');
const headerMode = defineModel<TamanLayoutHeaderModeType>('headerMode');
const headerMenuAlign = defineModel<TamanLayoutHeaderMenuAlignType>('headerMenuAlign');

/**
 * ----------
 * Appearance
 * ----------
 */
const themeSemiDarkSidebar = defineModel<boolean>('themeSemiDarkSidebar');
const themeSemiDarkSidebarSub = defineModel<boolean>('themeSemiDarkSidebarSub');
const themeSemiDarkHeader = defineModel<boolean>('themeSemiDarkHeader');
const themeBuiltinType = defineModel<TamanBuiltinThemeType | undefined>('themeBuiltinType', { default: undefined });
const themeBrands = defineModel<ThemeBrandColors | undefined>('themeBrands', { default: undefined });

/**
 * ----------
 * Shortcut Keys
 * ----------
 */
const shortcutKeysEnable = defineModel<boolean>('shortcutKeysEnable');
const shortcutKeysGlobalSearch = defineModel<boolean>('shortcutKeysGlobalSearch');
const shortcutKeysGlobalLogout = defineModel<boolean>('shortcutKeysGlobalLogout');
const shortcutKeysGlobalEscape = defineModel<boolean>('shortcutKeysGlobalEscape');
const shortcutKeysGlobalLockScreen = defineModel<boolean>('shortcutKeysGlobalLockScreen');

const {
  diffPreference,
  isDark,
  isFullContent,
  // isHeaderNav,
  // isHeaderSidebarNav,
  // isMixedNav,
  // isSideMixedNav,
  isSideMode,
  // isSideNav,
} = usePreferences();

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

  return items;
});

const [DrawerPreferences] = useTamanDrawer();

async function handleReset() {
  if (!diffPreference.value) {
    return;
  }
  await resetPreferences();
  await loadLocaleMessages(preferences.app.locale);
}
</script>

<template>
  <DrawerPreferences
    :description="$t('preferences.subtitle')"
    :title="$t('preferences.title')"
    footer-class="pohon:justify-center"
  >
    <template #extra>
      <PChip
        inset
        :show="Boolean(diffPreference)"
      >
        <PTooltip
          :text="$t('preferences.resetTip')"
          :disabled="!Boolean(diffPreference)"
        >
          <PButton
            :disabled="!diffPreference"
            icon="lucide:rotate-cw"
            class="pohon:rounded-full"
            variant="ghost"
            color="neutral"
            @click="handleReset"
          />
        </PTooltip>
      </PChip>

      <PTooltip
        :text="appEnableStickyPreferencesNavigationBar
          ? $t('preferences.disableStickyPreferencesNavigationBar')
          : $t('preferences.enableStickyPreferencesNavigationBar')"
      >
        <PButton
          :icon="appEnableStickyPreferencesNavigationBar ? 'lucide:pin-off' : 'lucide:pin'"
          class="pohon:rounded-full"
          variant="ghost"
          color="neutral"
          @click="appEnableStickyPreferencesNavigationBar = !appEnableStickyPreferencesNavigationBar"
        />
      </PTooltip>
    </template>

    <PTabs
      :items="tabs"
      default-value="layout"
      size="sm"
      :unmount-on-hide="false"
      :ui="{
        list: appEnableStickyPreferencesNavigationBar ? '-top-3 sticky z-10' : '',
      }"
    >
      <template #layout>
        <PreferencesBlock :title="$t('preferences.layout')">
          <PreferencesLayout v-model="appLayout" />
        </PreferencesBlock>

        <PreferencesBlock :title="$t('preferences.content')">
          <PreferencesContent v-model="appContentCompact" />
        </PreferencesBlock>

        <PreferencesBlock :title="$t('preferences.sidebar.title')">
          <PreferencesSidebar
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
        </PreferencesBlock>

        <PreferencesBlock :title="$t('preferences.header.title')">
          <PreferencesHeader
            v-model:header-enable="headerEnable"
            v-model:header-menu-align="headerMenuAlign"
            v-model:header-mode="headerMode"
            :disabled="isFullContent"
          />
        </PreferencesBlock>

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
        <PreferencesBlock :title="$t('preferences.theme.title')">
          <PreferencesTheme
            v-model:theme-semi-dark-header="themeSemiDarkHeader"
            v-model:theme-semi-dark-sidebar="themeSemiDarkSidebar"
            v-model:theme-semi-dark-sidebar-sub="themeSemiDarkSidebarSub"
          />
        </PreferencesBlock>

        <PreferencesBlock :title="$t('preferences.theme.builtin.title')">
          <PreferencesBuiltinTheme
            v-model="themeBuiltinType"
            v-model:theme-brands="themeBrands"
            :is-dark="isDark"
          />
        </PreferencesBlock>
      </template>

      <template #shortcutKey>
        <PreferencesBlock :title="$t('preferences.shortcutKeys.global')">
          <PreferencesGlobalShortcutKeys
            v-model:shortcut-keys-enable="shortcutKeysEnable"
            v-model:shortcut-keys-global-search="shortcutKeysGlobalSearch"
            v-model:shortcut-keys-lock-screen="shortcutKeysGlobalLockScreen"
            v-model:shortcut-keys-logout="shortcutKeysGlobalLogout"
            v-model:shortcut-keys-escape="shortcutKeysGlobalEscape"
          />
        </PreferencesBlock>
      </template>

      <template #general>
        general
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
        @click="emits('clearPreferencesAndLogout')"
      >
        {{ $t('preferences.clearAndLogout') }}
      </PButton>
    </template>
  </DrawerPreferences>
</template>
