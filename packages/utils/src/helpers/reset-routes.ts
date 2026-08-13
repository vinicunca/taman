import type { Router, RouteRecordName, RouteRecordRaw } from 'vue-router';

import { traverseTreeValues } from '@taman-core/shared/utils';

/**
 * Resets all routes except those in the static route whitelist.
 */
export function resetStaticRoutes(router: Router, routes: Array<RouteRecordRaw>) {
  // Collect route names from the static tree (including children); skip routes without a name
  const staticRouteNames = traverseTreeValues<
    RouteRecordRaw,
    RouteRecordName | undefined
  >(routes, (route) => {
    // Routes must define `name` so they can be removed during reset
    if (!route.name) {
      console.warn(
        `The route with the path ${route.path} needs to have the field name specified.`,
      );
    }
    return route.name;
  });

  const { getRoutes, hasRoute, removeRoute } = router;
  const allRoutes = getRoutes();
  allRoutes.forEach(({ name }) => {
    // Remove only routes that exist and are not in the static whitelist
    if (name && !staticRouteNames.includes(name) && hasRoute(name)) {
      removeRoute(name);
    }
  });
}
