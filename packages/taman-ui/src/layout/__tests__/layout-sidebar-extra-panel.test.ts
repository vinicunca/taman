import type { App } from 'vue';

import { afterEach, describe, expect, it, vi } from 'vitest';
import { createApp, defineComponent, h } from 'vue';

import LayoutSidebar from '../components/taman-core-layout-sidebar.vue';

vi.mock('../composables/use-sidebar-drag', async (importOriginal) => {
  const actual
    = await importOriginal<typeof import('../composables/use-sidebar-drag')>();
  return {
    ...actual,
    useSidebarDrag: () => ({ startDrag: vi.fn(), endDrag: vi.fn() }),
  };
});

const MIXED_WIDTH = 80;
const EXTRA_WIDTH = 224;

let activeApp: App | undefined;

interface MountOptions {
  collapse?: boolean;
  /** Preference sidebar.expandOnHover; taman-core-layout binds it to both expandOnHover and fixedExtra */
  expandOnHover?: boolean;
  expandOnHovering?: boolean;
  extraVisible?: boolean;
  fixedExtra?: boolean;
}

function mountSidebar(options: MountOptions = {}) {
  const expandOnHover = options.expandOnHover ?? true;
  const Consumer = defineComponent(
    () => () =>
      h(LayoutSidebar, {
        collapse: options.collapse ?? false,
        expandOnHover,
        expandOnHovering: options.expandOnHovering ?? false,
        extraCollapse: false,
        extraVisible: options.extraVisible ?? false,
        extraWidth: EXTRA_WIDTH,
        fixedExtra: options.fixedExtra ?? expandOnHover,
        headerHeight: 50,
        isSidebarMixed: true,
        mixedWidth: MIXED_WIDTH,
        theme: 'dark',
        themeSub: 'dark',
        width: MIXED_WIDTH,
      }),
  );
  const host = document.createElement('div');
  document.body.append(host);
  activeApp = createApp(Consumer);
  activeApp.mount(host);
}

/** Width reserved by the placeholder that pushes the content in the flex flow */
function getPlaceholderWidth(): number {
  const placeholder = [...document.querySelectorAll('div')].find(
    (el) => (el as HTMLElement).style.flexBasis !== '',
  );
  if (!placeholder) {
    throw new TypeError('placeholder not rendered');
  }
  return Number.parseFloat((placeholder as HTMLElement).style.flexBasis);
}

/** Rendered width of the extra panel itself */
function getExtraPanelWidth(): number {
  const panel = [...document.querySelectorAll('aside > div')].find((el) =>
    el.classList.contains('fixed'),
  );
  if (!panel) {
    throw new TypeError('extra panel not rendered');
  }
  return Number.parseFloat((panel as HTMLElement).style.width);
}

afterEach(() => {
  activeApp?.unmount();
  activeApp = undefined;
  document.body.innerHTML = '';
  vi.restoreAllMocks();
});

/**
 * Panel width and reserved width must share one condition: taman-core-layout offsets the
 * header/content by sidebarExtraVisible only, so any mismatch makes the panel cover the content.
 * Pinned mode reserves space while expanded; hover mode renders the panel as an overlay.
 */
describe('layout-sidebar extra panel', () => {
  it('pinned: expands and reserves space when there are extra menus', () => {
    mountSidebar({ expandOnHover: true, extraVisible: true });

    expect(getExtraPanelWidth()).toBe(EXTRA_WIDTH);
    expect(getPlaceholderWidth()).toBe(MIXED_WIDTH + EXTRA_WIDTH);
  });

  it('still expands when the caller passes expandOnHover without fixedExtra', () => {
    mountSidebar({
      expandOnHover: true,
      extraVisible: true,
      fixedExtra: false,
    });

    expect(getExtraPanelWidth()).toBe(EXTRA_WIDTH);
    expect(getPlaceholderWidth()).toBe(MIXED_WIDTH + EXTRA_WIDTH);
  });

  it('pinned: collapses when the page belongs to no menu, so it does not cover content', () => {
    mountSidebar({ expandOnHover: true, extraVisible: false });

    expect(getExtraPanelWidth()).toBe(0);
    expect(getPlaceholderWidth()).toBe(MIXED_WIDTH);
  });

  it('hover mode: does not render the panel when not hovering, even if extraVisible is stale', () => {
    mountSidebar({
      expandOnHover: false,
      expandOnHovering: false,
      extraVisible: true,
    });

    expect(getExtraPanelWidth()).toBe(0);
    expect(getPlaceholderWidth()).toBe(MIXED_WIDTH);
  });

  it('hover mode: expands as an overlay while hovering without pushing content', () => {
    mountSidebar({
      expandOnHover: false,
      expandOnHovering: true,
      extraVisible: true,
    });

    expect(getExtraPanelWidth()).toBe(EXTRA_WIDTH);
    expect(getPlaceholderWidth()).toBe(MIXED_WIDTH);
  });

  it('collapsed: neither renders the panel nor reserves space', () => {
    mountSidebar({ collapse: true, expandOnHover: true, extraVisible: true });

    expect(getExtraPanelWidth()).toBe(0);
    expect(getPlaceholderWidth()).toBe(MIXED_WIDTH);
  });
});
