import type { Component } from 'vue';

interface VbenDropdownMenuItem {
  disabled?: boolean;
  /**
   * Click handler
   * @param data
   */
  handler?: (data: any) => void;
  /**
   * Icon
   */
  icon?: Component;
  /**
   * Label
   */
  label: string;
  /**
   * Whether this is a separator
   */
  separator?: boolean;
  /**
   * Unique value
   */
  value: string;
}

interface DropdownMenuProps {
  menus: VbenDropdownMenuItem[];
}

export type { DropdownMenuProps, VbenDropdownMenuItem };
