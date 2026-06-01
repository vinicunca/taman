import type {
  ComponentRecordType,
  GenerateMenuAndRoutesOptions,
  RouteRecordStringComponent,
} from '@taman-core/typings';
import type { RouteRecordRaw } from 'vue-router';

import { mapTree } from '@taman-core/shared/utils';

/**
 * Check if the route is displayed in the menu but shows 403 when accessed (to inform the user of the functionality and request permission)
 */
function menuHasVisibleWithForbidden(route: RouteRecordRaw): boolean {
  return !!route.meta?.menuVisibleWithForbidden;
}

/**
 * Dynamically generate routes - backend way
 * Replace the items where meta.menuVisibleWithForbidden is true with the 403 component, to inform the user of the functionality and request permission.
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

    // layout conversion
    if (component && layoutMap[component]) {
      route.component = layoutMap[component];
      // page component conversion
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
  // Remove the relative path prefix
  const normalizedPath = path.replace(/^(\.\/|\.\.\/)+/, '');

  // Ensure the path starts with '/'
  const viewPath = normalizedPath.startsWith('/')
    ? normalizedPath
    : `/${normalizedPath}`;

  // Here the directory structure of the project is coupled
  return viewPath.replace(/^\/views/, '');
}
export { generateRoutesByBackend };
