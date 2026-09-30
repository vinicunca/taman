import type { ComputedRef } from 'vue';
import type { RouteLocationNormalized } from 'vue-router';

import { useTabbarStore } from '@taman/stores';
import { useRoute, useRouter } from 'vue-router';

export function useTabs() {
  const router = useRouter();
  const route = useRoute();
  const tabbarStore = useTabbarStore();

  async function closeLeftTabs(tab?: RouteLocationNormalized) {
    await tabbarStore.closeLeftTabs(tab || route);
  }

  async function closeAllTabs() {
    await tabbarStore.closeAllTabs(router);
  }

  async function closeRightTabs(tab?: RouteLocationNormalized) {
    await tabbarStore.closeRightTabs(tab || route);
  }

  async function closeOtherTabs(tab?: RouteLocationNormalized) {
    await tabbarStore.closeOtherTabs(tab || route);
  }

  async function closeCurrentTab(tab?: RouteLocationNormalized) {
    await tabbarStore.closeTab(tab || route, router);
  }

  async function pinTab(tab?: RouteLocationNormalized) {
    await tabbarStore.pinTab(tab || route);
  }

  async function unpinTab(tab?: RouteLocationNormalized) {
    await tabbarStore.unpinTab(tab || route);
  }

  async function toggleTabPin(tab?: RouteLocationNormalized) {
    await tabbarStore.toggleTabPin(tab || route);
  }

  async function refreshTab(name?: string) {
    await tabbarStore.refresh(name || router);
  }

  async function openTabInNewWindow(tab?: RouteLocationNormalized) {
    await tabbarStore.openTabInNewWindow(tab || route, router);
  }

  async function closeTabByKey(key: string) {
    await tabbarStore.closeTabByKey(key, router);
  }

  /**
   * Set the title of the current tab.
   *
   * @description Supports static title strings or dynamically computed titles.
   * @description Dynamic titles are recomputed on each render; useful for i18n or state-dependent titles.
   *
   * @param title - Title content
   *   - Static title: pass a string directly
   *   - Dynamic title: pass a ComputedRef
   *
   * @example
   * // Static title
   * setTabTitle('Tab Title')
   *
   * // Dynamic title (i18n)
   * setTabTitle(computed(() => t('page.title')))
   */
  async function setTabTitle(title: ComputedRef<string> | string) {
    tabbarStore.setUpdateTime();
    await tabbarStore.setTabTitle(route, title);
  }

  async function resetTabTitle() {
    tabbarStore.setUpdateTime();
    await tabbarStore.resetTabTitle(route);
  }

  /**
   * Get whether tab actions are disabled.
   * @param tab
   */
  function getTabDisableState(tab: RouteLocationNormalized = route) {
    const tabs = tabbarStore.getTabs;
    const affixTabs = tabbarStore.affixTabs;
    const index = tabs.findIndex((item) => item.path === tab.path);

    const disabled = tabs.length <= 1;

    const { meta } = tab;
    const affixTab = meta?.affixTab ?? false;
    const isCurrentTab = route.path === tab.path;

    // Leftmost tab, or no closable tabs to the left of affix tabs
    const disabledCloseLeft
      = index === 0 || index - affixTabs.length <= 0 || !isCurrentTab;

    const disabledCloseRight = !isCurrentTab || index === tabs.length - 1;

    const disabledCloseOther
      = disabled || !isCurrentTab || tabs.length - affixTabs.length <= 1;
    return {
      disabledCloseAll: disabled,
      disabledCloseCurrent: !!affixTab || disabled,
      disabledCloseLeft,
      disabledCloseOther,
      disabledCloseRight,
      disabledRefresh: !isCurrentTab,
    };
  }

  return {
    closeAllTabs,
    closeCurrentTab,
    closeLeftTabs,
    closeOtherTabs,
    closeRightTabs,
    closeTabByKey,
    getTabDisableState,
    openTabInNewWindow,
    pinTab,
    refreshTab,
    resetTabTitle,
    setTabTitle,
    toggleTabPin,
    unpinTab,
  };
}
