/* eslint-disable sonar/no-nested-functions */
import type {
  GenerateMenuAndRoutesOptions,
  RouteRecordRaw,
  TamanAccessModeType,
} from '@taman/types';
import type { Component, DefineComponent } from 'vue';

import {
  clone,
  generateMenus,
  generateRoutesByBackend,
  generateRoutesByFrontend,
  isFunction,
  isString,
  mapTree,
} from '@taman/utils';
import { defineComponent, h } from 'vue';

async function generateAccessible(
  mode: TamanAccessModeType,
  options: GenerateMenuAndRoutesOptions,
) {
  const { router } = options;

  options.routes = clone(options.routes);

  // Generate routes
  const accessibleRoutes = await generateRoutes(mode, options);

  const root = router.getRoutes().find((item) => item.path === '/');

  // Collect existing route names
  const names = root?.children?.map((item) => item.name) ?? [];

  // Dynamically add routes to the router instance
  accessibleRoutes.forEach((route) => {
    if (root && !route.meta?.noCoreLayout) {
      // Skip add when route name already exists; update in place instead
      if (names?.includes(route.name)) {
        // Update existing route index; otherwise switching users leaves stale top-level dirs and 404s when homePath is nested
        const index = root.children?.findIndex(
          (item) => item.name === route.name,
        );
        if (index !== undefined && index !== -1 && root.children) {
          root.children[index] = route;
        }
      } else {
        root.children?.push(route);
      }
    } else {
      router.addRoute(route);
    }
  });

  if (root) {
    if (root.name) {
      router.removeRoute(root.name);
    }
    router.addRoute(root);
  }

  // Generate menus
  const accessibleMenus = generateMenus(accessibleRoutes, options.router);

  return { accessibleMenus, accessibleRoutes };
}

/**
 * Generate routes
 * @param mode
 * @param options
 */
async function generateRoutes(
  mode: TamanAccessModeType,
  options: GenerateMenuAndRoutesOptions,
) {
  const { forbiddenComponent, roles, routes } = options;

  let resultRoutes: Array<RouteRecordRaw> = routes;
  switch (mode) {
    case 'backend': {
      resultRoutes = await generateRoutesByBackend(options);
      break;
    }
    case 'frontend': {
      resultRoutes = await generateRoutesByFrontend(
        routes,
        roles || [],
        forbiddenComponent,
      );
      break;
    }
    case 'mixed': {
      const [frontendResultRoutes, backendResultRoutes] = await Promise.all([
        generateRoutesByFrontend(routes, roles || [], forbiddenComponent),
        generateRoutesByBackend(options),
      ]);
      resultRoutes = mergeRoutesByName(
        backendResultRoutes,
        frontendResultRoutes,
      );
      break;
    }
  }

  /**
   * Normalize the route tree:
   * 1. Add redirect to routes that do not have one
   * 2. Rename lazy-loaded components to the route name (when keep-alive is enabled)
   */
  resultRoutes = mapTree(resultRoutes, (route, parent) => {
    // Re-wrap component with the route name for keep-alive conditional caching
    if (
      route.meta?.keepAlive
      && isFunction(route.component)
      && route.name
      && isString(route.name)
    ) {
      const originalComponent = route.component as () => Promise<{
        default: Component | DefineComponent;
      }>;
      route.component = async () => {
        const component = await originalComponent();
        if (!component.default) {
          return component;
        }
        return defineComponent({
          name: route.name as string,
          setup(props, { attrs, slots }) {
            return () => h(component.default, { ...props, ...attrs }, slots);
          },
        });
      };
    }

    // Return as-is when redirect exists or there are no children
    if (route.redirect || !route.children || route.children.length === 0) {
      return route;
    }
    const firstChild = route.children[0];

    if (!firstChild?.path || firstChild.path.startsWith('/')) {
      return route;
    }

    if (parent && parent.redirect) {
      const parentSplit = (parent.redirect as string).split('/');
      parentSplit.splice(-1, 2, route.path, firstChild.path);
      const redirectPath = parentSplit.join('/');
      route.redirect = redirectPath;
    } else {
      route.redirect = `${route.path}/${firstChild.path}`;
    }

    return route;
  });

  return resultRoutes;
}

/**
 * Merge frontend and backend routes by name.
 * @param baseRoutes Backend routes
 * @param extraRoutes Frontend routes
 */
function mergeRoutesByName(
  baseRoutes: Array<RouteRecordRaw>,
  extraRoutes: Array<RouteRecordRaw>,
): Array<RouteRecordRaw> {
  const result: Array<RouteRecordRaw> = [];
  const routeMap = new Map<string, RouteRecordRaw>();

  for (const route of baseRoutes) {
    const clone = { ...route } as RouteRecordRaw;
    result.push(clone);
    if (clone.name && isString(clone.name)) {
      routeMap.set(clone.name as string, clone);
    }
  }

  for (const route of extraRoutes) {
    if (
      route.name
      && isString(route.name)
      && routeMap.has(route.name as string)
    ) {
      const existing = routeMap.get(route.name as string);
      if (!existing) {
        continue;
      }
      const existingChildren = existing.children ?? [];
      const routeChildren = route.children ?? [];

      const merged = {
        ...route,
        ...existing, // keep backend as base
        meta: {
          ...route.meta,
          ...existing.meta, // backend meta wins on conflicts
        },
      } as RouteRecordRaw;

      if (existingChildren.length > 0 || routeChildren.length > 0) {
        merged.children = mergeRoutesByName(existingChildren, routeChildren);
      }

      Object.assign(existing, merged);
    } else {
      const clone = { ...route } as RouteRecordRaw;
      result.push(clone);
      if (clone.name && isString(clone.name)) {
        routeMap.set(clone.name as string, clone);
      }
    }
  }

  return result;
}

export { generateAccessible };
