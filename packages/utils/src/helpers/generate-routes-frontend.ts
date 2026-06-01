import type { RouteRecordRaw } from 'vue-router';

import { filterTree, mapTree } from '@taman-core/shared/utils';

/**
 * Dynamically generate routes - frontend way
 */
async function generateRoutesByFrontend(
  routes: Array<RouteRecordRaw>,
  roles: Array<string>,
  forbiddenComponent?: RouteRecordRaw['component'],
): Promise<Array<RouteRecordRaw>> {
  // Filter the route table by the role identifier, and determine if the current user has the specified permission
  const finalRoutes = filterTree(routes, (route) => {
    return hasAuthority(route, roles);
  });

  if (!forbiddenComponent) {
    return finalRoutes;
  }

  // If there are pages that are not accessible, replace the inaccessible pages with the 403 page
  return mapTree(finalRoutes, (route) => {
    if (menuHasVisibleWithForbidden(route)) {
      route.component = forbiddenComponent;
    }
    return route;
  });
}

/**
 * Check if the route has permission to access
 */
function hasAuthority(route: RouteRecordRaw, access: Array<string>) {
  const authority = route.meta?.authority;
  if (!authority) {
    return true;
  }
  const canAccess = access.some((value) => authority.includes(value));

  return canAccess || (!canAccess && menuHasVisibleWithForbidden(route));
}

/**
 * Check if the route is displayed in the menu but is redirected to 403 when accessed
 * @param route
 */
function menuHasVisibleWithForbidden(route: RouteRecordRaw) {
  return (
    !!route.meta?.authority
    && Reflect.has(route.meta || {}, 'menuVisibleWithForbidden')
    && !!route.meta?.menuVisibleWithForbidden
  );
}

export { generateRoutesByFrontend, hasAuthority };
