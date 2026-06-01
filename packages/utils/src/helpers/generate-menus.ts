import type {
  ExRouteRecordRaw,
  MenuRecordRaw,
  RouteMeta,
} from '@taman-core/typings';
import type { Router, RouteRecordRaw } from 'vue-router';

import { filterTree, mapTree, sortTree } from '@taman-core/shared/utils';

/**
 * Generate the menu list based on the routes
 * @param routes - The route configuration list
 * @param router - The Vue Router instance
 * @returns The generated menu list
 */
function generateMenus(
  routes: Array<RouteRecordRaw>,
  router: Router,
): Array<MenuRecordRaw> {
  // Convert the route list to an object mapping with name as the key
  const finalRoutesMap: { [key: string]: string } = Object.fromEntries(
    router.getRoutes().map(({ name, path }) => [name, path]),
  );

  let menus = mapTree<ExRouteRecordRaw, MenuRecordRaw>(routes, (route) => {
    // Get the final route path
    const path = finalRoutesMap[route.name as string] ?? route.path ?? '';

    const {
      meta = {} as RouteMeta,
      name: routeName,
      redirect,
      children = [],
    } = route;
    const {
      activeIcon,
      badge,
      badgeType,
      badgeVariants,
      hideChildrenInMenu = false,
      icon,
      link,
      order,
      title = '',
      query,
    } = meta;

    // Ensure the menu name is not empty
    const name = (title || routeName || '') as string;

    // Process the child menu
    const resultChildren = hideChildrenInMenu
      ? []
      : ((children as Array<MenuRecordRaw>) ?? []);

    // Set the parent-child relationship of the child menu
    if (resultChildren.length > 0) {
      resultChildren.forEach((child) => {
        child.parents = [...(route.parents ?? []), path];
        child.parent = path;
      });
    }

    // Determine the final path
    const resultPath = hideChildrenInMenu ? redirect || path : link || path;

    return {
      activeIcon,
      badge,
      badgeType,
      badgeVariants,
      icon,
      name,
      query,
      order,
      parent: route.parent,
      parents: route.parents,
      path: resultPath,
      show: !meta.hideInMenu,
      children: resultChildren,
    };
  });

  // Sort the menus to avoid the problem of being replaced with 999 when order=0
  menus = sortTree(menus, (a, b) => (a?.order ?? 999) - (b?.order ?? 999));

  // Filter out the hidden menu items
  return filterTree(menus, (menu) => !!menu.show);
}

export { generateMenus };
