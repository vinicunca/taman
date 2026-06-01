import type { Router, RouteRecordName, RouteRecordRaw } from 'vue-router';

import { traverseTreeValues } from '@taman-core/shared/utils';

/**
 * Reset all routes, except for the specified whitelist.
 */
export function resetStaticRoutes(router: Router, routes: Array<RouteRecordRaw>) {
  // Get the name of all nodes in the static route including the child nodes, and exclude the routes that do not have the name field.
  const staticRouteNames = traverseTreeValues<
    RouteRecordRaw,
    RouteRecordName | undefined
  >(routes, (route) => {
    // These routes need to specify name, to prevent the routes that do not have the name field from being deleted when the routes are reset.
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
    // Only routes that exist in the route table and are not in the whitelist need to be deleted.
    if (name && !staticRouteNames.includes(name) && hasRoute(name)) {
      removeRoute(name);
    }
  });
}
