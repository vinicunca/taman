import { diff } from '@taman-core/shared/utils';
import { TAMAN_AUTH_PAGE_LAYOUT_TYPE, TAMAN_LAYOUT_TYPE, TAMAN_PREFERENCES_BUTTON_POSITION_TYPE, TAMAN_THEME_MODE_TYPE } from '@taman-core/typings';
import { computed } from 'vue';
import { preferencesManager } from './preferences';
import { isDarkTheme } from './update-css-variables';

function usePreferences() {
  const preferences = preferencesManager.getPreferences();
  const customPreferences = preferencesManager.getCustomPreferences();
  const initialPreferences = preferencesManager.getInitialPreferences();
  const initialCustomPreferences
    = preferencesManager.getInitialCustomPreferences();
  const preferencesExtension = computed(() =>
    preferencesManager.getPreferencesExtension(),
  );
  /**
   * Calculate the changes in the preferences
   */
  const diffPreference = computed(() => {
    return diff(initialPreferences, preferences);
  });

  const diffCustomPreference = computed(() => {
    return diff(initialCustomPreferences, customPreferences);
  });

  const appPreferences = computed(() => preferences.app);

  const shortcutKeysPreferences = computed(() => preferences.shortcutKeys);

  /**
   * Check if the theme is dark mode
   * @param  preferences - The current preference setting object, its theme value will be used to check if it is dark mode.
   * @returns If the theme is dark mode, returns true, otherwise returns false.
   */
  const isDark = computed(() => {
    return isDarkTheme(preferences.theme.mode);
  });

  const locale = computed(() => {
    return appPreferences.value.locale;
  });

  const isMobile = computed(() => {
    return appPreferences.value.isMobile;
  });

  const theme = computed(() => {
    return isDark.value ? TAMAN_THEME_MODE_TYPE.DARK : TAMAN_THEME_MODE_TYPE.LIGHT;
  });

  /**
   * Layout mode
   */
  const layout = computed(() =>
    isMobile.value ? TAMAN_LAYOUT_TYPE.SIDEBAR_NAV : appPreferences.value.layout,
  );

  /**
   * Whether to show the top bar
   */
  const isShowHeaderNav = computed(() => {
    return preferences.header.enable;
  });

  /**
   * Whether to display the content in full screen, without the side, bottom, top, and tab areas
   */
  const isFullContent = computed(
    () => appPreferences.value.layout === TAMAN_LAYOUT_TYPE.FULL_CONTENT,
  );

  /**
   * Whether to display the side navigation mode
   */
  const isSideNav = computed(
    () => appPreferences.value.layout === TAMAN_LAYOUT_TYPE.SIDEBAR_NAV,
  );

  /**
   * Whether to display the side mixed navigation mode
   */
  const isSideMixedNav = computed(
    () => appPreferences.value.layout === TAMAN_LAYOUT_TYPE.SIDEBAR_MIXED_NAV,
  );

  /**
   * Whether to display the header navigation mode
   */
  const isHeaderNav = computed(
    () => appPreferences.value.layout === TAMAN_LAYOUT_TYPE.HEADER_NAV,
  );

  /**
   * Whether to display the header mixed navigation mode
   */
  const isHeaderMixedNav = computed(
    () => appPreferences.value.layout === TAMAN_LAYOUT_TYPE.HEADER_MIXED_NAV,
  );

  /**
   * Whether to display the top header + side navigation mode
   */
  const isHeaderSidebarNav = computed(
    () => appPreferences.value.layout === TAMAN_LAYOUT_TYPE.HEADER_SIDEBAR_NAV,
  );

  /**
   * Whether to display the mixed navigation mode
   */
  const isMixedNav = computed(
    () => appPreferences.value.layout === TAMAN_LAYOUT_TYPE.MIXED_NAV,
  );

  /**
   * Whether to contain the side navigation mode
   */
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
   * Whether to enable keep-alive
   * Only enable when the tabs are visible and keep-alive is enabled
   */
  const keepAlive = computed(
    () => preferences.tabbar.enable && preferences.tabbar.keepAlive,
  );

  /**
   * Whether the login registration page layout is on the left
   */
  const authPanelLeft = computed(() => {
    return appPreferences.value.authPageLayout === TAMAN_AUTH_PAGE_LAYOUT_TYPE.PANEL_LEFT;
  });

  /**
   * Whether the login registration page layout is on the right
   */
  const authPanelRight = computed(() => {
    return appPreferences.value.authPageLayout === TAMAN_AUTH_PAGE_LAYOUT_TYPE.PANEL_RIGHT;
  });

  /**
   * Whether the login registration page layout is in the center
   */
  const authPanelCenter = computed(() => {
    return appPreferences.value.authPageLayout === TAMAN_AUTH_PAGE_LAYOUT_TYPE.PANEL_CENTER;
  });

  /**
   * Whether the content is already maximized
   * Exclude full-content mode
   */
  const contentIsMaximize = computed(() => {
    const headerIsHidden = preferences.header.hidden;
    const sidebarIsHidden = preferences.sidebar.hidden;
    return headerIsHidden && sidebarIsHidden && !isFullContent.value;
  });

  /**
   * Whether to enable the global search shortcut key
   */
  const globalSearchShortcutKey = computed(() => {
    const { enable, globalSearch } = shortcutKeysPreferences.value;
    return enable && globalSearch;
  });

  /**
   * Whether to enable the global logout shortcut key
   */
  const globalLogoutShortcutKey = computed(() => {
    const { enable, globalLogout } = shortcutKeysPreferences.value;
    return enable && globalLogout;
  });

  /**
   * Whether to enable the global escape shortcut key
   */
  const globalEscapeShortcutKey = computed(() => {
    const { enable, globalEscape } = shortcutKeysPreferences.value;
    return enable && globalEscape;
  });

  const globalLockScreenShortcutKey = computed(() => {
    const { enable, globalLockScreen } = shortcutKeysPreferences.value;
    return enable && globalLockScreen;
  });

  /**
   * The position of the preferences button
   */
  const preferencesButtonPosition = computed(() => {
    const { enablePreferences, preferencesButtonPosition } = preferences.app;
    // If the preferences button is not enabled
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

    const isHeaderPosition = preferencesButtonPosition === TAMAN_PREFERENCES_BUTTON_POSITION_TYPE.HEADER;
    const isUserDropdownPosition = preferencesButtonPosition === TAMAN_PREFERENCES_BUTTON_POSITION_TYPE.USER_DROPDOWN;

    // If the fixed position is set
    if (preferencesButtonPosition !== TAMAN_PREFERENCES_BUTTON_POSITION_TYPE.AUTO) {
      return {
        fixed: preferencesButtonPosition === TAMAN_PREFERENCES_BUTTON_POSITION_TYPE.FIXED,
        header: isHeaderPosition,
        userDropdown: isUserDropdownPosition,
      };
    }

    // If it is full screen mode or not fixed at the top,
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
    globalLockScreenShortcutKey,
    globalLogoutShortcutKey,
    globalEscapeShortcutKey,
    globalSearchShortcutKey,
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
