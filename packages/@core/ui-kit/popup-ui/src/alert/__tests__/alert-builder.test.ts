import type { App } from 'vue';

import PApp from 'pohon-ui/components/App.vue';
import { useOverlay } from 'pohon-ui/composables';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { computed, createApp, defineComponent, h, nextTick } from 'vue';

import {
  clearAllAlerts,
  tamanConfirm,
  tamanPrompt,
} from '../alert-builder';

vi.mock('@taman-core/composables', () => {
  const $t = Object.assign((key: string) => key, {
    value: (key: string) => key,
  });
  return {
    useScrollLock: () => computed({
      get: () => false,
      set: () => {},
    }),
    useSimpleLocale: () => ({ $t }),
  };
});

vi.mock('@taman-core/preferences', () => ({
  usePreferences: () => ({
    globalEscapeShortcutKey: { value: true },
  }),
}));

let activeApp: App | undefined;
const ForeignOverlay = defineComponent(() => () => h('div'));

async function mountOverlayHost() {
  const host = document.createElement('div');
  document.body.append(host);
  activeApp = createApp(defineComponent(() => () => h(PApp)));
  activeApp.mount(host);
  await nextTick();
}

async function clickButton(label: string) {
  await nextTick();
  await nextTick();
  const button = [...document.querySelectorAll('[type="button"]')].find(
    (element) => element.textContent?.trim() === label,
  );
  expect(button).toBeInstanceOf(HTMLElement);
  button?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  await nextTick();
  await nextTick();
}

afterEach(async () => {
  clearAllAlerts();
  await nextTick();
  activeApp?.unmount();
  activeApp = undefined;
  document.body.innerHTML = '';
});

describe('tamanAlert builder', () => {
  it('creates a confirmation through the in-app overlay registry', async () => {
    await mountOverlayHost();

    const confirmation = tamanConfirm({
      content: 'Continue?',
      title: 'Confirm',
    });

    await nextTick();
    expect(useOverlay().overlays).toHaveLength(1);

    void confirmation.catch(() => {});
  });

  it('resolves a confirmation after the user confirms it', async () => {
    await mountOverlayHost();

    const confirmation = tamanConfirm({ content: 'Continue?', title: 'Confirm' });
    await clickButton('confirm');

    await expect(confirmation).resolves.toBeUndefined();
    expect(useOverlay().overlays).toHaveLength(0);
  });

  it('rejects a confirmation after the user cancels it', async () => {
    await mountOverlayHost();

    const confirmation = tamanConfirm({ content: 'Continue?', title: 'Confirm' });
    await clickButton('cancel');

    await expect(confirmation).rejects.toThrow('dialog cancelled');
  });

  it('returns the prompt default value after confirmation', async () => {
    await mountOverlayHost();

    const prompt = tamanPrompt({
      content: 'Name',
      defaultValue: 'Ada',
      title: 'Prompt',
    });
    await clickButton('confirm');

    await expect(prompt).resolves.toBe('Ada');
    expect(useOverlay().overlays).toHaveLength(0);
  });

  it('settles pending alerts as cancellation during forced cleanup', async () => {
    await mountOverlayHost();

    const confirmation = tamanConfirm({ content: 'Continue?', title: 'Confirm' });
    await nextTick();
    clearAllAlerts();

    await expect(confirmation).rejects.toThrow('dialog cancelled');
    expect(useOverlay().overlays).toHaveLength(0);
  });

  it('clears alerts without closing a foreign Pohon overlay', async () => {
    await mountOverlayHost();

    const overlay = useOverlay();
    const foreign = overlay.create(ForeignOverlay, { destroyOnClose: true });
    const foreignResult = foreign.open();
    const confirmation = tamanConfirm({ content: 'Continue?', title: 'Confirm' });
    await nextTick();
    clearAllAlerts();

    expect(clearAllAlerts).not.toThrow();
    await expect(confirmation).rejects.toThrow('dialog cancelled');
    expect(overlay.overlays).toHaveLength(1);
    expect(overlay.overlays[0]?.id).toBe(foreign.id);

    foreign.close();
    overlay.unmount(foreign.id);
    await expect(foreignResult).resolves.toBeUndefined();
  });
});
