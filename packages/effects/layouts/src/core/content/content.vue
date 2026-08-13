<script lang="ts" setup>
import type { RouteLocationNormalizedLoadedGeneric } from 'vue-router';

import { usePreferences } from '@taman/preferences';
import { getTabKey, storeToRefs, useTabbarStore } from '@taman/stores';
import { unref } from 'vue';
import { RouterView } from 'vue-router';

import { transformComponent, useLayoutHook } from '../../composables';
import { IFrameRouterView } from '../../iframe';
import { RouteCachedPage, RouteCachedView } from '../../route-cached';

defineOptions({ name: 'LayoutContent' });

const tabbarStore = useTabbarStore();
const { keepAlive } = usePreferences();

const { getCachedTabs, getExcludeCachedTabs, renderRouteView }
  = storeToRefs(tabbarStore);

const { getEnabledTransition, getTransitionName } = useLayoutHook();

/**
 * Whether the route component should render in RouterView
 * @param route
 */
function showComponent(route: RouteLocationNormalizedLoadedGeneric) {
  return !route.meta.domCached && unref(renderRouteView);
}
</script>

<template>
  <div class="h-full relative">
    <IFrameRouterView />

    <RouteCachedView />

    <RouterView v-slot="{ Component, route }">
      <RouteCachedPage
        v-if="route.meta.domCached"
        :component="Component"
        :route="route"
      />

      <Transition
        v-if="getEnabledTransition"
        :name="getTransitionName(route)"
        appear
      >
        <KeepAlive
          v-if="keepAlive"
          :exclude="getExcludeCachedTabs"
          :include="getCachedTabs"
        >
          <component
            :is="transformComponent(Component, route)"
            v-if="showComponent(route)"
            v-show="!route.meta.iframeSrc"
            :key="getTabKey(route)"
          />
        </KeepAlive>

        <component
          :is="Component"
          v-else-if="showComponent(route)"
          :key="getTabKey(route)"
        />
      </Transition>

      <template v-else>
        <KeepAlive
          v-if="keepAlive"
          :exclude="getExcludeCachedTabs"
          :include="getCachedTabs"
        >
          <component
            :is="transformComponent(Component, route)"
            v-if="showComponent(route)"
            v-show="!route.meta.iframeSrc"
            :key="getTabKey(route)"
          />
        </KeepAlive>

        <component
          :is="Component"
          v-else-if="showComponent(route)"
          :key="getTabKey(route)"
        />
      </template>
    </RouterView>
  </div>
</template>
