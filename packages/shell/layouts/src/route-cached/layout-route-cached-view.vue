<script setup lang="ts">
import { preferences } from '@taman/preferences';
import { getTabKey, storeToRefs, useTabbarStore } from '@taman/stores';
import { computed, unref, watch } from 'vue';
import { useRoute } from 'vue-router';

import { transformComponent, useLayoutComposable } from '../composables';

const route = useRoute();

const tabbarStore = useTabbarStore();

const { getTabs, getCachedRoutes, getExcludeCachedTabs } = storeToRefs(tabbarStore);
const { removeCachedRoute } = tabbarStore;

const { getEnabledTransition, getTransitionName } = useLayoutComposable();

/**
 * Whether the tabbar is enabled
 */
const enableTabbar = computed(() => preferences.tabbar.enable);

const computedCachedRouteKeys = computed(() => {
  if (!unref(enableTabbar)) {
    return [];
  }

  return unref(getTabs)
    .filter((item) => item.meta.domCached)
    .map((item) => getTabKey(item));
});

/**
 * Prunes cached routes when they are no longer in the tab list
 */
watch(computedCachedRouteKeys, (keys) => {
  unref(getCachedRoutes).forEach((item) => {
    if (!keys.includes(item.key)) {
      removeCachedRoute(item.key);
    }
  });
});

/**
 * All DOM-cached route components
 */
const computedCachedRoutes = computed(() => {
  if (!unref(enableTabbar)) {
    return [];
  }
  // Exclude tabs marked for refresh from the cache
  const excludeCachedTabKeys = unref(getExcludeCachedTabs);
  return [...unref(getCachedRoutes).values()].filter((item) => {
    const componentType: any = item.component.type || {};
    let componentName = componentType.name;
    if (!componentName) {
      componentName = item.route.name;
    }
    return !excludeCachedTabKeys.includes(componentName);
  });
});

/**
 * Whether any cached views should render
 */
const computedShowView = computed(() => unref(computedCachedRoutes).length > 0);

const computedCurrentRouteKey = computed(() => {
  return getTabKey(route);
});
</script>

<template>
  <template v-if="computedShowView">
    <template
      v-for="item in computedCachedRoutes"
      :key="item.key"
    >
      <Transition
        v-if="getEnabledTransition"
        appear
        mode="out-in"
        :name="getTransitionName(item.route)"
      >
        <component
          :is="transformComponent(item.component, item.route)"
          v-show="item.key === computedCurrentRouteKey"
        />
      </Transition>

      <template v-else>
        <component
          :is="transformComponent(item.component, item.route)"
          v-show="item.key === computedCurrentRouteKey"
        />
      </template>
    </template>
  </template>
</template>
