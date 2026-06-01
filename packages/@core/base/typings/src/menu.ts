import type { Component } from 'vue';
import type { RouteRecordRaw } from 'vue-router';

/**
 * Extended route primitive object
 */
type ExRouteRecordRaw = RouteRecordRaw & {
  parent?: string;
  parents?: Array<string>;
  path?: any;
};

interface MenuRecordBadgeRaw {
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
  badgeVariants?: 'destructive' | 'primary' | string;
}

/**
 * Menu record raw object
 */
interface MenuRecordRaw extends MenuRecordBadgeRaw {
  /**
   * Active icon name
   */
  activeIcon?: string;
  /**
   * Sub menu
   */
  children?: Array<MenuRecordRaw>;
  /**
   * Whether to disable menu
   * @default false
   */
  disabled?: boolean;
  /**
   * Icon name
   */
  icon?: Component | string;
  /**
   * Menu name
   */
  name: string;
  /**
   * Sort number
   */
  order?: number;
  /**
   * Parent path
   */
  parent?: string;
  /**
   * All parent paths
   */
  parents?: Array<string>;
  /**
   * Menu path, unique, can be used as a key
   */
  path: string;
  /**
   * Menu parameters
   */
  query?: Record<string, any>;
  /**
   * Whether to display menu
   * @default true
   */
  show?: boolean;
}

export type { ExRouteRecordRaw, MenuRecordBadgeRaw, MenuRecordRaw };
