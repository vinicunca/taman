import type { TamanMenuRecordRaw } from '@taman/types';

import { computed, onBeforeMount, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

import { preferences, usePreferences } from '@taman/preferences';
import { useAccessStore } from '@taman/stores';
import { findRootMenuByPath } from '@taman/utils';

import { useNavigation } from './use-navigation';

function useMixedMenu() {
  const { navigation, willOpenedByWindow } = useNavigation();
  const accessStore = useAccessStore();
  const route = useRoute();
  const splitSideMenus = ref<TamanMenuRecordRaw[]>([]);
  const rootMenuPath = ref<string>('');
  const mixedRootMenuPath = ref<string>('');
  const mixExtraMenus = ref<TamanMenuRecordRaw[]>([]);
  /** Tracks which child menu was last activated under the current top-level menu */
  const defaultSubMap = new Map<string, string>();
  const { isMixedNav, isHeaderMixedNav, isMobile } = usePreferences();

  const needSplit = computed(
    () =>
      !isMobile.value &&
      ((preferences.navigation.split && isMixedNav.value) ||
        isHeaderMixedNav.value),
  );

  const sidebarVisible = computed(() => {
    const enableSidebar = preferences.sidebar.enable;
    if (needSplit.value) {
      return enableSidebar && splitSideMenus.value.length > 0;
    }
    return enableSidebar;
  });
  const menus = computed(() => accessStore.accessMenus);

  /**
   * Header menus
   */
  const headerMenus = computed(() => {
    if (!needSplit.value) {
      return menus.value;
    }
    return menus.value.map((item) => {
      return {
        ...item,
        children: [],
      };
    });
  });

  /**
   * Sidebar menus
   */
  const sidebarMenus = computed(() => {
    return needSplit.value ? splitSideMenus.value : menus.value;
  });

  const mixHeaderMenus = computed(() => {
    return isHeaderMixedNav.value ? sidebarMenus.value : headerMenus.value;
  });

  /**
   * Active path for sidebar menus
   */
  const sidebarActive = computed(() => {
    return (route?.meta?.activePath as string) ?? route.path;
  });

  /**
   * Active path for header menus
   */
  const headerActive = computed(() => {
    if (!needSplit.value) {
      return route.meta?.activePath ?? route.path;
    }
    return rootMenuPath.value;
  });

  /**
   * Handles menu click events
   * @param key Menu path
   * @param mode Menu mode
   */
  const handleMenuSelect = (key: string, mode?: string) => {
    if (!needSplit.value || mode === 'vertical') {
      navigation(key);
      return;
    }
    const rootMenu = menus.value.find((item) => item.path === key);
    const _splitSideMenus = rootMenu?.children ?? [];

    if (!willOpenedByWindow(key)) {
      rootMenuPath.value = rootMenu?.path ?? '';
      splitSideMenus.value = _splitSideMenus;
    }

    if (_splitSideMenus.length === 0) {
      navigation(key);
    } else if (rootMenu && preferences.sidebar.autoActivateChild) {
      navigation(
        defaultSubMap.has(rootMenu.path)
          ? (defaultSubMap.get(rootMenu.path) as string)
          : rootMenu.path,
      );
    }
  };

  /**
   * Handles sidebar menu expand events
   * @param key Route path
   * @param parentsPath Parent paths
   */
  const handleMenuOpen = (key: string, parentsPath: string[]) => {
    if (parentsPath.length <= 1 && preferences.sidebar.autoActivateChild) {
      navigation(
        defaultSubMap.has(key) ? (defaultSubMap.get(key) as string) : key,
      );
    }
  };

  /**
   * Computes sidebar menus
   * @param path Route path
   */
  function calcSideMenus(path: string = route.path) {
    let { rootMenu } = findRootMenuByPath(menus.value, path);
    if (!rootMenu) {
      rootMenu = menus.value.find((item) => item.path === path);
    }
    const result = findRootMenuByPath(rootMenu?.children || [], path, 1);
    mixedRootMenuPath.value = result.rootMenuPath ?? '';
    mixExtraMenus.value = result.rootMenu?.children ?? [];
    rootMenuPath.value = rootMenu?.path ?? '';
    splitSideMenus.value = rootMenu?.children ?? [];
  }

  watch(
    () => route.path,
    (path) => {
      const currentPath = route?.meta?.activePath ?? route?.meta?.link ?? path;
      if (willOpenedByWindow(currentPath)) {
        return;
      }
      calcSideMenus(currentPath);
      if (rootMenuPath.value)
        defaultSubMap.set(rootMenuPath.value, currentPath);
    },
    { immediate: true },
  );

  // Initialize sidebar menus on mount
  onBeforeMount(() => {
    calcSideMenus(route.meta?.activePath || route.path);
  });

  return {
    handleMenuSelect,
    handleMenuOpen,
    headerActive,
    headerMenus,
    sidebarActive,
    sidebarMenus,
    mixHeaderMenus,
    mixExtraMenus,
    sidebarVisible,
  };
}

export { useMixedMenu };
