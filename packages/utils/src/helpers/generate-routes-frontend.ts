import type { AuthRoleNames } from '@taman/rbac';
import type { RouteRecordRaw } from 'vue-router';
import { mapTree } from '@taman-core/shared/utils';

/**
 * Generates routes dynamically on the client (role-based filtering).
 */
async function generateRoutesByFrontend(
  routes: Array<RouteRecordRaw>,
  roles: Array<AuthRoleNames>,
  forbiddenComponent?: RouteRecordRaw['component'],
): Promise<Array<RouteRecordRaw>> {
  return mapTree(routes, (route) => {
    if (!hasAuthority(route, roles) && forbiddenComponent) {
      route.component = forbiddenComponent;
      if (!menuHasVisibleWithForbidden(route)) {
        if (route.meta) {
          route.meta.hideInMenu = true;
        }
      }
    }
    return route;
  });
}

/**
 * Returns whether the user may access the route. `route.meta.authority` is
 * either a role list (intersected against `access`) or a callback for
 * checks a role list can't express, e.g. a better-auth permission check.
 * @param route
 * @param access
 */
function hasAuthority(route: RouteRecordRaw, access: Array<AuthRoleNames>) {
  const authority = route.meta?.authority;
  if (!authority) {
    return true;
  }
  return typeof authority === 'function'
    ? authority(access)
    : access.some((value) => authority.includes(value));
}

/**
 * Returns whether the route stays visible in the menu but navigates to 403.
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
