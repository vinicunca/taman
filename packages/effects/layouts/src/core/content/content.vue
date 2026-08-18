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
  <div class="page-route-container h-full relative">
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
        :leave-active-class="`${getTransitionName(route)}-leave-active page-route-leave-active`"
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

<style lang="postcss">
/* Optimized router transition animations to resolve the overlap issue. */
.page-route-leave-active {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
}

/* Remove the horizontal scrollbar during animation transitions. translateX(-30px) */
.page-route-container:has(> .fade-slide-enter-active),
.page-route-container:has(> .fade-slide-leave-active) {
  overflow-x: hidden;
}

/* Remove the vertical scrollbar during animation transitions. translateY(-30px) */
.page-route-container:has(> .fade-up-enter-active),
.page-route-container:has(> .fade-up-leave-active),
.page-route-container:has(> .fade-down-enter-active),
.page-route-container:has(> .fade-down-leave-active) {
  overflow-y: hidden;
}
</style>
