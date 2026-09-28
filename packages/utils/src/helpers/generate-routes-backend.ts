import type {
  ComponentRecordType,
  GenerateMenuAndRoutesOptions,
  RouteRecordStringComponent,
} from '@vinicunca/taman-core/typings';
import type { RouteRecordRaw } from 'vue-router';

import { mapTree } from '@vinicunca/taman-core/utils';

/**
 * Returns whether the route is shown in the menu but renders 403 on visit
 * (so users discover the feature and can request access).
 */
function menuHasVisibleWithForbidden(route: RouteRecordRaw): boolean {
  return !!route.meta?.menuVisibleWithForbidden;
}

/**
 * Generates routes dynamically from the server.
 * Routes with `meta.menuVisibleWithForbidden` use the 403 component so users
 * can see the feature exists and request permission.
 */
async function generateRoutesByBackend(
  options: GenerateMenuAndRoutesOptions,
): Promise<Array<RouteRecordRaw>> {
  const {
    fetchMenuListAsync,
    layoutMap = {},
    pageMap = {},
    forbiddenComponent,
  } = options;

  try {
    const menuRoutes = await fetchMenuListAsync?.();
    if (!menuRoutes) {
      return [];
    }

    const normalizePageMap: ComponentRecordType = {};

    for (const [key, value] of Object.entries(pageMap)) {
      normalizePageMap[normalizeViewPath(key)] = value;
    }

    let routes = convertRoutes(menuRoutes, layoutMap, normalizePageMap);

    if (forbiddenComponent) {
      routes = mapTree(routes, (route) => {
        if (menuHasVisibleWithForbidden(route)) {
          route.component = forbiddenComponent;
        }
        return route;
      });
    }

    return routes;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

function convertRoutes(
  routes: Array<RouteRecordStringComponent>,
  layoutMap: ComponentRecordType,
  pageMap: ComponentRecordType,
): Array<RouteRecordRaw> {
  return mapTree(routes, (node) => {
    const route = node as unknown as RouteRecordRaw;
    const { component, name } = node;

    if (!name) {
      console.error('route name is required', route);
    }

    // Resolve layout component
    if (component && layoutMap[component]) {
      route.component = layoutMap[component];
      // Resolve page component
    } else if (component) {
      const normalizePath = normalizeViewPath(component);
      const pageKey = normalizePath.endsWith('.vue')
        ? normalizePath
        : `${normalizePath}.vue`;
      if (pageMap[pageKey]) {
        route.component = pageMap[pageKey];
      } else {
        console.error(`route component is invalid: ${pageKey}`, route);
        route.component = pageMap['/_core/fallback/not-found.vue'];
      }
    }

    return route;
  });
}

function normalizeViewPath(path: string): string {
  // Strip leading relative path segments
  const normalizedPath = path.replace(/^(\.\/|\.\.\/)+/, '');

  // Ensure the path starts with '/'
  const viewPath = normalizedPath.startsWith('/')
    ? normalizedPath
    : `/${normalizedPath}`;

  // Coupled to taman-admin view directory layout
  return viewPath.replace(/^\/views/, '');
}
export { generateRoutesByBackend };
