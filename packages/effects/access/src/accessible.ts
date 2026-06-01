/* eslint-disable sonar/no-nested-functions */
import type {
  GenerateMenuAndRoutesOptions,
  RouteRecordRaw,
  TamanAccessModeType,
} from '@taman/types';
import type { Component, DefineComponent } from 'vue';

import { generateMenus, generateRoutesByBackend, generateRoutesByFrontend, mapTree } from '@taman/utils';
import { clone, isFunction, isString } from '@vinicunca/perkakas';
import { defineComponent, h } from 'vue';

async function generateAccessible(
  mode: TamanAccessModeType,
  options: GenerateMenuAndRoutesOptions,
) {
  const { router } = options;

  options.routes = clone(options.routes);

  const accessibleRoutes = await generateRoutes(mode, options);

  const root = router.getRoutes().find((item) => item.path === '/');

  // Get the list of existing route names
  const names = root?.children?.map((item) => item.name) ?? [];

  // Dynamically add to the router instance
  accessibleRoutes.forEach((route) => {
    if (root && !route.meta?.noDefaultLayout) {
      // To be compatible with the previous version usage, if it contains child routes, the component is removed to avoid multiple LayoutDefault layers
      // If your project has followed this modification, removed all custom menu first-level LayoutDefault, you can delete this if code
      if (route.children && route.children.length > 0) {
        delete route.component;
      }
      // Determine if the route already exists based on the router name, if it exists, do not add it again
      if (names?.includes(route.name)) {
        // Find the existing route index and update, not updating will cause the first-level directory to not be updated when switching users, and the homePath in the second-level directory will cause a 404 problem
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
      const [frontendRoutes, backendRoutes] = await Promise.all([
        generateRoutesByFrontend(routes, roles || [], forbiddenComponent),
        generateRoutesByBackend(options),
      ]);

      resultRoutes = mergeRoutesByName(
        backendRoutes,
        frontendRoutes,
      );
      break;
    }
  }

  /**
   * Adjust the route tree, do the following processing:
   * 1. Add redirect to routes that have not added redirect
   * 2. Modify the lazy loaded component name to the current route name (if keep-alive is enabled)
   */
  resultRoutes = mapTree(resultRoutes, (route) => {
    // Re-wrap the component, use the same name as the route name to support the conditional caching of keep-alive.
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

    // If there is a redirect or no child routes, return directly
    if (route.redirect || !route.children || route.children.length === 0) {
      return route;
    }
    const firstChild = route.children[0];

    // If the child route does not start with /, return directly, this situation needs to calculate the path of all parent levels to get the correct path, here is not processed
    if (!firstChild?.path || !firstChild.path.startsWith('/')) {
      return route;
    }

    route.redirect = firstChild.path;
    return route;
  });

  return resultRoutes;
}

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
