import type { MenuProvider, SubMenuProvider } from '../menu.types';

import { getCurrentInstance, inject, provide } from 'vue';

import { TAMAN_MENU_ROOT_NAME, TAMAN_MENU_SUB_MENU_NAME } from '../menu.constants';
import { findComponentUpward } from '../menu.utils';

const menuContextKey = Symbol('menuContext');

/**
 * Provide menu context
 */
function createMenuContext(injectMenuData: MenuProvider) {
  provide(menuContextKey, injectMenuData);
}

/**
 * Provide menu context
 */
function createSubMenuContext(injectSubMenuData: SubMenuProvider) {
  const instance = getCurrentInstance();

  provide(`subMenu:${instance?.uid}`, injectSubMenuData);
}

/**
 * Inject menu context
 */
function useMenuContext() {
  const instance = getCurrentInstance();
  if (!instance) {
    throw new Error('instance is required');
  }
  const rootMenu = inject(menuContextKey) as MenuProvider;
  return rootMenu;
}

/**
 * Inject menu context
 */
function useSubMenuContext() {
  const instance = getCurrentInstance();
  if (!instance) {
    throw new Error('instance is required');
  }
  const parentMenu = findComponentUpward(instance, [TAMAN_MENU_ROOT_NAME, TAMAN_MENU_SUB_MENU_NAME]);
  const subMenu = inject(`subMenu:${parentMenu?.uid}`) as SubMenuProvider;
  return subMenu;
}

export {
  createMenuContext,
  createSubMenuContext,
  useMenuContext,
  useSubMenuContext,
};
