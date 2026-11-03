import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createRouter, createWebHistory } from 'vue-router';

import { getTabKey, useTabbarStore } from './tabbar';

describe('useAccessStore', () => {
  const router = createRouter({
    history: createWebHistory(),
    routes: [],
  });
  router.push = vi.fn();
  router.replace = vi.fn();
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it('adds a new tab', () => {
    const store = useTabbarStore();
    const tab: any = {
      fullPath: '/home',
      meta: {},
      key: '/home',
      name: 'Home',
      path: '/home',
    };
    const addNewTab = store.addTab(tab);
    expect(store.tabs.length).toBe(1);
    expect(store.tabs[0]).toEqual(addNewTab);
  });

  it('adds a new tab if it does not exist', () => {
    const store = useTabbarStore();
    const newTab: any = {
      fullPath: '/new',
      meta: {},
      name: 'New',
      path: '/new',
    };
    const addNewTab = store.addTab(newTab);
    expect(store.tabs).toContainEqual(addNewTab);
  });

  it('honors a fullPathKey inherited from a parent route', () => {
    const route: any = {
      fullPath: '/detail?id=7',
      matched: [
        {
          meta: { fullPathKey: false },
        },
        {
          meta: { title: 'Detail' },
        },
      ],
      meta: { fullPathKey: false },
      name: 'Detail',
      path: '/detail',
      query: { id: '7' },
    };

    // Route `meta` fields are merged with those of parent records; `fullPathKey` is an inheritable configuration.
    expect(getTabKey(route)).toBe('/detail');
  });

  it('updates an existing tab instead of adding a new one', () => {
    const store = useTabbarStore();
    const initialTab: any = {
      fullPath: '/existing',
      meta: {
        fullPathKey: false,
      },
      name: 'Existing',
      path: '/existing',
      query: {},
    };
    store.addTab(initialTab);
    const updatedTab = {
      ...initialTab,
      query: { id: '1' },
    };
    store.addTab(updatedTab);
    expect(store.tabs.length).toBe(1);
    expect(store.tabs[0]?.query).toEqual({ id: '1' });
  });

  it('closes all tabs', async () => {
    const store = useTabbarStore();
    store.addTab({
      fullPath: '/home',
      meta: {},
      name: 'Home',
      path: '/home',
    } as any);
    router.replace = vi.fn();

    await store.closeAllTabs(router);

    expect(store.tabs.length).toBe(1);
  });

  it('closes a non-affix tab', () => {
    const store = useTabbarStore();
    const tab: any = {
      fullPath: '/closable',
      meta: {},
      name: 'Closable',
      path: '/closable',
    };
    store.tabs.push(tab);
    store._close(tab);
    expect(store.tabs.length).toBe(0);
  });

  it('does not close an affix tab', () => {
    const store = useTabbarStore();
    const affixTab: any = {
      fullPath: '/affix',
      meta: { affixTab: true },
      name: 'Affix',
      path: '/affix',
    };
    store.tabs.push(affixTab);
    store._close(affixTab);
    expect(store.tabs.length).toBe(1); // Affix tab should not be closed
  });

  it('returns all cache tabs', () => {
    const store = useTabbarStore();
    store.cachedTabs.add('Home');
    store.cachedTabs.add('About');
    expect(store.getCachedTabs).toEqual(['Home', 'About']);
  });

  it('returns all tabs, including affix tabs', () => {
    const store = useTabbarStore();
    const normalTab: any = {
      fullPath: '/normal',
      meta: {},
      name: 'Normal',
      path: '/normal',
    };
    const affixTab: any = {
      fullPath: '/affix',
      meta: { affixTab: true },
      name: 'Affix',
      path: '/affix',
    };
    store.tabs.push(normalTab);
    store.affixTabs.push(affixTab);
    expect(store.getTabs).toContainEqual(normalTab);
    expect(store.affixTabs).toContainEqual(affixTab);
  });

  it('navigates to a specific tab', async () => {
    const store = useTabbarStore();
    const tab: any = { meta: {}, name: 'Dashboard', path: '/dashboard' };

    await store._goToTab(tab, router);

    expect(router.replace).toHaveBeenCalledWith({
      params: {},
      path: '/dashboard',
      query: {},
    });
  });

  it('closes multiple tabs by paths', async () => {
    const store = useTabbarStore();
    store.addTab({
      fullPath: '/home',
      meta: {},
      name: 'Home',
      path: '/home',
    } as any);
    store.addTab({
      fullPath: '/about',
      meta: {},
      name: 'About',
      path: '/about',
    } as any);
    store.addTab({
      fullPath: '/contact',
      meta: {},
      name: 'Contact',
      path: '/contact',
    } as any);

    await store._bulkCloseByKeys(['/home', '/contact']);

    expect(store.tabs).toHaveLength(1);
    expect(store.tabs[0]?.name).toBe('About');
  });

  it('closes all tabs to the left of the specified tab', async () => {
    const store = useTabbarStore();
    store.addTab({
      fullPath: '/home',
      meta: {},
      name: 'Home',
      path: '/home',
    } as any);
    store.addTab({
      fullPath: '/about',
      meta: {},
      name: 'About',
      path: '/about',
    } as any);
    const targetTab: any = {
      fullPath: '/contact',
      meta: {},
      name: 'Contact',
      path: '/contact',
    };
    const addTargetTab = store.addTab(targetTab);
    await store.closeLeftTabs(addTargetTab);

    expect(store.tabs).toHaveLength(1);
    expect(store.tabs[0]?.name).toBe('Contact');
  });

  it('closes all tabs except the specified tab', async () => {
    const store = useTabbarStore();
    store.addTab({
      fullPath: '/home',
      meta: {},
      name: 'Home',
      path: '/home',
    } as any);
    const targetTab: any = {
      fullPath: '/about',
      meta: {},
      name: 'About',
      path: '/about',
    };
    const addTargetTab = store.addTab(targetTab);
    store.addTab({
      fullPath: '/contact',
      meta: {},
      name: 'Contact',
      path: '/contact',
    } as any);

    await store.closeOtherTabs(addTargetTab);

    expect(store.tabs).toHaveLength(1);
    expect(store.tabs[0]?.name).toBe('About');
  });

  it('closes all tabs to the right of the specified tab', async () => {
    const store = useTabbarStore();
    const targetTab: any = {
      fullPath: '/home',
      meta: {},
      name: 'Home',
      path: '/home',
    };
    const addTargetTab = store.addTab(targetTab);
    store.addTab({
      fullPath: '/about',
      meta: {},
      name: 'About',
      path: '/about',
    } as any);
    store.addTab({
      fullPath: '/contact',
      meta: {},
      name: 'Contact',
      path: '/contact',
    } as any);

    await store.closeRightTabs(addTargetTab);

    expect(store.tabs).toHaveLength(1);
    expect(store.tabs[0]?.name).toBe('Home');
  });

  it('closes the tab with the specified key', async () => {
    const store = useTabbarStore();
    const keyToClose = '/about';
    store.addTab({
      fullPath: '/home',
      meta: {},
      name: 'Home',
      path: '/home',
    } as any);
    store.addTab({
      fullPath: keyToClose,
      meta: {},
      name: 'About',
      path: '/about',
    } as any);
    store.addTab({
      fullPath: '/contact',
      meta: {},
      name: 'Contact',
      path: '/contact',
    } as any);

    await store.closeTabByKey(keyToClose, router);

    expect(store.tabs).toHaveLength(2);
    expect(
      store.tabs.find((tab) => tab.fullPath === keyToClose),
    ).toBeUndefined();
  });

  it('closes a tab whose key contains an encoded percent sign', async () => {
    const store = useTabbarStore();
    store.addTab({
      fullPath: '/home',
      meta: {},
      name: 'Home',
      path: '/home',
    } as any);
    store.addTab({
      fullPath: '/search?q=50%25',
      meta: {},
      name: 'Search',
      path: '/search',
    } as any);

    // The key of the tab is decoded when addTab is called, here is "/search?q=50%"
    const keyToClose = store.tabs[1]?.key as string;
    expect(keyToClose).toBe('/search?q=50%');

    await expect(
      store.closeTabByKey(keyToClose, router),
    ).resolves.toBeUndefined();
    expect(store.tabs.map((tab) => tab.name)).toEqual(['Home']);
  });

  it('prefers an exact key match over decoding the key again', async () => {
    const store = useTabbarStore();
    store.addTab({
      fullPath: '/home',
      meta: {},
      name: 'Home',
      path: '/home',
    } as any);
    store.addTab({
      fullPath: '/search?q=50%2520off',
      meta: {},
      name: 'Nested',
      path: '/search',
    } as any);
    store.addTab({
      fullPath: '/search?q=50%20off',
      meta: {},
      name: 'Decoded',
      path: '/search',
    } as any);

    // The keys of the two tabs after decoding are "50%20off" and "50 off"
    expect(store.tabs.map((tab) => tab.key)).toEqual([
      '/home',
      '/search?q=50%20off',
      '/search?q=50 off',
    ]);

    const keyToClose = store.tabs[1]?.key as string;
    await store.closeTabByKey(keyToClose, router);
    expect(store.tabs.map((tab) => tab.name)).toEqual(['Home', 'Decoded']);
  });

  it('refreshes the current tab', async () => {
    const store = useTabbarStore();
    const currentTab: any = {
      fullPath: '/dashboard',
      meta: { name: 'Dashboard' },
      name: 'Dashboard',
      path: '/dashboard',
    };
    router.currentRoute.value = currentTab;

    await store.refresh(router);

    expect(store.excludeCachedTabs.has('Dashboard')).toBe(false);
    expect(store.renderRouteView).toBe(true);
  });

  it('sorts tabs by the rendered order, which puts affix tabs first', async () => {
    const store = useTabbarStore();
    // First open two normal tabs, then register the fixed tabs (this happens when accessMenus changes)
    for (const tab of [
      {
        fullPath: '/a',
        meta: {},
        name: 'A',
        path: '/a',
      },
      {
        fullPath: '/b',
        meta: {},
        name: 'B',
        path: '/b',
      },
      {
        fullPath: '/home',
        meta: { affixTab: true },
        name: 'Home',
        path: '/home',
      },
    ]) {
      store.addTab(tab as any);
    }

    expect(store.tabs.map((item) => item.key)).toEqual(['/a', '/b', '/home']);
    expect(store.getTabs.map((item) => item.key)).toEqual([
      '/home',
      '/a',
      '/b',
    ]);

    // The drag callback gives the index of the rendered order: put /b before /a
    await store.sortTabs(2, 1);

    expect(store.getTabs.map((item) => item.key)).toEqual([
      '/home',
      '/b',
      '/a',
    ]);
  });

  it('pins a tab at its rendered position', async () => {
    const store = useTabbarStore();
    const add = (name: string, affix = false) =>
      store.addTab({
        fullPath: `/${name.toLowerCase()}`,
        meta: affix
          ? { affixTab: true }
          : {},
        name,
        path: `/${name.toLowerCase()}`,
      } as any);
    add('A');
    add('B');
    add('P1', true);
    add('P2', true);

    // The fixed tabs are at the end of the array, and are rendered first
    expect(store.tabs.map((item) => item.name)).toEqual(['A', 'B', 'P1', 'P2']);
    expect(store.getTabs.map((item) => item.name)).toEqual([
      'P1',
      'P2',
      'A',
      'B',
    ]);

    // The original index of B is 1, the rendered index is 3
    await store.pinTab(store.tabs[1] as any);

    expect(store.getTabs.map((item) => item.name)).toEqual([
      'B',
      'P1',
      'P2',
      'A',
    ]);
  });

  it('unpins a tab at its rendered position', async () => {
    const store = useTabbarStore();
    // eslint-disable-next-line sonarjs/no-identical-functions
    const add = (name: string, affix = false) =>
      store.addTab({
        fullPath: `/${name.toLowerCase()}`,
        meta: affix
          ? { affixTab: true }
          : {},
        name,
        path: `/${name.toLowerCase()}`,
      } as any);
    add('A');
    add('B');
    add('P1', true);
    add('P2', true);

    // After unpinning, the original index of P1 is 2, the rendered index is 3
    await store.unpinTab(store.tabs[2] as any);

    expect(store.getTabs.map((item) => item.name)).toEqual([
      'P2',
      'P1',
      'A',
      'B',
    ]);
  });
});
