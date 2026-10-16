import type { ComputedRef } from 'vue';
import type { TamanMenuRecordRaw } from '@taman/types';

import { preferences } from '@vinicunca/taman-core/preferences';
import { computed, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useAccessStore } from '@taman/stores';
import { findRootMenuByPath } from '@taman/utils';

import { useNavigation } from './use-navigation';

export function useMenuExtra(useRootMenus?: ComputedRef<Array<TamanMenuRecordRaw>>) {
  const accessStore = useAccessStore();
  const { navigation, willOpenedByWindow } = useNavigation();

  const menus = computed(() => useRootMenus?.value ?? accessStore.accessMenus);

  /** Tracks which child menu was last activated under the current top-level menu */
  const defaultSubMap = new Map<string, string>();
  const extraRootMenus = ref<Array<TamanMenuRecordRaw>>([]);
  const route = useRoute();
  const extraMenus = ref<Array<TamanMenuRecordRaw>>([]);
  const sidebarExtraVisible = ref<boolean>(false);
  const extraActiveMenu = ref('');
  const parentLevel = computed(() =>
    preferences.app.layout === 'header-mixed-nav' ? 1 : 0,
  );

  /**
   * Handles mixed menu selection
   * @param menu
   */
  const handleMixedMenuSelect = async (menu: TamanMenuRecordRaw) => {
    const _extraMenus = menu?.children ?? [];
    const hasChildren = _extraMenus.length > 0;

    if (!willOpenedByWindow(menu.path)) {
      extraMenus.value = _extraMenus ?? [];
      extraActiveMenu.value = menu.parents?.[parentLevel.value] ?? menu.path;
      sidebarExtraVisible.value = hasChildren;
    }

    if (!hasChildren) {
      await navigation(menu.path);
    } else if (preferences.sidebar.autoActivateChild) {
      await navigation(
        defaultSubMap.has(menu.path)
          ? (defaultSubMap.get(menu.path) as string)
          : menu.path,
      );
    }
  };

  /**
   * Handles default menu selection
   * @param menu
   * @param rootMenu
   */
  const handleDefaultSelect = async (
    menu: TamanMenuRecordRaw,
    rootMenu?: TamanMenuRecordRaw,
  ) => {
    extraMenus.value = rootMenu?.children ?? extraRootMenus.value ?? [];
    extraActiveMenu.value = menu.parents?.[parentLevel.value] ?? menu.path;

    if (preferences.sidebar.expandOnHover) {
      sidebarExtraVisible.value = extraMenus.value.length > 0;
    }
  };

  /**
   * Resolves the top-level menu owning the current path.
   * When a default child route has path '' (e.g. /cards), parent and child share the same path,
   * so findMenuByPath hits the top-level menu first; it has no parents, so rootMenu would be empty.
   */
  function resolveRootMenu(currentPath: string, level = 0) {
    const { findMenu, rootMenu, rootMenuPath } = findRootMenuByPath(
      menus.value,
      currentPath,
      level,
    );
    const resolved
      = rootMenu ?? menus.value.find((item) => item.path === currentPath);
    return {
      findMenu,
      rootMenu: resolved,
      rootMenuPath: rootMenuPath ?? resolved?.path,
    };
  }

  /**
   * Handles sidebar mouse leave
   */
  const handleSideMouseLeave = () => {
    if (preferences.sidebar.expandOnHover) {
      return;
    }

    const { findMenu, rootMenu, rootMenuPath } = resolveRootMenu(
      route.meta?.activePath || route.path,
    );
    extraActiveMenu.value = rootMenuPath ?? findMenu?.path ?? '';
    extraMenus.value = rootMenu?.children ?? [];
  };

  const handleMenuMouseEnter = (menu: TamanMenuRecordRaw) => {
    if (!preferences.sidebar.expandOnHover) {
      const { findMenu } = findRootMenuByPath(menus.value, menu.path);
      extraMenus.value = findMenu?.children ?? [];
      extraActiveMenu.value = menu.parents?.[parentLevel.value] ?? menu.path;
      sidebarExtraVisible.value = extraMenus.value.length > 0;
    }
  };

  function calcExtraMenus(path: string) {
    const currentPath = route.meta?.activePath || path;
    const { findMenu, rootMenu, rootMenuPath } = resolveRootMenu(
      currentPath,
      parentLevel.value,
    );
    extraRootMenus.value = rootMenu?.children ?? [];
    if (rootMenuPath) {
      defaultSubMap.set(rootMenuPath, currentPath);
    }
    extraActiveMenu.value = rootMenuPath ?? findMenu?.path ?? '';
    extraMenus.value = rootMenu?.children ?? [];
    sidebarExtraVisible.value = extraMenus.value.length > 0;
  }

  // The sidebar sets sidebarExtraVisible to true on hover; without extra menus it must be
  // reset, otherwise an empty panel expands over the content.
  watch([sidebarExtraVisible, extraMenus], ([visible, items]) => {
    if (visible && items.length === 0) {
      sidebarExtraVisible.value = false;
    }
  });

  watch(
    () => [
      route.path,
      preferences.app.layout,
      preferences.sidebar.expandOnHover,
      menus.value,
    ] as const,
    ([path]) => {
      calcExtraMenus(path || '');
    },
    { immediate: true },
  );

  return {
    extraActiveMenu,
    extraMenus,
    handleDefaultSelect,
    handleMenuMouseEnter,
    handleMixedMenuSelect,
    handleSideMouseLeave,
    sidebarExtraVisible,
  };
}
