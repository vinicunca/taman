import type { RouteRecordRaw } from 'vue-router';

interface RouteModuleType {
  default: Array<RouteRecordRaw>;
}

/**
 * Merge the default export of the dynamic route modules
 * @param routeModules The dynamic import route module object
 * @returns The merged route configuration array
 */
function mergeRouteModules(
  routeModules: Record<string, unknown>,
): Array<RouteRecordRaw> {
  const mergedRoutes: Array<RouteRecordRaw> = [];

  for (const routeModule of Object.values(routeModules)) {
    const moduleRoutes = (routeModule as RouteModuleType)?.default ?? [];
    mergedRoutes.push(...moduleRoutes);
  }

  return mergedRoutes;
}

export { mergeRouteModules };

export type { RouteModuleType };
