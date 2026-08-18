import type { StrictContextMenuItem } from '@taman-core/tabs-ui';
import type { TamanTabDefinition } from '@taman/types';
import type { RouteLocationNormalizedGeneric } from 'vue-router';

import { $t, useI18n } from '@taman/locales';
import { getTabKey, useAccessStore, useTabbarStore } from '@taman/stores';
import { filterTree } from '@taman/utils';
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useContentMaximize, useTabs } from '../../../../composables/src';

export function useTabbar() {
  const router = useRouter();
  const route = useRoute();
  const accessStore = useAccessStore();
  const tabbarStore = useTabbarStore();
  const { contentIsMaximize, toggleMaximize } = useContentMaximize();
  const {
    closeAllTabs,
    closeCurrentTab,
    closeLeftTabs,
    closeOtherTabs,
    closeRightTabs,
    closeTabByKey,
    getTabDisableState,
    openTabInNewWindow,
    refreshTab,
    toggleTabPin,
  } = useTabs();

  /**
   * Tab key for the current route
   */
  const currentActive = computed(() => {
    return getTabKey(route);
  });

  const { locale } = useI18n();
  const currentTabs = ref<Array<RouteLocationNormalizedGeneric>>();
  watch(
    [
      () => tabbarStore.getTabs,
      () => tabbarStore.updateTime,
      () => locale.value,
    ],
    ([tabs]) => {
      currentTabs.value = tabs.map((item) => wrapperTabLocale(item));
    },
  );

  /**
   * Initializes pinned (affix) tabs
   */
  function initAffixTabs() {
    const affixTabs = filterTree(router.getRoutes(), (route) => {
      return !!route.meta?.affixTab;
    });
    tabbarStore.setAffixTabs(affixTabs);
  }

  // Navigate when a tab is clicked
  function handleClick(key: string) {
    const { fullPath, path } = tabbarStore.getTabByKey(key);
    router.push(fullPath || path);
  }

  // Close tab by key
  async function handleClose(key: string) {
    await closeTabByKey(key);
  }

  function wrapperTabLocale(tab: RouteLocationNormalizedGeneric) {
    return {
      ...tab,
      meta: {
        ...tab?.meta,
        title: $t(tab?.meta?.title as string),
      },
    };
  }

  watch(
    () => accessStore.accessMenus,
    () => {
      initAffixTabs();
    },
    { immediate: true },
  );

  watch(
    () => route.fullPath,
    () => {
      const meta = route.matched?.[route.matched.length - 1]?.meta;
      tabbarStore.addTab({
        ...route,
        meta: meta || route.meta,
      });
    },
    { immediate: true },
  );

  function createContextMenus(tab: TamanTabDefinition) {
    const {
      disabledCloseAll,
      disabledCloseCurrent,
      disabledCloseLeft,
      disabledCloseOther,
      disabledCloseRight,
      disabledRefresh,
    } = getTabDisableState(tab);

    const affixTab = tab?.meta?.affixTab ?? false;

    const menus: Array<StrictContextMenuItem> = [
      {
        key: 'close',
        icon: 'lucide:x',
        label: $t('preferences.tabbar.contextMenu.close'),
        onSelect: async () => {
          await closeCurrentTab(tab);
        },
        disabled: disabledCloseCurrent,
      },
      {
        key: 'affix',
        icon: affixTab ? 'lucide:pin-off' : 'lucide:pin',
        label: affixTab
          ? $t('preferences.tabbar.contextMenu.unpin')
          : $t('preferences.tabbar.contextMenu.pin'),
        onSelect: async () => {
          await toggleTabPin(tab);
        },
      },
      {
        key: contentIsMaximize.value ? 'restore-maximize' : 'maximize',
        icon: contentIsMaximize.value ? 'lucide:minimize-2' : 'lucide:maximize',
        label: contentIsMaximize.value
          ? $t('preferences.tabbar.contextMenu.restoreMaximize')
          : $t('preferences.tabbar.contextMenu.maximize'),
        onSelect: async () => {
          if (!contentIsMaximize.value) {
            await router.push(tab.fullPath);
          }
          toggleMaximize();
        },
      },
      {
        key: 'reload',
        icon: 'lucide:rotate-cw',
        label: $t('preferences.tabbar.contextMenu.reload'),
        onSelect: () => refreshTab(),
        disabled: disabledRefresh,
      },
      {
        key: 'open-in-new-window',
        icon: 'lucide:external-link',
        label: $t('preferences.tabbar.contextMenu.openInNewWindow'),
        onSelect: async () => {
          await openTabInNewWindow(tab);
        },
      },

      {
        key: 'separator',
        type: 'separator',
      },

      {
        key: 'close-left',
        icon: 'lucide:arrow-left-to-line',
        label: $t('preferences.tabbar.contextMenu.closeLeft'),
        onSelect: async () => {
          await closeLeftTabs(tab);
        },
        disabled: disabledCloseLeft,
      },
      {
        key: 'close-right',
        icon: 'lucide:arrow-right-to-line',
        label: $t('preferences.tabbar.contextMenu.closeRight'),
        onSelect: async () => {
          await closeRightTabs(tab);
        },
        disabled: disabledCloseRight,
      },
      {
        key: 'separator',
        type: 'separator',
      },
      {
        key: 'close-other',
        icon: 'lucide:fold-horizontal',
        label: $t('preferences.tabbar.contextMenu.closeOther'),
        onSelect: async () => {
          await closeOtherTabs(tab);
        },
        disabled: disabledCloseOther,
      },
      {
        key: 'close-all',
        icon: 'lucide:arrow-right-left',
        label: $t('preferences.tabbar.contextMenu.closeAll'),
        onSelect: closeAllTabs,
        disabled: disabledCloseAll,
      },
    ];

    return menus.filter((item) => {
      return tabbarStore.getMenuList.includes(item.key) || item.type === 'separator';
    });
  }

  return {
    createContextMenus,
    currentActive,
    currentTabs,
    handleClick,
    handleClose,
  };
}
