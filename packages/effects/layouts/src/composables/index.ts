import type { VNode } from 'vue';
import type {
  RouteLocationNormalizedLoaded,
  RouteLocationNormalizedLoadedGeneric,
} from 'vue-router';

import { preferences, usePreferences } from '@taman/preferences';
import { computed } from 'vue';

/**
 * Transforms a component by assigning a route name when missing
 * @param component
 * @param route
 */
export function transformComponent(
  component: VNode,
  route: RouteLocationNormalizedLoadedGeneric,
) {
  // Component view not found; return fallback if configured, otherwise log error
  if (!component) {
    console.error(
      'Component view not found, please check the route configuration',
    );
    return undefined;
  }

  const routeName = route.name as string;
  // Return as-is when the route has no name
  if (!routeName) {
    return component;
  }
  const componentName = (component?.type as any)?.name;

  // Return as-is when the component already has a name
  if (componentName) {
    return component;
  }

  // Return as-is when component name matches route name
  if (componentName === routeName) {
    return component;
  }

  // Assign route name to the component
  component.type ||= {};
  (component.type as any).name = routeName;

  return component;
}

/**
 * Layout-related hooks
 */
export function useLayoutHook() {
  const { keepAlive } = usePreferences();
  /**
   * Whether route transitions are enabled
   */
  const getEnabledTransition = computed(() => {
    const { transition } = preferences;
    const transitionName = transition.name;
    return transitionName && transition.enable;
  });

  /**
   * Resolves the route transition animation name
   * @param _route
   */
  function getTransitionName(_route: RouteLocationNormalizedLoaded) {
    // No animation when transition preferences are disabled
    const { tabbar, transition } = preferences;
    const transitionName = transition.name;
    if (!transitionName || !transition.enable) {
      return;
    }

    // Use global transition when tabbar or keep-alive is disabled
    if (!tabbar.enable || !keepAlive) {
      return transitionName;
    }

    // Skip animation when the page was already loaded
    // if (route.meta.loaded) {
    //   return;
    // }
    // Skip animation for open tabs that were already loaded
    // const inTabs = getCachedTabs.value.includes(route.name as string);

    // return inTabs && route.meta.loaded ? undefined : transitionName;
    return transitionName;
  }

  return {
    getEnabledTransition,
    getTransitionName,
  };
}
