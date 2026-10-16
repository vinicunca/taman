import type { App } from 'vue';
import type { TamanMenuRecordRaw } from '@taman/types';

import { describe, expect, it, vi } from 'vitest';
import { computed, createApp } from 'vue';

import { useMenuExtra } from '../use-menu-extra';

// preferences is a module-level singleton; a mutable mock controls layout and expand behavior
const mockPreferences = vi.hoisted(() => ({
  app: { layout: 'sidebar-mixed-nav' },
  sidebar: { expandOnHover: true },
}));

vi.mock('@vinicunca/taman-core/preferences', () => ({
  preferences: mockPreferences,
}));

const routeHolder = vi.hoisted(() => ({
  current: {
    meta: {},
    path: '/',
  } as { meta: Record<string, unknown>; path: string },
}));

vi.mock('vue-router', () => ({
  useRoute: () => routeHolder.current,
}));

vi.mock('@taman/stores', () => ({
  useAccessStore: () => ({ accessMenus: [] }),
}));

vi.mock('../use-navigation', () => ({
  useNavigation: () => ({
    navigation: vi.fn(),
    willOpenedByWindow: () => false,
  }),
}));

/**
 * Menus generated from router.getRoutes(): top-level menus have no parents.
 * Reproduces a default child route with an empty path, where parent and child both resolve to /cards.
 */
function createMenus(): Array<TamanMenuRecordRaw> {
  return [
    {
      name: 'Cards',
      path: '/cards',
      children: [
        {
          name: 'Card list',
          path: '/cards',
          parent: '/cards',
          parents: ['/cards'],
          children: [],
        },
      ],
    },
    {
      name: 'Transactions',
      path: '/transactions',
      children: [
        {
          name: 'Normalized transactions',
          path: '/transactions/normalized',
          parent: '/transactions',
          parents: ['/transactions'],
          children: [],
        },
      ],
    },
  ];
}

let activeApp: App | undefined;

function mountMenuExtra(menus: Array<TamanMenuRecordRaw>) {
  const holder: { api?: ReturnType<typeof useMenuExtra> } = {};
  const host = document.createElement('div');
  document.body.append(host);
  activeApp = createApp({
    setup() {
      holder.api = useMenuExtra(computed(() => menus));
      return () => null;
    },
  });
  activeApp.mount(host);
  if (!holder.api) {
    throw new Error('useMenuExtra was not mounted');
  }
  return holder.api;
}

function cleanup() {
  activeApp?.unmount();
  activeApp = undefined;
  document.body.innerHTML = '';
  routeHolder.current = { meta: {}, path: '/' };
  mockPreferences.sidebar.expandOnHover = true;
}

function setPath(path: string) {
  routeHolder.current = { meta: {}, path };
}

describe('useMenuExtra', () => {
  it('resolves extra menus when a default child route shares its parent path', async () => {
    try {
      setPath('/cards');
      const { extraActiveMenu, extraMenus, sidebarExtraVisible }
        = mountMenuExtra(createMenus());

      await vi.waitFor(() => {
        expect(extraMenus.value).toHaveLength(1);
      });
      expect(extraMenus.value[0]?.name).toBe('Card list');
      expect(extraActiveMenu.value).toBe('/cards');
      expect(sidebarExtraVisible.value).toBe(true);
    } finally {
      cleanup();
    }
  });

  it('still resolves sibling extra menus for regular nested paths', async () => {
    try {
      setPath('/transactions/normalized');
      const { extraActiveMenu, extraMenus } = mountMenuExtra(createMenus());

      await vi.waitFor(() => {
        expect(extraMenus.value).toHaveLength(1);
      });
      expect(extraMenus.value[0]?.name).toBe('Normalized transactions');
      expect(extraActiveMenu.value).toBe('/transactions');
    } finally {
      cleanup();
    }
  });

  it('keeps extra menus empty and the panel closed for paths outside the menu tree', async () => {
    try {
      setPath('/non-existent');
      const { extraActiveMenu, extraMenus, sidebarExtraVisible }
        = mountMenuExtra(createMenus());

      await vi.waitFor(() => {
        expect(extraMenus.value).toHaveLength(0);
      });
      expect(extraActiveMenu.value).toBe('');
      expect(sidebarExtraVisible.value).toBe(false);
    } finally {
      cleanup();
    }
  });

  it('unpinned: keeps the panel closed for paths outside the menu tree', async () => {
    try {
      mockPreferences.sidebar.expandOnHover = false;
      setPath('/non-existent');
      const { extraMenus, sidebarExtraVisible } = mountMenuExtra(createMenus());

      await vi.waitFor(() => {
        expect(extraMenus.value).toHaveLength(0);
      });
      expect(sidebarExtraVisible.value).toBe(false);
    } finally {
      cleanup();
    }
  });

  it('resets a stale hover-opened panel when there are no extra menus', async () => {
    try {
      setPath('/non-existent');
      const { sidebarExtraVisible } = mountMenuExtra(createMenus());

      sidebarExtraVisible.value = true;
      await vi.waitFor(() => {
        expect(sidebarExtraVisible.value).toBe(false);
      });
    } finally {
      cleanup();
    }
  });

  it('restores extra menus for the current path on sidebar mouse leave', async () => {
    try {
      mockPreferences.sidebar.expandOnHover = false;
      setPath('/cards');
      const { extraMenus, handleMenuMouseEnter, handleSideMouseLeave }
        = mountMenuExtra(createMenus());

      await vi.waitFor(() => {
        expect(extraMenus.value).toHaveLength(1);
      });

      handleMenuMouseEnter(createMenus()[1] as TamanMenuRecordRaw);
      expect(extraMenus.value[0]?.name).toBe('Normalized transactions');

      handleSideMouseLeave();
      expect(extraMenus.value).toHaveLength(1);
      expect(extraMenus.value[0]?.name).toBe('Card list');
    } finally {
      cleanup();
    }
  });

  it('restores extra menus via activePath on mouse leave for hidden detail pages', async () => {
    try {
      mockPreferences.sidebar.expandOnHover = false;
      routeHolder.current = {
        meta: { activePath: '/cards' },
        path: '/cards/17',
      };
      const { extraMenus, handleMenuMouseEnter, handleSideMouseLeave }
        = mountMenuExtra(createMenus());

      await vi.waitFor(() => {
        expect(extraMenus.value).toHaveLength(1);
      });
      expect(extraMenus.value[0]?.name).toBe('Card list');

      handleMenuMouseEnter(createMenus()[1] as TamanMenuRecordRaw);
      expect(extraMenus.value[0]?.name).toBe('Normalized transactions');

      handleSideMouseLeave();
      expect(extraMenus.value).toHaveLength(1);
      expect(extraMenus.value[0]?.name).toBe('Card list');
    } finally {
      cleanup();
    }
  });
});
