import { diff } from '@taman-core/shared/utils';
import { useColorMode } from '@vueuse/core';
import { computed } from 'vue';
import { preferencesManager } from './preferences';

function usePreferences() {
  const preferences = preferencesManager.getPreferences();
  const customPreferences = preferencesManager.getCustomPreferences();
  const initialPreferences = preferencesManager.getInitialPreferences();
  const initialCustomPreferences
    = preferencesManager.getInitialCustomPreferences();
  const preferencesExtension = computed(() =>
    preferencesManager.getPreferencesExtension(),
  );
  /** Computes preference changes from the initial snapshot. */
  const diffPreference = computed(() => {
    return diff(initialPreferences, preferences);
  });

  const diffCustomPreference = computed(() => {
    return diff(initialCustomPreferences, customPreferences);
  });

  const appPreferences = computed(() => preferences.app);

  const shortcutKeysPreferences = computed(() => preferences.shortcutKeys);

  const colorMode = useColorMode({
    storageKey: preferencesManager.getFullKey('theme'),
  });

  /**
   * Whether dark mode is active based on the current theme mode.
   */
  const isDark = computed(() => {
    return colorMode.value === 'dark';
  });

  const locale = computed(() => {
    return appPreferences.value.locale;
  });

  const isMobile = computed(() => {
    return appPreferences.value.isMobile;
  });

  const theme = computed(() => {
    return isDark.value ? 'dark' : 'light';
  });

  /** Effective layout (sidebar on mobile). */
  const layout = computed(() =>
    isMobile.value ? 'sidebar-nav' : appPreferences.value.layout,
  );

  /** Whether the header navigation is shown. */
  const isShowHeaderNav = computed(() => {
    return preferences.header.enable;
  });

  /**
   * Whether content is full-screen (no sidebar, footer, header, or tabs).
   */
  const isFullContent = computed(
    () => appPreferences.value.layout === 'full-content',
  );

  /** Whether layout is sidebar navigation. */
  const isSideNav = computed(
    () => appPreferences.value.layout === 'sidebar-nav',
  );

  /** Whether layout is sidebar mixed navigation. */
  const isSideMixedNav = computed(
    () => appPreferences.value.layout === 'sidebar-mixed-nav',
  );

  /** Whether layout is header navigation. */
  const isHeaderNav = computed(
    () => appPreferences.value.layout === 'header-nav',
  );

  /** Whether layout is header mixed navigation. */
  const isHeaderMixedNav = computed(
    () => appPreferences.value.layout === 'header-mixed-nav',
  );

  /** Whether layout is header + sidebar navigation. */
  const isHeaderSidebarNav = computed(
    () => appPreferences.value.layout === 'header-sidebar-nav',
  );

  /** Whether layout is mixed navigation. */
  const isMixedNav = computed(
    () => appPreferences.value.layout === 'mixed-nav',
  );

  /** Whether layout includes a sidebar. */
  const isSideMode = computed(() => {
    return (
      isMixedNav.value
      || isSideMixedNav.value
      || isSideNav.value
      || isHeaderMixedNav.value
      || isHeaderSidebarNav.value
    );
  });

  const sidebarCollapsed = computed(() => {
    return preferences.sidebar.collapsed;
  });

  /**
   * Whether keep-alive is enabled (requires tabs and keepAlive).
   */
  const keepAlive = computed(
    () => preferences.tabbar.enable && preferences.tabbar.keepAlive,
  );

  /** Whether auth page layout is panel-left. */
  const authPanelLeft = computed(() => {
    return appPreferences.value.authPageLayout === 'panel-left';
  });

  /** Whether auth page layout is panel-right. */
  const authPanelRight = computed(() => {
    return appPreferences.value.authPageLayout === 'panel-right';
  });

  /** Whether auth page layout is panel-center. */
  const authPanelCenter = computed(() => {
    return appPreferences.value.authPageLayout === 'panel-center';
  });

  /**
   * Whether content is maximized (header and sidebar hidden).
   * Excludes full-content layout.
   */
  const contentIsMaximize = computed(() => {
    const headerIsHidden = preferences.header.hidden;
    const sidebarIsHidden = preferences.sidebar.hidden;
    return headerIsHidden && sidebarIsHidden && !isFullContent.value;
  });

  /** Whether global search shortcut is enabled. */
  const globalSearchShortcutKey = computed(() => {
    const { enable, globalSearch } = shortcutKeysPreferences.value;
    return enable && globalSearch;
  });

  /** Whether global logout shortcut is enabled. */
  const globalLogoutShortcutKey = computed(() => {
    const { enable, globalLogout } = shortcutKeysPreferences.value;
    return enable && globalLogout;
  });

  /** Whether global escape shortcut is enabled. */
  const globalEscapeShortcutKey = computed(() => {
    const { enable, globalEscape } = shortcutKeysPreferences.value;
    return enable && globalEscape;
  });

  const globalLockScreenShortcutKey = computed(() => {
    const { enable, globalLockScreen } = shortcutKeysPreferences.value;
    return enable && globalLockScreen;
  });

  /** Resolved preferences button placement. */
  const preferencesButtonPosition = computed(() => {
    const { enablePreferences, preferencesButtonPosition } = preferences.app;
    // Preferences button disabled
    if (!enablePreferences) {
      return {
        fixed: false,
        header: false,
        userDropdown: false,
      };
    }

    const { header, sidebar } = preferences;
    const headerHidden = header.hidden;
    const sidebarHidden = sidebar.hidden;

    const contentIsMaximize = headerHidden && sidebarHidden;

    const isHeaderPosition = preferencesButtonPosition === 'header';
    const isUserDropdownPosition
      = preferencesButtonPosition === 'user-dropdown';

    // Explicit fixed position
    if (preferencesButtonPosition !== 'auto') {
      return {
        fixed: preferencesButtonPosition === 'fixed',
        header: isHeaderPosition,
        userDropdown: isUserDropdownPosition,
      };
    }

    // Full-screen, mobile, or header hidden — pin to fixed
    const fixed
      = contentIsMaximize
        || isFullContent.value
        || isMobile.value
        || !isShowHeaderNav.value;

    return {
      fixed,
      header: !fixed,
      userDropdown: !fixed && isUserDropdownPosition,
    };
  });

  return {
    authPanelCenter,
    authPanelLeft,
    authPanelRight,
    contentIsMaximize,
    customPreferences,
    diffPreference,
    diffCustomPreference,
    globalEscapeShortcutKey,
    globalLockScreenShortcutKey,
    globalLogoutShortcutKey,
    globalSearchShortcutKey,
    colorMode,
    isDark,
    isFullContent,
    isHeaderMixedNav,
    isHeaderNav,
    isHeaderSidebarNav,
    isMixedNav,
    isMobile,
    isSideMixedNav,
    isSideMode,
    isSideNav,
    keepAlive,
    layout,
    locale,
    preferencesExtension,
    preferencesButtonPosition,
    sidebarCollapsed,
    theme,
    app: appPreferences.value,
  };
}

export { usePreferences };
