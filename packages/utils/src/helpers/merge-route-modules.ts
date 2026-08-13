import type { RouteRecordRaw } from 'vue-router';

// Route module shape from dynamic import
interface RouteModuleType {
  default: Array<RouteRecordRaw>;
}

/**
 * Merges default exports from dynamically imported route modules.
 * @param routeModules Object of dynamically imported route modules
 * @returns Merged route configuration array
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
