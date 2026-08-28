<script lang="ts" setup>
import {
  TabsToolMore,
  TabsToolRefresh,
  TabsToolScreen,
  TamanTabsView,
} from '@taman-core/tabs-ui';
import { useContentMaximize, useTabs } from '@taman/composables';
import { preferences } from '@taman/preferences';
import { useTabbarStore } from '@taman/stores';
import { computed } from 'vue';
import { useRoute } from 'vue-router';

import { useLayoutCoreTabbar } from './use-layout-core-tabbar';

defineOptions({
  name: 'LayoutCoreTabbar',
});

defineProps<{
  showIcon?: boolean;
  theme?: string;
}>();

const route = useRoute();
const tabbarStore = useTabbarStore();
const { contentIsMaximize, toggleMaximize } = useContentMaximize();
const { refreshTab, unpinTab } = useTabs();

const {
  createContextMenus,
  currentActive,
  currentTabs,
  handleClick,
  handleClose,
} = useLayoutCoreTabbar();

const menus = computed(() => {
  const tab = tabbarStore.getTabByKey(currentActive.value);
  const menus = createContextMenus(tab);

  return menus;
});

// When tab state is not persisted, close other tabs on refresh
if (!preferences.tabbar.persist) {
  tabbarStore.closeOtherTabs(route);
}
</script>

<template>
  <TamanTabsView
    :active="currentActive"
    :class="theme"
    :context-menus="createContextMenus"
    :draggable="preferences.tabbar.draggable"
    :show-icon="showIcon"
    :style-type="preferences.tabbar.styleType"
    :tabs="currentTabs"
    :wheelable="preferences.tabbar.wheelable"
    :middle-click-to-close="preferences.tabbar.middleClickToClose"
    @close="handleClose"
    @sort-tabs="tabbarStore.sortTabs"
    @unpin="unpinTab"
    @update:active="handleClick"
  />

  <div class="flex-center h-full">
    <TabsToolMore
      v-if="preferences.tabbar.showMore"
      :items="menus"
    />

    <TabsToolRefresh
      v-if="preferences.tabbar.showRefresh"
      @refresh="refreshTab"
    />

    <TabsToolScreen
      v-if="preferences.tabbar.showMaximize"
      :screen="contentIsMaximize"
      @update:screen="toggleMaximize"
    />
  </div>
</template>
