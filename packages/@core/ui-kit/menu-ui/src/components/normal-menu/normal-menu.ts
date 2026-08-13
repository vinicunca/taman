import type { TamanMenuRecordRaw } from '@taman-core/typings';

interface NormalMenuProps {
  /**
   * Menu data
   */
  activePath?: string;
  /**
   * Whether the menu is collapsed
   */
  collapse?: boolean;
  /**
   * Menu items
   */
  menus?: Array<TamanMenuRecordRaw>;
  /**
   * Whether to use rounded style
   * @default true
   */
  rounded?: boolean;
  /**
   * Theme
   */
  theme?: 'dark' | 'light';
}

export type { NormalMenuProps };
