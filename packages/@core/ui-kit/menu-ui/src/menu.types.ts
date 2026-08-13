import type {
  Recordable,
  TamanMenuRecordBadgeRaw,
  TamanThemeModeType,
} from '@taman-core/typings';
import type { Component, Ref } from 'vue';

interface MenuProps {
  /**
   * Whether accordion mode is enabled
   * @default true
   */
  accordion?: boolean;
  /**
   * Whether the menu is collapsed
   * @default false
   */
  collapse?: boolean;

  /**
   * Whether to show menu titles when collapsed
   * @default false
   */
  collapseShowTitle?: boolean;

  /**
   * Default active menu path
   */
  defaultActive?: string;

  /**
   * Default expanded submenu paths
   */
  defaultOpeneds?: Array<string>;

  /**
   * Menu orientation
   * @default vertical
   */
  mode?: 'horizontal' | 'vertical';

  /**
   * Whether to use rounded style
   * @default true
   */
  rounded?: boolean;

  /**
   * Whether to auto-scroll to the active menu item
   * @default false
   */
  scrollToActive?: boolean;

  /**
   * Menu theme
   * @default dark
   */
  theme?: TamanThemeModeType;
}

interface SubMenuProps extends TamanMenuRecordBadgeRaw {
  /**
   * Active-state icon
   */
  activeIcon?: string;
  /**
   * Whether the submenu is disabled
   */
  disabled?: boolean;
  /**
   * Icon
   */
  icon?: Component | string;
  /**
   * Submenu path/name
   */
  path: string;
}

interface MenuItemProps extends TamanMenuRecordBadgeRaw {
  /**
   * Active-state icon
   */
  activeIcon?: string;
  /**
   * Whether the menu item is disabled
   */
  disabled?: boolean;
  /**
   * Icon
   */
  icon?: Component | string;
  /**
   * Menu item path/name
   */
  path: string;
  /**
   * Query params carried by the menu item
   */
  query?: Recordable<any>;
}

interface MenuItemRegistered {
  active: boolean;
  parentPaths: Array<string>;
  path: string;
  query?: Recordable<any>;
}

interface MenuItemClicked {
  parentPaths: Array<string>;
  path: string;
}

interface MenuProvider {
  activePath?: string;
  addMenuItem: (item: MenuItemRegistered) => void;

  addSubMenu: (item: MenuItemRegistered) => void;
  closeMenu: (path: string, parentLinks: Array<string>) => void;
  handleMenuItemClick: (item: MenuItemClicked) => void;
  handleSubMenuClick: (subMenu: MenuItemRegistered) => void;
  isMenuPopup: boolean;
  items: Record<string, MenuItemRegistered>;

  openedMenus: Array<string>;
  openMenu: (path: string, parentLinks: Array<string>) => void;
  props: MenuProps;
  removeMenuItem: (item: MenuItemRegistered) => void;

  removeSubMenu: (item: MenuItemRegistered) => void;

  subMenus: Record<string, MenuItemRegistered>;
  theme: string;
}

interface SubMenuProvider {
  addSubMenu: (item: MenuItemRegistered) => void;
  handleMouseleave?: (deepDispatch: boolean) => void;
  level: number;
  mouseInChild: Ref<boolean>;
  removeSubMenu: (item: MenuItemRegistered) => void;
}

export type {
  MenuItemClicked,
  MenuItemProps,
  MenuItemRegistered,
  MenuProps,
  MenuProvider,
  SubMenuProps,
  SubMenuProvider,
};
