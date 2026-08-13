import type { Component } from 'vue';
import type { RouteRecordRaw } from 'vue-router';

import type { Recordable } from './helper';

/**
 * Extended raw route record
 */
type ExRouteRecordRaw = RouteRecordRaw & {
  parent?: string;
  parents?: Array<string>;
  path?: any;
};

interface TamanMenuRecordBadgeRaw {
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
  badgeVariants?: 'destructive' | 'primary' | string;
}

/**
 * Raw menu record
 */
interface TamanMenuRecordRaw extends TamanMenuRecordBadgeRaw {
  /**
   * Icon name when active
   */
  activeIcon?: string;
  /**
   * Child menu items
   */
  children?: Array<TamanMenuRecordRaw>;
  /**
   * Whether the menu item is disabled
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
   * Sort order
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
   * Menu path; unique and usable as a key
   */
  path: string;
  /**
   * Menu query parameters
   */
  query?: Recordable<any>;
  /**
   * Whether to show the menu item
   * @default true
   */
  show?: boolean;
}

export type { ExRouteRecordRaw, TamanMenuRecordBadgeRaw, TamanMenuRecordRaw };
