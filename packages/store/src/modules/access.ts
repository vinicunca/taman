import type { MenuRecordRaw } from '@taman-core/typings';
import type { RouteRecordRaw } from 'vue-router';

import { acceptHMRUpdate, defineStore } from 'pinia';

interface AccessState {
  /**
   * Accessible menu list
   */
  accessMenus: Array<MenuRecordRaw>;
  /**
   * Accessible routes list
   */
  accessRoutes: Array<RouteRecordRaw>;
  /**
   * Whether the access has been checked
   */
  isAccessChecked: boolean;
}

export const useAccessStore = defineStore('core-access', {
  state: (): AccessState => ({
    accessMenus: [],
    accessRoutes: [],
    isAccessChecked: false,
  }),

  actions: {
    setAccessMenus(menus: Array<MenuRecordRaw>) {
      this.accessMenus = menus;
    },
    setAccessRoutes(routes: Array<RouteRecordRaw>) {
      this.accessRoutes = routes;
    },
    setIsAccessChecked(isChecked: boolean) {
      this.isAccessChecked = isChecked;
    },
  },
});

const hot = import.meta.hot;
if (hot) {
  hot.accept(acceptHMRUpdate(useAccessStore, hot));
}
