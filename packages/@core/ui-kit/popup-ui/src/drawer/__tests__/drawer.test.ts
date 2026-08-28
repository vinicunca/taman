import type { App } from 'vue';

import { ELEMENT_ID_MAIN_CONTENT } from '@taman-core/shared/constants';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createApp, defineComponent, h, nextTick } from 'vue';

import { useTamanDrawer } from '../use-taman-drawer';

vi.mock('@taman-core/preferences', () => ({
  usePreferences: () => ({
    globalEscapeShortcutKey: { value: true },
  }),
}));

let activeApp: App | undefined;

async function mountPreopenedDrawer() {
  const mainContent = document.createElement('main');
  mainContent.id = ELEMENT_ID_MAIN_CONTENT;
  mainContent.innerHTML = '<div><div></div></div>';
  document.body.append(mainContent);

  const Consumer = defineComponent(() => {
    const [Drawer, drawerApi] = useTamanDrawer({ appendToMain: true });
    drawerApi.open();
    return () => h(Drawer);
  });
  const host = document.createElement('div');
  document.body.append(host);

  activeApp = createApp(() => h(Consumer));
  activeApp.mount(host);
  await nextTick();

  return mainContent;
}

afterEach(() => {
  activeApp?.unmount();
  activeApp = undefined;
  document.body.innerHTML = '';
  vi.restoreAllMocks();
});

describe('taman drawer', () => {
  it('mounts an initially open drawer directly in the main content', async () => {
    const mainContent = await mountPreopenedDrawer();
    const dialog = document.querySelector('[role="dialog"]');

    expect(dialog).toBeInstanceOf(HTMLElement);
    if (!(dialog instanceof HTMLElement)) {
      return;
    }
    expect(dialog.parentElement).toBe(mainContent);
  });

  it('shows a drawer that is opened before mounting', async () => {
    await mountPreopenedDrawer();
    const dialog = document.querySelector('[role="dialog"]');

    expect(dialog).toBeInstanceOf(HTMLElement);
    if (!(dialog instanceof HTMLElement)) {
      return;
    }
    expect(dialog.classList.contains('hidden')).toBe(false);
  });
});
