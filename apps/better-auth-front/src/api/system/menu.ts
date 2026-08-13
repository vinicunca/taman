import type { Recordable } from '@taman/types';

import { requestClient } from '#/api/request';

export namespace SystemMenuApi {
  /** Badge color variants */
  export const BadgeVariants = [
    'default',
    'destructive',
    'primary',
    'success',
    'warning',
  ] as const;
  /** Badge type variants */
  export const BadgeTypes = ['dot', 'normal'] as const;
  /** Menu type variants */
  export const MenuTypes = [
    'catalog',
    'menu',
    'embedded',
    'link',
    'button',
  ] as const;
  /** System menu */
  export interface SystemMenu {
    [key: string]: any;
    /** Backend permission code */
    authCode: string;
    /** Children */
    children?: SystemMenu[];
    /** Component */
    component?: string;
    /** Menu ID */
    id: string;
    /** Menu metadata */
    meta?: {
      /** Icon shown when active */
      activeIcon?: string;
      /** Path of the menu to activate when used as a route */
      activePath?: string;
      /** Pin to tab bar */
      affixTab?: boolean;
      /** Order when pinned in tab bar */
      affixTabOrder?: number;
      /** Badge content (valid when badge type is normal) */
      badge?: string;
      /** Badge type */
      badgeType?: (typeof BadgeTypes)[number];
      /** Badge color */
      badgeVariants?: (typeof BadgeVariants)[number];
      /** Hide children in menu */
      hideChildrenInMenu?: boolean;
      /** Hide in breadcrumb */
      hideInBreadcrumb?: boolean;
      /** Hide in menu */
      hideInMenu?: boolean;
      /** Hide in tab bar */
      hideInTab?: boolean;
      /** Menu icon */
      icon?: string;
      /** Embedded iframe URL */
      iframeSrc?: string;
      /** Whether to cache the page */
      keepAlive?: boolean;
      /** External link URL */
      link?: string;
      /** Max number of tabs open for the same route */
      maxNumOfOpenTab?: number;
      /** Skip basic layout */
      noCoreLayout?: boolean;
      /** Open in new window */
      openInNewWindow?: boolean;
      /** Menu sort order */
      order?: number;
      /** Extra route query params */
      query?: Recordable<any>;
      /** Menu title */
      title?: string;
    };
    /** Menu name */
    name: string;
    /** Route path */
    path: string;
    /** Parent ID */
    pid: string;
    /** Redirect */
    redirect?: string;
    /** Menu type */
    type: (typeof MenuTypes)[number];
  }
}

/**
 * Get menu list data
 */
async function getMenuList() {
  return requestClient.get<Array<SystemMenuApi.SystemMenu>>(
    '/system/menu/list',
  );
}

async function isMenuNameExists(
  name: string,
  id?: SystemMenuApi.SystemMenu['id'],
) {
  return requestClient.get<boolean>('/system/menu/name-exists', {
    params: { id, name },
  });
}

async function isMenuPathExists(
  path: string,
  id?: SystemMenuApi.SystemMenu['id'],
) {
  return requestClient.get<boolean>('/system/menu/path-exists', {
    params: { id, path },
  });
}

/**
 * Create menu
 * @param data Menu data
 */
async function createMenu(
  data: Omit<SystemMenuApi.SystemMenu, 'children' | 'id'>,
) {
  return requestClient.post('/system/menu', data);
}

/**
 * Update menu
 *
 * @param id Menu ID
 * @param data Menu data
 */
async function updateMenu(
  id: string,
  data: Omit<SystemMenuApi.SystemMenu, 'children' | 'id'>,
) {
  return requestClient.put(`/system/menu/${id}`, data);
}

/**
 * Delete menu
 * @param id Menu ID
 */
async function deleteMenu(id: string) {
  return requestClient.delete(`/system/menu/${id}`);
}

export {
  createMenu,
  deleteMenu,
  getMenuList,
  isMenuNameExists,
  isMenuPathExists,
  updateMenu,
};
