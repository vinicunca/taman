import type { App } from 'vue';
import { ELEMENT_ID_LAYOUT_SCROLL, ELEMENT_ID_MAIN_CONTENT } from '@vinicunca/taman-core/constants';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createApp, defineComponent, h, KeepAlive, nextTick, onMounted, ref } from 'vue';
import { useTamanDialog } from './dialog/use-taman-dialog';
import { useTamanDrawer } from './drawer/use-taman-drawer';

vi.mock('@vinicunca/taman-core/preferences', () => ({
  usePreferences: () => ({ globalEscapeShortcutKey: { value: true } }),
}));

let app: App | undefined;
async function flush() {
  await nextTick();
  await nextTick();
  await nextTick();
}

afterEach(() => {
  app?.unmount();
  document.body.innerHTML = '';
  document.body.style.cssText = '';
  vi.useRealTimers();
});

async function mountCachedPopup(kind: 'dialog' | 'drawer', destroyOnClose: boolean, appendToMain = true) {
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'requestAnimationFrame', 'cancelAnimationFrame'] });
  const main = document.createElement('main');
  main.id = ELEMENT_ID_MAIN_CONTENT;
  document.body.append(main);
  const scroll = document.createElement('div');
  scroll.id = ELEMENT_ID_LAYOUT_SCROLL;
  scroll.style.overflow = 'auto';
  Object.defineProperties(scroll, { clientHeight: { value: 100 }, scrollHeight: { value: 200 } });
  document.body.append(scroll);

  const active = ref(true);
  const onBeforeClose = vi.fn();
  const onClosed = vi.fn();
  const onOpened = vi.fn();
  const onOpenChange = vi.fn();
  let api!: ReturnType<typeof useTamanDialog>[1] | ReturnType<typeof useTamanDrawer>[1];
  const Draft = defineComponent({
    setup() {
      const text = ref('');
      return () => h('input', {
        'data-draft': '',
        'value': text.value,
        'onInput': (event: Event) => {
          text.value = (event.target as HTMLInputElement).value;
        },
      });
    },
  });
  const Page = defineComponent({
    setup() {
      const options = { appendToMain, destroyOnClose, title: 'Cached popup', onBeforeClose, onClosed, onOpened, onOpenChange };
      const [Popup, popupApi] = kind === 'dialog' ? useTamanDialog(options) : useTamanDrawer(options);
      api = popupApi;
      onMounted(() => popupApi.open());
      return () => h(Popup, {}, { default: () => h(Draft) });
    },
  });
  const Other = defineComponent(() => () => h('p', 'Other page'));
  const host = document.createElement('div');
  document.body.append(host);
  app = createApp(() => h(KeepAlive, {}, { default: () => h(active.value ? Page : Other) }));
  app.mount(host);
  await flush();
  return { active, api, main, scroll, onBeforeClose, onClosed, onOpened, onOpenChange };
}

describe.each(['dialog', 'drawer'] as const)('cached %s', (kind) => {
  it.each([false, true])('suspends interaction and preserves drafts with destroyOnClose=%s', async (destroyOnClose) => {
    const fixture = await mountCachedPopup(kind, destroyOnClose);
    const content = document.querySelector<HTMLElement>('[role="dialog"]')!;
    const draft = document.querySelector<HTMLInputElement>('[data-draft]')!;
    draft.value = 'Unsaved draft';
    draft.dispatchEvent(new Event('input', { bubbles: true }));
    content.dispatchEvent(new Event('animationend'));
    await vi.advanceTimersByTimeAsync(20);
    expect(fixture.onOpened).toHaveBeenCalledTimes(1);
    expect(fixture.scroll.style.overflow).toBe('hidden');

    fixture.active.value = false;
    await flush();
    await vi.advanceTimersByTimeAsync(400);
    expect(fixture.api.store.state.isOpen).toBe(true);
    expect(content.classList.contains('hidden')).toBe(true);
    expect(document.querySelector('[data-dismissable-dialog], [data-dismissable-drawer]')).toBeNull();
    expect(fixture.scroll.style.overflow).toBe('auto');
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await flush();
    expect(fixture.onBeforeClose).not.toHaveBeenCalled();
    expect(fixture.onClosed).not.toHaveBeenCalled();

    fixture.active.value = true;
    await flush();
    expect(document.querySelector('[data-draft]')).toBe(draft);
    expect(draft.value).toBe('Unsaved draft');
    expect(content.classList.contains('hidden')).toBe(false);
    expect(fixture.scroll.style.overflow).toBe('hidden');
    content.dispatchEvent(new Event('animationend'));
    await vi.advanceTimersByTimeAsync(20);
    expect(fixture.onOpened).toHaveBeenCalledTimes(1);
    expect(fixture.onOpenChange).toHaveBeenCalledTimes(1);

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await flush();
    expect(fixture.api.store.state.isOpen).toBe(false);
    await vi.advanceTimersByTimeAsync(400);
    expect(fixture.onBeforeClose).toHaveBeenCalledTimes(1);
    expect(fixture.onClosed).toHaveBeenCalledTimes(1);
  });

  it('closes body-mounted popups when their page deactivates', async () => {
    const fixture = await mountCachedPopup(kind, false, false);
    fixture.active.value = false;
    await flush();
    expect(fixture.api.store.state.isOpen).toBe(false);
    expect(fixture.onBeforeClose).toHaveBeenCalledTimes(1);
  });
});
