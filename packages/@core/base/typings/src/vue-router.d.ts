import type { AuthRoleNames } from '@taman/rbac';
import type { Component } from 'vue';
import type { Router, RouteRecordRaw } from 'vue-router';

import 'vue-router';

/**
 * Declarative auth gate for a route.
 *
 * - `false`: no auth check, no redirect, and the route is excluded from
 *   `generateAccess` menu/route generation entirely.
 * - `{ only: 'guest' }`: visible to unauthenticated visitors; an
 *   authenticated visitor is redirected to `redirectUserTo` (or the
 *   caller's default). Excluded from `generateAccess`.
 * - `{ only: 'onboarding' }`: visible only to authenticated visitors who
 *   still need onboarding (non-admin, no active organization); a visitor
 *   who no longer needs it is redirected to `redirectUserTo` (or the
 *   caller's default), same as `only: 'guest'`'s symmetric case. An
 *   unauthenticated visitor is redirected to `redirectGuestTo` like any
 *   other protected route. Excluded from `generateAccess`.
 * - `{ only: 'user' }`, `{}`, or omitted entirely: the default — requires
 *   auth. An unauthenticated visitor is redirected to `redirectGuestTo`
 *   (or the caller's default). An authenticated visitor who still needs
 *   onboarding is redirected to the onboarding route instead of being
 *   allowed through. Participates in `generateAccess`.
 */
type AuthMiddlewareOptions
  = | false
    | {
      only?: 'guest' | 'onboarding' | 'user';
      redirectUserTo?: string;
      redirectGuestTo?: string;
    };
interface AppRouteMeta {
  /**
   * Active icon (menu/tab)
   */
  activeIcon?: string;
  /**
   * Active menu path; use when the parent menu should be active instead of the current one
   */
  activePath?: string;
  /**
   * Whether the tab is affixed
   * @default false
   */
  affixTab?: boolean;
  /**
   * Affixed tab order
   * @default 0
   */
  affixTabOrder?: number;
  /**
   * Roles required to access a route.
   *
   * - `Array<AuthRoleNames>`: the user needs at least one of these roles (existing
   *   behavior — intersected against the user's roles).
   * - Callback: for checks a role list can't express, e.g. better-auth's
   *   `authClient.admin.checkRolePermission()`. Receives the user's roles and
   *   returns whether they may access the route.
   * @default []
   */
  authority?: Array<AuthRoleNames> | ((roles: Array<AuthRoleNames>) => boolean);
  /**
   * Declarative auth gate. See `AuthMiddlewareOptions`.
   * @default undefined (equivalent to `{ only: 'user' }` — protected)
   */
  auth?: AuthMiddlewareOptions;
  /**
   * Badge text
   */
  badge?: string;
  /**
   * Badge type
   */
  badgeType?: 'dot' | 'normal';
  /**
   * Badge color variant
   */
  badgeVariants?:
    | 'default'
    | 'destructive'
    | 'primary'
    | 'success'
    | 'warning'
    | string;
  /**
   * Whether the route DOM should be cached
   */
  domCached?: boolean;
  /**
   * Use the route full path as the cache key (default true)
   */
  fullPathKey?: boolean;
  /**
   * Hide child routes in the menu
   * @default false
   */
  hideChildrenInMenu?: boolean;
  /**
   * Hide this route in the breadcrumb
   * @default false
   */
  hideInBreadcrumb?: boolean;
  /**
   * Hide this route in the menu
   * @default false
   */
  hideInMenu?: boolean;
  /**
   * Hide this route in tabs
   * @default false
   */
  hideInTab?: boolean;
  /**
   * Icon (menu/tab)
   */
  icon?: Component | string;
  /**
   * iframe URL
   */
  iframeSrc?: string;
  /**
   * Enable KeepAlive caching
   */
  keepAlive?: boolean;
  /**
   * External link URL
   */
  link?: string;
  /**
   * Whether the route has already been loaded
   */
  loaded?: boolean;
  /**
   * Maximum number of open tabs
   * @default -1
   */
  maxNumOfOpenTab?: number;
  /**
   * Visible in the menu, but access redirects to 403
   */
  menuVisibleWithForbidden?: boolean;
  /**
   * Do not use the basic layout (top-level only)
   */
  noCoreLayout?: boolean;
  /**
   * Open in a new window
   */
  openInNewWindow?: boolean;
  /**
   * Sort order for route-to-menu conversion
   */
  order?: number;
  /**
   * Query parameters carried by the menu
   */
  query?: Recordable;
  /**
   * Title
   */
  title: string;
}

declare module 'vue-router' {
  interface RouteMeta extends AppRouteMeta {}
}

type RouteMeta = AppRouteMeta;

// Recursive type that changes RouteRecordRaw.component to string
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
  roles?: Array<AuthRoleNames>;
  router: Router;
  routes: Array<RouteRecordRaw>;
}

export type {
  AuthMiddlewareOptions,
  ComponentRecordType,
  GenerateMenuAndRoutesOptions,
  RouteMeta,
  RouteRecordRaw,
  RouteRecordStringComponent,
};
