import type { SubMenuProvider } from '../menu.types';

import { computed, getCurrentInstance } from 'vue';

import { TAMAN_MENU_ROOT_NAME, TAMAN_MENU_SUB_MENU_NAME } from '../menu.constants';
import { findComponentUpward } from '../menu.utils';

function useMenu() {
  const instance = getCurrentInstance();
  if (!instance) {
    throw new Error('instance is required');
  }

  /**
   * All parent menu paths for the current item
   */
  const parentPaths = computed(() => {
    let parent = instance.parent;
    const paths: Array<string> = [instance.props.path as string];
    while (parent?.type.name !== TAMAN_MENU_ROOT_NAME) {
      if (parent?.props.path) {
        paths.unshift(parent.props.path as string);
      }
      parent = parent?.parent ?? null;
    }

    return paths;
  });

  const parentMenu = computed(() => {
    return findComponentUpward(instance, [TAMAN_MENU_ROOT_NAME, TAMAN_MENU_SUB_MENU_NAME]);
  });

  return {
    parentMenu,
    parentPaths,
  };
}

function useMenuStyle(menu?: SubMenuProvider) {
  const subMenuStyle = computed(() => {
    return {
      '--menu-level': menu ? (menu?.level ?? 0 + 1) : 0,
    };
  });
  return subMenuStyle;
}

export { useMenu, useMenuStyle };
