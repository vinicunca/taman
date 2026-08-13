import type { Component } from 'vue';

interface IContextMenuItem {
  /**
   * Whether disabled
   */
  disabled?: boolean;
  /**
   * Click handler
   * @param data
   */
  handler?: (data: any) => void;
  /**
   * Whether hidden
   */
  hidden?: boolean;
  /**
   * Icon
   */
  icon?: Component;
  /**
   * Whether to show icon inset
   */
  inset?: boolean;
  /**
   * Unique key
   */
  key: string;
  /**
   * Whether this is a separator
   */
  separator?: boolean;
  /**
   * Keyboard shortcut
   */
  shortcut?: string;
  /**
   * Title
   */
  text: string;
}
export type { IContextMenuItem };
