import type { TamanTabDefinition } from '@taman-core/typings';
import type { ComputedRef, VNode } from 'vue';
import type {
  RouteLocationNormalized,
  RouteLocationNormalizedLoaded,
  RouteLocationNormalizedLoadedGeneric,
  Router,
  RouteRecordNormalized,
} from 'vue-router';

import { preferences } from '@taman-core/preferences';
import {
  createStack,
  openWindow,
  Stack,
  startProgress,
  stopProgress,
} from '@taman-core/shared/utils';
import { acceptHMRUpdate, defineStore } from 'pinia';
import { markRaw, toRaw } from 'vue';

interface RouteCached {
  component: VNode;
  key: string;
  route: RouteLocationNormalizedLoadedGeneric;
}

interface TabbarState {
  cachedRoutes: Map<string, RouteCached>;
  /**
   * Cache of currently open tab keys.
   */
  cachedTabs: Set<string>;
  /**
   * Index after drag-and-drop reorder.
   */
  dragEndIndex: number;
  /**
   * Tabs excluded from keep-alive cache.
   */
  excludeCachedTabs: Set<string>;
  /**
   * Tab context menu item keys.
   */
  menuList: Array<string>;
  /**
   * Whether the route view should render (used during refresh).
   */
  renderRouteView?: boolean;
  /**
   * Currently open tabs.
   */
  tabs: Array<TamanTabDefinition>;
  /**
   * Last update timestamp for lightweight change detection (avoids deep watch cost).
   */
  updateTime?: number;
  /**
   * Visit history stack (previous tab keys).
   */
  visitHistory: Stack<string>;
}

/**
 * Maximum number of entries in visit history.
 */
const MAX_VISIT_HISTORY = 50;

/**
 * Tab bar store.
 */
export const useTabbarStore = defineStore('core-tabbar', {
  actions: {
    /**
     * Close tabs in bulk.
     */
    async _bulkCloseByKeys(keys: Array<string>) {
      const keySet = new Set(keys);
      this.tabs = this.tabs.filter(
        (item) => !keySet.has(getTabKeyFromTab(item)),
      );
      if (isVisitHistory()) {
        this.visitHistory.remove(...keys);
      }

      await this.updateCacheTabs();
    },
    /**
     * Close a tab (internal, no navigation).
     * @param tab
     */
    _close(tab: TamanTabDefinition) {
      if (isAffixTab(tab)) {
        return;
      }
      const index = this.tabs.findIndex((item) => equalTab(item, tab));
      index !== -1 && this.tabs.splice(index, 1);
    },
    /**
     * Navigate to the default tab.
     */
    async _goToDefaultTab(router: Router) {
      if (this.getTabs.length <= 0) {
        return;
      }
      const firstTab = this.getTabs[0];
      if (firstTab) {
        await this._goToTab(firstTab, router);
      }
    },
    /**
     * Navigate to a tab.
     * @param tab
     * @param router
     */
    async _goToTab(tab: TamanTabDefinition, router: Router) {
      const { params, path, query } = tab;
      const toParams = {
        params: params || {},
        path,
        query: query || {},
      };
      await router.replace(toParams);
    },
    /**
     * Add a tab.
     * @param routeTab
     */
    addTab(routeTab: TamanTabDefinition): TamanTabDefinition {
      let tab = cloneTab(routeTab);
      if (!tab.key) {
        tab.key = getTabKey(routeTab);
      }
      if (!isTabShown(tab)) {
        return tab;
      }

      const tabIndex = this.tabs.findIndex((item) => {
        return equalTab(item, tab);
      });

      if (tabIndex === -1) {
        const maxCount = preferences.tabbar.maxCount;
        // maxNumOfOpenTab > 0 means limit how many tabs of this route can be open
        const maxNumOfOpenTab = (routeTab?.meta?.maxNumOfOpenTab
          ?? -1) as number;
        // Enforce per-route open limit when configured
        if (
          maxNumOfOpenTab > 0
          && this.tabs.filter((tab) => tab.name === routeTab.name).length
          >= maxNumOfOpenTab
        ) {
          // Close the oldest tab for this route
          const index = this.tabs.findIndex(
            (item) => item.name === routeTab.name,
          );
          index !== -1 && this.tabs.splice(index, 1);
        } else if (maxCount > 0 && this.tabs.length >= maxCount) {
          // Close the first non-pinned tab
          const index = this.tabs.findIndex(
            (item) =>
              !Reflect.has(item.meta, 'affixTab') || !item.meta.affixTab,
          );
          index !== -1 && this.tabs.splice(index, 1);
        }
        this.tabs.push(tab);
      } else {
        // Tab already exists: update params instead of adding a duplicate
        const currentTab = toRaw(this.tabs)[tabIndex];
        const mergedTab = {
          ...currentTab,
          ...tab,
          meta: { ...currentTab?.meta, ...tab.meta },
        };
        if (currentTab) {
          const curMeta = currentTab.meta;
          if (Reflect.has(curMeta, 'affixTab')) {
            mergedTab.meta.affixTab = curMeta.affixTab;
          }
          if (Reflect.has(curMeta, 'newTabTitle')) {
            mergedTab.meta.newTabTitle = curMeta.newTabTitle;
          }
        }
        tab = mergedTab;
        this.tabs.splice(tabIndex, 1, mergedTab);
      }
      this.updateCacheTabs();
      // Record visit history
      if (isVisitHistory()) {
        this.visitHistory.push(tab.key as string);
      }
      return tab;
    },
    /**
     * Close all tabs (keeps pinned tabs when present).
     */
    async closeAllTabs(router: Router) {
      const newTabs = this.tabs.filter((tab) => isAffixTab(tab));
      this.tabs = newTabs.length > 0 ? newTabs : [...this.tabs].splice(0, 1);
      // Trim visit history to remaining tabs
      if (isVisitHistory()) {
        this.visitHistory.retain(
          this.tabs.map((item) => getTabKeyFromTab(item)),
        );
      }
      await this._goToDefaultTab(router);
      this.updateCacheTabs();
    },
    /**
     * Close tabs to the left of the given tab.
     * @param tab
     */
    async closeLeftTabs(tab: TamanTabDefinition) {
      const index = this.tabs.findIndex((item) => equalTab(item, tab));

      if (index < 1) {
        return;
      }

      const leftTabs = this.tabs.slice(0, index);
      const keys: Array<string> = [];

      for (const item of leftTabs) {
        if (!isAffixTab(item)) {
          keys.push(item.key as string);
        }
      }
      await this._bulkCloseByKeys(keys);
    },
    /**
     * Close all tabs except the given tab (and pinned tabs).
     * @param tab
     */
    async closeOtherTabs(tab: TamanTabDefinition) {
      const closeKeys = this.tabs.map((item) => getTabKeyFromTab(item));

      const keys: Array<string> = [];

      for (const key of closeKeys) {
        if (key !== getTabKeyFromTab(tab)) {
          const closeTab = this.tabs.find(
            (item) => getTabKeyFromTab(item) === key,
          );
          if (!closeTab) {
            continue;
          }
          if (!isAffixTab(closeTab)) {
            keys.push(closeTab.key as string);
          }
        }
      }
      await this._bulkCloseByKeys(keys);
    },
    /**
     * Close tabs to the right of the given tab.
     * @param tab
     */
    async closeRightTabs(tab: TamanTabDefinition) {
      const index = this.tabs.findIndex((item) => equalTab(item, tab));

      if (index !== -1 && index < this.tabs.length - 1) {
        const rightTabs = this.tabs.slice(index + 1);

        const keys: Array<string> = [];
        for (const item of rightTabs) {
          if (!isAffixTab(item)) {
            keys.push(item.key as string);
          }
        }
        await this._bulkCloseByKeys(keys);
      }
    },

    /**
     * Close a tab and navigate if it is active.
     * @param tab
     * @param router
     */
    async closeTab(tab: TamanTabDefinition, router: Router) {
      const { currentRoute } = router;
      const currentTabKey = getTabKey(currentRoute.value);
      // Closing a non-active tab
      if (currentTabKey !== getTabKeyFromTab(tab)) {
        this._close(tab);
        this.updateCacheTabs();
        // Remove from visit history
        if (isVisitHistory()) {
          this.visitHistory.remove(getTabKeyFromTab(tab));
        }
        return;
      }
      if (this.getTabs.length <= 1) {
        console.error('Failed to close the tab; only one tab remains open.');
        return;
      }
      // Remove closed tab from visit history and navigate to previous visit
      if (isVisitHistory()) {
        this.visitHistory.remove(currentTabKey);
        this._close(tab);

        let previousTab: TamanTabDefinition | undefined;
        let previousTabKey: string | undefined;
        while (true) {
          previousTabKey = this.visitHistory.pop();
          if (!previousTabKey) {
            break;
          }
          previousTab = this.getTabByKey(previousTabKey);
          if (previousTab) {
            break;
          }
        }
        await (previousTab
          ? this._goToTab(previousTab, router)
          : this._goToDefaultTab(router));
        return;
      }
      // Without visit history: go to adjacent tab
      const index = this.getTabs.findIndex(
        (item) => getTabKeyFromTab(item) === getTabKey(currentRoute.value),
      );

      const before = this.getTabs[index - 1];
      const after = this.getTabs[index + 1];

      // Prefer next tab, then previous
      if (after) {
        this._close(tab);
        await this._goToTab(after, router);
      } else if (before) {
        this._close(tab);
        await this._goToTab(before, router);
      }
    },

    /**
     * Close a tab by key.
     * @param key
     * @param router
     */
    async closeTabByKey(key: string, router: Router) {
      const originKey = decodeURIComponent(key);
      const index = this.tabs.findIndex(
        (item) => getTabKeyFromTab(item) === originKey,
      );
      if (index === -1) {
        return;
      }

      const tab = this.tabs[index];
      if (tab) {
        await this.closeTab(tab, router);
      }
    },

    /**
     * Get a tab by key.
     * @param key
     */
    getTabByKey(key: string) {
      return this.getTabs.find(
        (item) => getTabKeyFromTab(item) === key,
      ) as TamanTabDefinition;
    },
    /**
     * Open a tab in a new browser window.
     * @param tab
     */
    async openTabInNewWindow(tab: TamanTabDefinition, router: Router) {
      const href = router.resolve(tab.fullPath || tab.path).href;
      openWindow(new URL(href, location.href).href, { target: '_blank' });
    },

    /**
     * Pin a tab.
     * @param tab
     */
    async pinTab(tab: TamanTabDefinition) {
      const index = this.tabs.findIndex((item) => equalTab(item, tab));
      if (index === -1) {
        return;
      }
      const oldTab = this.tabs[index];
      tab.meta.affixTab = true;
      tab.meta.title = oldTab?.meta?.title as string;
      // this.addTab(tab);
      this.tabs.splice(index, 1, tab);
      // Reorder among pinned tabs; affixTabOrder sorting may need revisiting if that meta is used
      const affixTabs = this.tabs.filter((tab) => isAffixTab(tab));
      const newIndex = affixTabs.findIndex((item) => equalTab(item, tab));
      await this.sortTabs(index, newIndex);
    },

    /**
     * Refresh the current route or a named route tab.
     */
    async refresh(router: Router | string) {
      // Router instance: refresh the active route
      // String route name: refresh that tab only (must not be the active route name)
      if (typeof router === 'string') {
        return await this.refreshByName(router);
      }

      const { currentRoute } = router;
      const { name } = currentRoute.value;

      this.excludeCachedTabs.add(name as string);
      this.renderRouteView = false;
      startProgress();

      await new Promise((resolve) => {
        setTimeout(resolve, 200);
      });

      this.excludeCachedTabs.delete(name as string);
      this.renderRouteView = true;
      stopProgress();
    },

    /**
     * Refresh a tab by route name.
     */
    async refreshByName(name: string) {
      this.excludeCachedTabs.add(name);
      await new Promise((resolve) => {
        setTimeout(resolve, 200);
      });
      this.excludeCachedTabs.delete(name);
    },

    /**
     * Reset a tab title to its route default.
     */
    async resetTabTitle(tab: TamanTabDefinition) {
      if (tab?.meta?.newTabTitle) {
        return;
      }
      const findTab = this.tabs.find((item) => equalTab(item, tab));
      if (findTab) {
        findTab.meta.newTabTitle = undefined;
        await this.updateCacheTabs();
      }
    },

    /**
     * Register routes as pinned tabs.
     * @param tabs
     */
    setAffixTabs(tabs: Array<RouteRecordNormalized>) {
      for (const tab of tabs) {
        tab.meta.affixTab = true;
        this.addTab(routeToTab(tab));
      }
    },

    /**
     * Update the tab context menu item list.
     * @param list
     */
    setMenuList(list: Array<string>) {
      this.menuList = list;
    },

    /**
     * Set a tab title.
     *
     * Accepts a static string or a computed ref for a dynamic title.
     * When a computed ref is used, the title updates automatically when its value changes.
     * Useful for titles driven by state or i18n.
     *
     * @param tab - Tab to update
     * @param title - Static string or computed title
     *
     * @example
     * // Static title
     * setTabTitle(tab, 'New Tab');
     *
     * @example
     * // Dynamic title
     * setTabTitle(tab, computed(() => t('common.dashboard')));
     */
    async setTabTitle(tab: TamanTabDefinition, title: ComputedRef<string> | string) {
      const findTab = this.tabs.find((item) => equalTab(item, tab));

      if (findTab) {
        findTab.meta.newTabTitle = title;

        await this.updateCacheTabs();
      }
    },
    setUpdateTime() {
      this.updateTime = Date.now();
    },
    /**
     * Reorder tabs by moving from oldIndex to newIndex.
     * @param oldIndex
     * @param newIndex
     */
    async sortTabs(oldIndex: number, newIndex: number) {
      const currentTab = this.tabs[oldIndex];
      if (!currentTab) {
        return;
      }
      this.tabs.splice(oldIndex, 1);
      this.tabs.splice(newIndex, 0, currentTab);
      this.dragEndIndex = this.dragEndIndex + 1;
    },

    /**
     * Toggle pin state for a tab.
     * @param tab
     */
    async toggleTabPin(tab: TamanTabDefinition) {
      const affixTab = tab?.meta?.affixTab ?? false;

      await (affixTab ? this.unpinTab(tab) : this.pinTab(tab));
    },

    /**
     * Unpin a tab.
     * @param tab
     */
    async unpinTab(tab: TamanTabDefinition) {
      const index = this.tabs.findIndex((item) => equalTab(item, tab));
      if (index === -1) {
        return;
      }
      const oldTab = this.tabs[index];
      tab.meta.affixTab = false;
      tab.meta.title = oldTab?.meta?.title as string;
      // this.addTab(tab);
      this.tabs.splice(index, 1, tab);
      // Move after pinned tabs (first slot among normal tabs)
      const affixTabs = this.tabs.filter((tab) => isAffixTab(tab));
      const newIndex = affixTabs.length;
      await this.sortTabs(index, newIndex);
    },
    /**
     * Rebuild keep-alive cache keys from open tabs.
     */
    async updateCacheTabs() {
      const cacheMap = new Set<string>();

      for (const tab of this.tabs) {
        // Skip tabs without keepAlive
        const keepAlive = tab.meta?.keepAlive;
        if (!keepAlive) {
          continue;
        }
        (tab.matched || []).forEach((t, i) => {
          if (i > 0) {
            cacheMap.add(t.name as string);
          }
        });

        const name = tab.name as string;
        cacheMap.add(name);
      }
      this.cachedTabs = cacheMap;
    },
    /**
     * Add a cached route entry.
     * @param component
     * @param route
     */
    addCachedRoute(component: VNode, route: RouteLocationNormalizedLoaded) {
      const key = getTabKey(route);
      if (this.cachedRoutes.has(key)) {
        return;
      }
      this.cachedRoutes.set(key, {
        key,
        component: markRaw(component),
        route: markRaw(route),
      });
    },
    removeCachedRoute(key: string) {
      this.cachedRoutes.delete(key);
    },
  },
  getters: {
    affixTabs(): Array<TamanTabDefinition> {
      const affixTabs = this.tabs.filter((tab) => isAffixTab(tab));

      return affixTabs.toSorted((a, b) => {
        const orderA = (a.meta?.affixTabOrder ?? 0) as number;
        const orderB = (b.meta?.affixTabOrder ?? 0) as number;
        return orderA - orderB;
      });
    },
    getCachedTabs(): Array<string> {
      return [...this.cachedTabs];
    },
    getExcludeCachedTabs(): Array<string> {
      return [...this.excludeCachedTabs];
    },
    getMenuList(): Array<string> {
      return this.menuList;
    },
    getTabs(): Array<TamanTabDefinition> {
      const normalTabs = this.tabs.filter((tab) => !isAffixTab(tab));
      return [...this.affixTabs, ...normalTabs].filter(Boolean);
    },
    getCachedRoutes(): Map<string, RouteCached> {
      return this.cachedRoutes;
    },
  },
  persist: [
    // Tabs are stored in sessionStorage, not localStorage
    {
      pick: ['tabs', 'visitHistory'],
      storage: sessionStorage,
      serializer: {
        serialize: JSON.stringify,
        deserialize(value: string) {
          const parsed = JSON.parse(value);
          // JSON serialization turns Stack instances into plain {dedup, items, maxSize}
          // objects; rebuild a Stack so methods and getters work again
          if (parsed.visitHistory && !(parsed.visitHistory instanceof Stack)) {
            const raw = parsed.visitHistory;
            const stack = createStack<string>(true, MAX_VISIT_HISTORY);
            if (Array.isArray(raw.items)) {
              stack.push(...raw.items);
            }
            parsed.visitHistory = stack;
          }
          return parsed;
        },
      },
    },
  ],
  state: (): TabbarState => ({
    visitHistory: createStack<string>(true, MAX_VISIT_HISTORY),
    cachedRoutes: new Map<string, RouteCached>(),
    cachedTabs: new Set(),
    dragEndIndex: 0,
    excludeCachedTabs: new Set(),
    menuList: [
      'close',
      'affix',
      'maximize',
      'reload',
      'open-in-new-window',
      'close-left',
      'close-right',
      'close-other',
      'close-all',
    ],
    renderRouteView: true,
    tabs: [],
    updateTime: Date.now(),
  }),
});

// Fix HMR issues
const hot = import.meta.hot;
if (hot) {
  hot.accept(acceptHMRUpdate(useTabbarStore, hot));
}

/**
 * Clone a tab/route snapshot so the store does not mutate live router state.
 * @param route
 */
function cloneTab(route: TamanTabDefinition): TamanTabDefinition {
  if (!route) {
    return route;
  }
  const { matched, meta, ...opt } = route;
  return {
    ...opt,
    matched: (matched
      ? matched.map((item) => ({
          meta: item.meta,
          name: item.name,
          path: item.path,
        }))
      : undefined) as Array<RouteRecordNormalized>,
    meta: {
      ...meta,
      newTabTitle: meta.newTabTitle,
    },
  };
}

/**
 * Whether a tab is pinned.
 * @param tab
 */
function isAffixTab(tab: TamanTabDefinition) {
  return tab?.meta?.affixTab ?? false;
}

/**
 * Whether a tab should appear in the tab bar.
 * @param tab
 */
function isTabShown(tab: TamanTabDefinition) {
  const matched = tab?.matched ?? [];
  return !tab.meta.hideInTab && matched.every((item) => !item.meta.hideInTab);
}

/**
 * Derive a stable tab key from a route.
 * @param tab
 */
function getTabKey(tab: RouteLocationNormalized | RouteRecordNormalized) {
  const {
    fullPath,
    path,
    meta: { fullPathKey } = {},
    query = {},
  } = tab as RouteLocationNormalized;
  // pageKey may be an array when duplicate query params exist
  const pageKey = Array.isArray(query.pageKey)
    ? query.pageKey[0]
    : query.pageKey;
  let rawKey;
  if (pageKey) {
    rawKey = pageKey;
  } else {
    rawKey = fullPathKey === false ? path : (fullPath ?? path);
  }
  try {
    return decodeURIComponent(rawKey);
  } catch {
    return rawKey;
  }
}

/**
 * Whether visit history navigation is enabled.
 */
function isVisitHistory() {
  return preferences.tabbar.visitHistory;
}

/**
 * Get a tab key from a tab definition, falling back to route key derivation.
 * @param tab
 */
function getTabKeyFromTab(tab: TamanTabDefinition): string {
  return tab.key ?? getTabKey(tab);
}

/**
 * Whether two tabs refer to the same tab slot.
 * @param a
 * @param b
 */
function equalTab(a: TamanTabDefinition, b: TamanTabDefinition) {
  return getTabKeyFromTab(a) === getTabKeyFromTab(b);
}

function routeToTab(route: RouteRecordNormalized) {
  return {
    meta: route.meta,
    name: route.name,
    path: route.path,
    key: getTabKey(route),
  } as TamanTabDefinition;
}

export { getTabKey };
