import type { App } from 'vue';
import type { TamanMenuRecordRaw } from '@taman/types';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { computed, createApp, nextTick, reactive } from 'vue';
import { useMenuExtra } from '../use-menu-extra';
import { useMenuMixed } from '../use-menu-mixed';

const fixture = vi.hoisted(() => ({
  route: { path: '/cards', meta: {} as Record<string, unknown> },
  preferences: {
    app: { layout: 'mixed-nav' },
    sidebar: { enable: true, expandOnHover: false, autoActivateChild: true },
    navigation: { split: true },
  },
  store: { accessMenus: [] as Array<TamanMenuRecordRaw> },
}));

vi.mock('vue-router', () => ({
  useRoute: () => fixture.route,
}));
vi.mock('@taman/stores', () => ({
  useAccessStore: () => fixture.store,
}));
vi.mock('@vinicunca/taman-core/preferences', () => ({
  get preferences() {
    return fixture.preferences;
  },
  usePreferences: () => ({
    isMixedNav: computed(() => fixture.preferences.app.layout === 'mixed-nav'),
    isHeaderMixedNav: computed(() => fixture.preferences.app.layout === 'header-mixed-nav'),
    isMobile: computed(() => false),
  }),
}));
vi.mock('../use-navigation', () => ({
  useNavigation: () => ({
    navigation: vi.fn(),
    willOpenedByWindow: () => false,
  }),
}));

let app: App | undefined;

beforeEach(() => {
  fixture.route = reactive({ path: '/cards', meta: {} });
  fixture.preferences.app.layout = 'mixed-nav';
  fixture.store.accessMenus = ['/cards', '/transactions'].map((path) => ({
    name: path,
    path,
    children: [
      {
        name: `${path} list`,
        path: `${path}/list`,
        parents: [path],
      },
    ],
  }));
});

afterEach(() => {
  app?.unmount();
  document.body.innerHTML = '';
});

function mountMenu(kind: 'extra' | 'mixed') {
  let result!: { menus: { value: Array<TamanMenuRecordRaw> }; active: { value: string }; visible: { value: boolean } };
  let extra: ReturnType<typeof useMenuExtra> | undefined;
  app = createApp({
    setup() {
      if (kind === 'extra') {
        extra = useMenuExtra(computed(() => fixture.store.accessMenus));
        result = { menus: extra.extraMenus, active: extra.extraActiveMenu, visible: extra.sidebarExtraVisible };
      } else {
        const mixed = useMenuMixed();
        result = { menus: mixed.sidebarMenus, active: mixed.headerActive, visible: mixed.sidebarVisible };
      }
      return () => null;
    },
  });
  const host = document.createElement('div');
  document.body.append(host);
  app.mount(host);
  return { ...result, extra };
}

describe('menu sections outside the menu tree', () => {
  it.each(['extra', 'mixed'] as const)('%s retains the selected section and resumes matching on return', async (kind) => {
    const menu = mountMenu(kind);
    expect(menu.menus.value[0]?.path).toBe('/cards/list');
    fixture.route.path = '/profile';
    await nextTick();
    expect(menu.menus.value[0]?.path).toBe('/cards/list');
    expect(menu.active.value).toBe('/cards');
    expect(menu.visible.value).toBe(true);

    fixture.route.path = '/transactions/list';
    await nextTick();
    expect(menu.menus.value[0]?.path).toBe('/transactions/list');
    expect(menu.active.value).toBe('/transactions');
  });

  it.each(['extra', 'mixed'] as const)('%s stays empty when initially outside the menu tree', (kind) => {
    fixture.route.path = '/profile';
    const menu = mountMenu(kind);
    expect(menu.menus.value).toEqual([]);
    expect(menu.visible.value).toBe(false);
  });

  it('restores the last matched extra section after previewing another section', async () => {
    const menu = mountMenu('extra');
    fixture.route.path = '/profile';
    await nextTick();
    menu.extra!.handleMenuMouseEnter(fixture.store.accessMenus[1]!);
    expect(menu.menus.value[0]?.path).toBe('/transactions/list');
    menu.extra!.handleSideMouseLeave();
    expect(menu.menus.value[0]?.path).toBe('/cards/list');
    expect(menu.active.value).toBe('/cards');
    expect(menu.visible.value).toBe(true);
  });
});
