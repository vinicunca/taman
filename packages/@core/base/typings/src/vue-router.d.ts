import type { Component } from 'vue';
import type { Router, RouteRecordRaw } from 'vue-router';

interface RouteMeta {
  /**
   * The active icon (menu/tab)
   */
  activeIcon?: string;
  /**
   * The currently active menu, sometimes you don't want to activate the existing menu, you need to activate the parent menu when using
   */
  activePath?: string;
  /**
   * Whether to fix the tab
   * @default false
   */
  affixTab?: boolean;
  /**
   * The order of the fixed tab
   * @default 0
   */
  affixTabOrder?: number;
  /**
   * The specific role identifier is required to access
   * @default []
   */
  authority?: Array<string>;
  /**
   * Badge
   */
  badge?: string;
  /**
   * Badge type
   */
  badgeType?: 'dot' | 'normal';
  /**
   * Badge color
   */
  badgeVariants?:
    | 'default'
    | 'destructive'
    | 'primary'
    | 'success'
    | 'warning'
    | string;
  /**
   * Whether the dom of the route is cached
   */
  domCached?: boolean;
  /**
   * The full path of the route as the key (default true)
   */
  fullPathKey?: boolean;
  /**
   * The children of the current route are not displayed in the menu
   * @default false
   */
  hideChildrenInMenu?: boolean;
  /**
   * The current route is not displayed in the breadcrumb
   * @default false
   */
  hideInBreadcrumb?: boolean;
  /**
   * The current route is not displayed in the menu
   * @default false
   */
  hideInMenu?: boolean;
  /**
   * The current route is not displayed in the tab
   * @default false
   */
  hideInTab?: boolean;
  /**
   * Icon (menu/tab)
   */
  icon?: Component | string;
  /**
   * Iframe address
   */
  iframeSrc?: string;
  /**
   * Ignore permissions, directly accessible
   * @default false
   */
  ignoreAccess?: boolean;
  /**
   * Enable KeepAlive cache
   */
  keepAlive?: boolean;
  /**
   * External link - jump path
   */
  link?: string;
  /**
   * Whether the route has been loaded
   */
  loaded?: boolean;
  /**
   * The maximum number of tabs opened
   * @default -1
   */
  maxNumOfOpenTab?: number;
  /**
   * The menu can be seen, but access will be redirected to 403
   */
  menuVisibleWithForbidden?: boolean;
  /**
   * Do not use the basic layout (only effective at the top level)
   */
  noCoreLayout?: boolean;
  /**
   * Open in a new window
   */
  openInNewWindow?: boolean;
  /**
   * Used for route -> menu sorting
   */
  order?: number;
  /**
   * The parameters carried by the menu
   */
  query?: Recordable;
  /**
   * Title name
   */
  title: string;
}

// Define a recursive type to change the component property of RouteRecordRaw to string
type RouteRecordStringComponent<T = string> = Omit<
  RouteRecordRaw,
  'children' | 'component'
> & {
  children?: Array<RouteRecordStringComponent<T>>;
  component: T;
};

type ComponentRecordType = Record<string, () => Promise<Component>>;

interface GenerateMenuAndRoutesOptions {
  fetchMenuListAsync?: () => Promise<Array<RouteRecordStringComponent>>;
  forbiddenComponent?: RouteRecordRaw['component'];
  layoutMap?: ComponentRecordType;
  pageMap?: ComponentRecordType;
  roles?: Array<string>;
  router: Router;
  routes: Array<RouteRecordRaw>;
}

export type {
  ComponentRecordType,
  GenerateMenuAndRoutesOptions,
  RouteMeta,
  RouteRecordRaw,
  RouteRecordStringComponent,
};
