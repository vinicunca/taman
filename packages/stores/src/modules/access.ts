import type { TamanMenuRecordRaw } from '@taman-core/typings';
import type { RouteRecordRaw } from 'vue-router';

import { acceptHMRUpdate, defineStore } from 'pinia';

interface AccessState {
  /**
   * Permission codes.
   */
  accessCodes: Array<string>;
  /**
   * Accessible menu list.
   */
  accessMenus: Array<TamanMenuRecordRaw>;
  /**
   * Accessible route list.
   */
  accessRoutes: Array<RouteRecordRaw>;
  /**
   * Whether access has been checked.
   */
  isAccessChecked: boolean;
  /**
   * Whether the screen is locked.
   */
  isLockScreen: boolean;
  /**
   * Lock screen password.
   */
  lockScreenPassword?: string;
}

/**
 * Access and permission store.
 */
export const useAccessStore = defineStore('core-access', {
  actions: {
    getMenuByPath(path: string) {
      function findMenu(
        menus: Array<TamanMenuRecordRaw>,
        path: string,
      ): TamanMenuRecordRaw | undefined {
        for (const menu of menus) {
          if (menu.path === path) {
            return menu;
          }
          if (menu.children) {
            const matched = findMenu(menu.children, path);
            if (matched) {
              return matched;
            }
          }
        }
      }
      return findMenu(this.accessMenus, path);
    },
    lockScreen(password: string) {
      this.isLockScreen = true;
      this.lockScreenPassword = password;
    },
    setAccessCodes(codes: Array<string>) {
      this.accessCodes = codes;
    },
    setAccessMenus(menus: Array<TamanMenuRecordRaw>) {
      this.accessMenus = menus;
    },
    setAccessRoutes(routes: Array<RouteRecordRaw>) {
      this.accessRoutes = routes;
    },
    setIsAccessChecked(isAccessChecked: boolean) {
      this.isAccessChecked = isAccessChecked;
    },
    unlockScreen() {
      this.isLockScreen = false;
      this.lockScreenPassword = undefined;
    },
  },
  persist: {
    // Persist selected fields
    pick: [
      'accessCodes',
      'isLockScreen',
      'lockScreenPassword',
    ],
  },
  state: (): AccessState => ({
    accessCodes: [],
    accessMenus: [],
    accessRoutes: [],
    isAccessChecked: false,
    isLockScreen: false,
    lockScreenPassword: undefined,
  }),
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useAccessStore, import.meta.hot));
}
