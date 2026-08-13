import type { TamanMenuRecordRaw } from '@taman-core/typings';

function findMenuByPath(
  list: TamanMenuRecordRaw[],
  path?: string,
): TamanMenuRecordRaw | null {
  for (const menu of list) {
    if (menu.path === path) {
      return menu;
    }
    const findMenu = menu.children && findMenuByPath(menu.children, path);
    if (findMenu) {
      return findMenu;
    }
  }
  return null;
}

/**
 * Finds the root menu for a given path.
 * @param menus
 * @param path
 */
function findRootMenuByPath(menus: TamanMenuRecordRaw[], path?: string, level = 0) {
  const findMenu = findMenuByPath(menus, path);
  const rootMenuPath = findMenu?.parents?.[level];
  const rootMenu = rootMenuPath
    ? menus.find((item) => item.path === rootMenuPath)
    : undefined;
  return {
    findMenu,
    rootMenu,
    rootMenuPath,
  };
}

export { findMenuByPath, findRootMenuByPath };
