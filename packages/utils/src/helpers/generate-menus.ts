import type { Router, RouteRecordRaw } from 'vue-router';

import type {
  ExRouteRecordRaw,
  TamanMenuRecordRaw,
  RouteMeta,
} from '@taman-core/typings';

import { filterTree, mapTree, sortTree } from '@taman-core/shared/utils';

/**
 * Builds a menu list from route definitions.
 * @param routes - Route configuration list
 * @param router - Vue Router instance
 * @returns Generated menu list
 */
function generateMenus(
  routes: RouteRecordRaw[],
  router: Router,
): TamanMenuRecordRaw[] {
  // Map route names to resolved paths from the router
  const finalRoutesMap: { [key: string]: string } = Object.fromEntries(
    router.getRoutes().map(({ name, path }) => [name, path]),
  );

  let menus = mapTree<ExRouteRecordRaw, TamanMenuRecordRaw>(routes, (route) => {
    // Resolve the final route path
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

    // Ensure the menu label is non-empty
    const name = (title || routeName || '') as string;

    // Build child menu items
    const resultChildren = hideChildrenInMenu
      ? []
      : ((children as TamanMenuRecordRaw[]) ?? []);

    // Wire parent path metadata on children
    if (resultChildren.length > 0) {
      resultChildren.forEach((child) => {
        child.parents = [...(route.parents ?? []), path];
        child.parent = path;
      });
    }

    // Choose the menu link path
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

  // Sort menus; use nullish coalescing so order 0 is not treated as 999
  menus = sortTree(menus, (a, b) => (a?.order ?? 999) - (b?.order ?? 999));

  // Drop menu items marked hidden
  return filterTree(menus, (menu) => !!menu.show);
}

export { generateMenus };
