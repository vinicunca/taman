import type { TamanTabDefinition, TamanTabsStyleType } from '@taman-core/typings';

import type { StrictContextMenuItem } from './strict-context-menu';

export type { StrictContextMenuItem } from './strict-context-menu';

export interface TabsEmits {
  close: [string];
  sortTabs: [number, number];
  unpin: [TamanTabDefinition];
}

export interface TabsProps {
  active?: string;
  /**
   * Content class
   * @default tabs-chrome
   */
  contentClass?: string;
  /**
   * Context menu items
   */
  contextMenus?: (tab: TamanTabDefinition) => Array<StrictContextMenuItem>;
  /**
   * Whether tabs can be dragged
   */
  draggable?: boolean;
  /**
   * Gap between tabs
   * @default 7
   * tabs-chrome only
   */
  gap?: number;
  /**
   * Maximum tab width
   * tabs-chrome only
   */
  maxWidth?: number;
  /**
   * Close tab on middle-click
   */
  middleClickToClose?: boolean;

  /**
   * Minimum tab width
   * tabs-chrome only
   */
  minWidth?: number;

  /**
   * Whether to show tab icons
   */
  showIcon?: boolean;
  /**
   * Tab visual style
   */
  styleType?: TamanTabsStyleType;

  /**
   * Tab data
   */
  tabs?: Array<TamanTabDefinition>;

  /**
   * Whether to handle mouse wheel events
   */
  wheelable?: boolean;
}

export interface TabConfig extends TamanTabDefinition {
  affixTab: boolean;
  closable: boolean;
  icon: string;
  key: string;
  title: string;
}
