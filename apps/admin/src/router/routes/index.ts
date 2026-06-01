import type { RouteRecordRaw } from 'vue-router';

import { mergeRouteModules, traverseTreeValues } from '@taman/utils';

import { coreRoutes, fallbackNotFoundRoute } from './core';

const dynamicRouteFiles = import.meta.glob('./modules/**/*.ts', {
  eager: true,
});

// If you need, you can open the comment and create a folder
// const externalRouteFiles = import.meta.glob('./external/**/*.ts', { eager: true });
// const staticRouteFiles = import.meta.glob('./static/**/*.ts', { eager: true });

/** Dynamic routes */
const dynamicRoutes: Array<RouteRecordRaw> = mergeRouteModules(dynamicRouteFiles);

/** External routes list, visiting these pages can without the Layout, it may be used to embed in other systems (will not be displayed in the menu) */
// const externalRoutes: Array<RouteRecordRaw> = mergeRouteModules(externalRouteFiles);
// const staticRoutes: Array<RouteRecordRaw> = mergeRouteModules(staticRouteFiles);
const staticRoutes: Array<RouteRecordRaw> = [];
const externalRoutes: Array<RouteRecordRaw> = [];

/**
 * Route list, consisting of basic routes, external routes and 404 fallback routes
 * No need to enter permission verification (will always be displayed in the menu)
 */
const routes: Array<RouteRecordRaw> = [
  ...coreRoutes,
  ...externalRoutes,
  fallbackNotFoundRoute,
];

/** Basic route list, these routes do not need to enter permission interception */
const coreRouteNames = traverseTreeValues(coreRoutes, (route) => route.name);

/** Route list with permission verification, including dynamic routes and static routes */
const accessRoutes = [...dynamicRoutes, ...staticRoutes];

const componentKeys: Array<string> = Object.keys(
  import.meta.glob('../../views/**/*.vue'),
)
  .filter((item) => !item.includes('/modules/'))
  .map((v) => {
    const path = v.replace('../../views/', '/');
    return path.endsWith('.vue') ? path.slice(0, -4) : path;
  });

export { accessRoutes, componentKeys, coreRouteNames, routes };
