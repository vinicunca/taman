<script lang="ts" setup>
import type { TamanMenuRecordRaw } from '@taman/types';
import type { SetupContext } from 'vue';
import type { RouteLocationNormalizedLoaded } from 'vue-router';
import { TamanCoreLayout } from '@taman-core/layout-ui';
import { ELEMENT_ID_LAYOUT_SCROLL } from '@taman-core/shared/constants';
import { TamanBackToTop, TamanLogo } from '@taman-core/taman-ui';
import { useRefresh } from '@taman/composables';
import { $t, i18n } from '@taman/locales';
import {
  preferences,
  updatePreferences,
  usePreferences,
} from '@taman/preferences';
import {
  useAccessStore,
  useTabbarStore,
} from '@taman/stores';
import { clone, mapTree } from '@taman/utils';
import { computed, onMounted, useSlots, watch } from 'vue';
import { useRoute } from 'vue-router';
import {
  LayoutWidgetBreadcrumb,
  LayoutWidgetCheckUpdates,
  LayoutWidgetPreferences,
} from '../widgets';
import { LayoutCoreContent, LayoutCoreContentSpinner } from './content';
import LayoutCoreCopyright from './layout-core-copyright.vue';
import LayoutCoreFooter from './layout-core-footer.vue';
import LayoutCoreHeader from './layout-core-header.vue';
import {
  LayoutCoreMenu,
  LayoutCoreMenuExtra,
  LayoutCoreMenuMixed,
  useMenuExtra,
  useMenuMixed,
} from './menu';
import { LayoutCoreTabbar } from './tabbar';
import { useLayoutScroll } from './use-layout-scroll';

defineOptions({
  name: 'LayoutCore',
});

const props = withDefaults(
  defineProps<{
    /** Custom logo image URL; if not provided, the default value from preferences will be used. */
    logoSrc?: string;
    /** Custom dark theme logo image URL; if not provided, the default value from preferences will be used. */
    logoSrcDark?: string;
    /** Custom logo text; if not provided, the default value from preferences will be used. */
    logoText?: string;
    /** User avatar image URL; if not provided, the default value from preferences will be used. */
    avatar?: string;
    /** User text (e.g. username); if not provided, the default value from preferences will be used. */
    text?: string;
  }>(),
  {
    logoSrc: '',
    logoSrcDark: '',
    logoText: '',
    avatar: '',
    text: '',
  },
);

const emits = defineEmits<{
  clearPreferencesAndLogout: [];
  logout: [];
  clickLogo: [];
}>();

/** Final used logo image URL; if not provided, the default value from preferences will be used. */
const finalLogoSrc = computed(() => props.logoSrc || preferences.logo.source);
/** Final used dark theme logo image URL; if not provided, the default value from preferences will be used. */
const finalLogoSrcDark = computed(
  () => props.logoSrcDark || preferences.logo.sourceDark,
);
/** Final used logo text; if not provided, the default value from preferences will be used. */
const finalLogoText = computed(() => props.logoText || preferences.app.name);

const {
  isDark,
  isHeaderNav,
  isMixedNav,
  isMobile,
  isSideMode,
  isSideMixedNav,
  isHeaderMixedNav,
  isHeaderSidebarNav,
  layout,
  preferencesButtonPosition,
  sidebarCollapsed,
  theme,
} = usePreferences();
const accessStore = useAccessStore();
const { refresh } = useRefresh();
const layoutScrollTarget = `#${ELEMENT_ID_LAYOUT_SCROLL}`;

useLayoutScroll();

const sidebarTheme = computed(() => {
  const dark = isDark.value || preferences.theme.semiDarkSidebar;
  return dark ? 'dark' : 'light';
});

const sidebarThemeSub = computed(() => {
  const dark = isDark.value || preferences.theme.semiDarkSidebarSub;
  return dark ? 'dark' : 'light';
});

const headerTheme = computed(() => {
  const dark = isDark.value || preferences.theme.semiDarkHeader;
  return dark ? 'dark' : 'light';
});

const logoClass = computed(() => {
  const { collapsedShowTitle } = preferences.sidebar;
  const classes: Array<string> = [];

  if (collapsedShowTitle && sidebarCollapsed.value && !isMixedNav.value) {
    classes.push('mx-auto');
  }

  if (isSideMixedNav.value) {
    classes.push('flex-center');
  }

  return classes.join(' ');
});

const isMenuRounded = computed(() => {
  return preferences.navigation.styleType === 'rounded';
});

const logoCollapsed = computed(() => {
  if (isMobile.value && sidebarCollapsed.value) {
    return true;
  }
  if (isHeaderNav.value || isMixedNav.value || isHeaderSidebarNav.value) {
    return false;
  }
  return (
    sidebarCollapsed.value || isSideMixedNav.value || isHeaderMixedNav.value
  );
});

const showHeaderNav = computed(() => {
  return (
    !isMobile.value
    && (isHeaderNav.value || isMixedNav.value || isHeaderMixedNav.value)
  );
});

const logoTheme = computed(() => {
  const showLogoInHeader
    = !isSideMode.value
      || isHeaderSidebarNav.value
      || isMixedNav.value
      || isMobile.value;
  return showLogoInHeader ? headerTheme.value : sidebarTheme.value;
});

/**
 * The height of the extra-title slot of the layout-sidebar extension area
 */
const sidebarExtraTitleHeight = computed<number | undefined>(() => {
  const showSideExtraTitle
    = preferences.logo.enable && preferences.logo.showText;
  return showSideExtraTitle ? undefined : 0;
});

const {
  handleMenuSelect,
  handleMenuOpen,
  headerActive,
  headerMenus,
  sidebarActive,
  sidebarMenus,
  mixHeaderMenus,
  sidebarVisible,
} = useMenuMixed();

// Sidebar multi-column menus
const {
  extraActiveMenu,
  extraMenus,
  handleDefaultSelect,
  handleMenuMouseEnter,
  handleMixedMenuSelect,
  handleSideMouseLeave,
  sidebarExtraVisible,
} = useMenuExtra(mixHeaderMenus);

/**
 * Wraps menus and translates menu names
 * @param menus Raw menu data
 * @param deep Whether to wrap deeply. For dual-column layout, only the first level is wrapped; deeper levels are wrapped again in the extra menu
 */
function wrapperMenus(menus: Array<TamanMenuRecordRaw>, deep: boolean = true) {
  return deep
    ? mapTree(menus, (item) => {
        return { ...clone(item), name: $t(item.name) };
      })
    : menus.map((item) => {
        return { ...clone(item), name: $t(item.name) };
      });
}

function toggleSidebar() {
  updatePreferences({
    sidebar: {
      hidden: !preferences.sidebar.hidden,
    },
  });
}

function clearPreferencesAndLogout() {
  emits('clearPreferencesAndLogout');
}

function handleLogout() {
  emits('logout');
}

function handleClickLogo() {
  emits('clickLogo');
}

function autoCollapseMenuByRouteMeta(route: RouteLocationNormalizedLoaded) {
  // Only applies in dual-column layout modes
  if (
    ['header-mixed-nav', 'sidebar-mixed-nav'].includes(
      preferences.app.layout,
    )
    && route.meta
    && route.meta.hideInMenu
  ) {
    sidebarExtraVisible.value = false;
  }
}

const route = useRoute();

onMounted(() => {
  autoCollapseMenuByRouteMeta(route);
});

watch(
  () => preferences.app.layout,
  async (val) => {
    if (val === 'sidebar-mixed-nav' && preferences.sidebar.hidden) {
      updatePreferences({
        sidebar: {
          hidden: false,
        },
      });
    }
  },
);

const tabbarStore = useTabbarStore();

function refreshAll() {
  tabbarStore.cachedTabs.clear();
  refresh();
}

// Refresh the page after locale changes
// i18n.global.locale updates after preference.app.locale, so watching preference.app.locale is unsuitable; a refresh may run before locale messages finish loading
watch(i18n.global.locale, refreshAll, { flush: 'post' });

// Refresh the page after timezone changes
watch(
  () => preferences.app.timezone,
  refreshAll,
  { flush: 'post' },
);

const slots: SetupContext['slots'] = useSlots();
const headerSlots = computed(() => {
  return Object.keys(slots).filter((key) => key.startsWith('header-'));
});
</script>

<template>
  <TamanCoreLayout
    v-model:sidebar-extra-visible="sidebarExtraVisible"
    :content-compact="preferences.app.contentCompact"
    :content-compact-width="preferences.app.contentCompactWidth"
    :content-padding="preferences.app.contentPadding"
    :content-padding-bottom="preferences.app.contentPaddingBottom"
    :content-padding-left="preferences.app.contentPaddingLeft"
    :content-padding-right="preferences.app.contentPaddingRight"
    :content-padding-top="preferences.app.contentPaddingTop"
    :footer-enable="preferences.footer.enable"
    :footer-fixed="preferences.footer.fixed"
    :footer-height="preferences.footer.height"
    :header-height="preferences.header.height"
    :header-hidden="preferences.header.hidden"
    :header-mode="preferences.header.mode"
    :header-theme="headerTheme"
    :header-toggle-sidebar-button="preferences.widget.sidebarToggle"
    :header-visible="preferences.header.enable"
    :is-mobile="preferences.app.isMobile"
    :layout="layout"
    :sidebar-draggable="preferences.sidebar.draggable"
    :sidebar-collapse="preferences.sidebar.collapsed"
    :sidebar-collapse-show-title="preferences.sidebar.collapsedShowTitle"
    :sidebar-enable="sidebarVisible"
    :sidebar-collapsed-button="preferences.sidebar.collapsedButton"
    :sidebar-fixed-button="preferences.sidebar.fixedButton"
    :sidebar-expand-on-hover="preferences.sidebar.expandOnHover"
    :sidebar-extra-collapse="preferences.sidebar.extraCollapse"
    :sidebar-extra-collapsed-width="preferences.sidebar.extraCollapsedWidth"
    :sidebar-extra-title-height="sidebarExtraTitleHeight"
    :sidebar-hidden="preferences.sidebar.hidden"
    :sidebar-mixed-width="preferences.sidebar.mixedWidth"
    :sidebar-theme="sidebarTheme"
    :sidebar-theme-sub="sidebarThemeSub"
    :sidebar-width="preferences.sidebar.width"
    :side-collapse-width="preferences.sidebar.collapseWidth"
    :sidebar-logo-visible="preferences.logo.enable"
    :tabbar-enable="preferences.tabbar.enable"
    :tabbar-height="preferences.tabbar.height"
    :z-index="preferences.app.zIndex"
    @side-mouse-leave="handleSideMouseLeave"
    @toggle-sidebar="toggleSidebar"
    @update:sidebar-collapse="(value: boolean) => updatePreferences({ sidebar: { collapsed: value } })"
    @update:sidebar-enable="(value: boolean) => updatePreferences({ sidebar: { enable: value } })"
    @update:sidebar-expand-on-hover="(value: boolean) => updatePreferences({ sidebar: { expandOnHover: value } })"
    @update:sidebar-extra-collapse="(value: boolean) => updatePreferences({ sidebar: { extraCollapse: value } })"
    @update:sidebar-width="(value: number) => updatePreferences({ sidebar: { width: value } })"
  >
    <!-- logo -->
    <template #logo>
      <TamanLogo
        v-if="preferences.logo.enable"
        :class="logoClass"
        :collapsed="logoCollapsed"
        :src="finalLogoSrc"
        :src-dark="finalLogoSrcDark"
        :text="finalLogoText"
        :show-text="preferences.logo.showText"
        :logo-mode="preferences.logo.logoMode"
        :full-logo-height="preferences.logo.fullLogoHeight"
        :theme="logoTheme"
        @click="handleClickLogo"
      >
        <template
          v-if="$slots['logo-text']"
          #text
        >
          <slot name="logo-text" />
        </template>
      </TamanLogo>
    </template>

    <!-- Header -->
    <template #header>
      <LayoutCoreHeader
        :avatar="avatar"
        :theme="theme"
        :text="text"
        @clear-preferences-and-logout="clearPreferencesAndLogout"
        @logout="handleLogout"
      >
        <template
          v-if="!showHeaderNav && preferences.breadcrumb.enable"
          #breadcrumb
        >
          <LayoutWidgetBreadcrumb
            :hide-when-only-one="preferences.breadcrumb.hideOnlyOne"
            :show-home="preferences.breadcrumb.showHome"
            :show-icon="preferences.breadcrumb.showIcon"
          />
        </template>

        <template
          v-if="showHeaderNav"
          #menu
        >
          <LayoutCoreMenu
            :default-active="headerActive"
            :menus="wrapperMenus(headerMenus)"
            :rounded="isMenuRounded"
            :theme="headerTheme"
            class="w-full"
            mode="horizontal"
            @select="handleMenuSelect"
          />
        </template>

        <template #user-dropdown>
          <slot name="user-dropdown" />
        </template>

        <template #notification>
          <slot name="notification" />
        </template>

        <template
          v-for="item in headerSlots"
          #[item]
        >
          <slot :name="item" />
        </template>
      </LayoutCoreHeader>
    </template>

    <!-- Sidebar menu -->
    <template #menu>
      <LayoutCoreMenu
        :accordion="preferences.navigation.accordion"
        :collapse="preferences.sidebar.collapsed"
        :collapse-show-title="preferences.sidebar.collapsedShowTitle"
        :default-active="sidebarActive"
        :menus="wrapperMenus(sidebarMenus)"
        :rounded="isMenuRounded"
        :theme="sidebarTheme"
        mode="vertical"
        @open="handleMenuOpen"
        @select="handleMenuSelect"
      />
    </template>

    <template #mixed-menu>
      <LayoutCoreMenuMixed
        :active-path="extraActiveMenu"
        :menus="wrapperMenus(mixHeaderMenus, false)"
        :rounded="isMenuRounded"
        :theme="sidebarTheme"
        @default-select="handleDefaultSelect"
        @enter="handleMenuMouseEnter"
        @select="handleMixedMenuSelect"
      />
    </template>

    <!-- Sidebar extra panel -->
    <template #side-extra>
      <LayoutCoreMenuExtra
        :accordion="preferences.navigation.accordion"
        :collapse="preferences.sidebar.extraCollapse"
        :menus="wrapperMenus(extraMenus)"
        :rounded="isMenuRounded"
        :theme="sidebarThemeSub"
      />
    </template>

    <template #side-extra-title>
      <TamanLogo
        v-if="preferences.logo.enable"
        :text="preferences.app.name"
        :show-text="preferences.logo.showText"
        :theme="sidebarThemeSub"
      >
        <template
          v-if="$slots['logo-text']"
          #text
        >
          <slot name="logo-text" />
        </template>
      </TamanLogo>
    </template>

    <template #tabbar>
      <LayoutCoreTabbar
        v-if="preferences.tabbar.enable"
        :show-icon="preferences.tabbar.showIcon"
        :theme="theme"
      />
    </template>

    <!-- Main content -->
    <template #content>
      <LayoutCoreContent />
    </template>

    <template
      v-if="preferences.transition.loading"
      #content-overlay
    >
      <LayoutCoreContentSpinner />
    </template>

    <!-- Footer -->
    <template
      v-if="preferences.footer.enable"
      #footer
    >
      <LayoutCoreFooter>
        <LayoutCoreCopyright
          v-if="preferences.copyright.enable"
          v-bind="preferences.copyright"
        />
      </LayoutCoreFooter>
    </template>

    <template #extra>
      <slot name="extra" />

      <LayoutWidgetCheckUpdates
        v-if="preferences.app.enableCheckUpdates"
        :check-updates-interval="preferences.app.checkUpdatesInterval"
      />

      <Transition
        v-if="preferences.widget.lockScreen"
        name="slide-up"
      >
        <slot
          v-if="accessStore.isLockScreen"
          name="lock-screen"
        />
      </Transition>

      <LayoutWidgetPreferences
        v-if="preferencesButtonPosition.fixed"
        is-fixed
        @clear-preferences-and-logout="clearPreferencesAndLogout"
      />

      <TamanBackToTop :target="layoutScrollTarget" />
    </template>
  </TamanCoreLayout>
</template>
