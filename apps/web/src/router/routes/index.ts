import type { RouteRecordRaw } from 'vue-router';

import { mergeRouteModules } from '@taman/utils';
import { coreRoutes } from './core';

const devRouteFiles = import.meta.glob('./modules/dev/**/*.ts', {
  eager: true,
});

/**
 * Dev Routes
 *
 * These routes only available for admin users for development purposes.
 */
const devRoutes: Array<RouteRecordRaw> = mergeRouteModules(devRouteFiles);

/** External routes (no layout; for embedding; hidden from menu) */
// const externalRoutes: RouteRecordRaw[] = mergeRouteModules(externalRouteFiles);
// const staticRoutes: RouteRecordRaw[] = mergeRouteModules(staticRouteFiles);
const staticRoutes: Array<RouteRecordRaw> = [];
const externalRoutes: Array<RouteRecordRaw> = [];

/** Full route list: core (the 404 fallback is nested under Root in coreRoutes) + external; not part of generateAccess */
const routes: Array<RouteRecordRaw> = [
  ...coreRoutes,
  ...externalRoutes,
];

/** Routes subject to permission checks (dynamic + static) */
const accessRoutes = [
  ...devRoutes,
  ...staticRoutes,
];

const componentKeys: Array<string> = Object.keys(
  import.meta.glob('../../views/**/*.vue'),
)
  .filter((item) => !item.includes('/modules/'))
  .map((v) => {
    const path = v.replace('../../views/', '/');
    return path.endsWith('.vue') ? path.slice(0, -4) : path;
  });

export { accessRoutes, componentKeys, routes };
