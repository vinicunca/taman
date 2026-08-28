import type { App, Ref } from 'vue';

import type { ExtendedDialogApi } from '../dialog.types';

import { afterEach, describe, expect, it, vi } from 'vitest';
import { createApp, defineComponent, h, nextTick, ref, toRaw } from 'vue';

import { useTamanDialog } from '../use-taman-dialog';

vi.mock('@taman-core/preferences', () => ({
  usePreferences: () => ({
    globalEscapeShortcutKey: { value: true },
  }),
}));

vi.mock('../dialog.vue', () => ({
  default: {
    name: 'TamanDialogStub',
    render: () => null,
  },
}));

let activeApp: App | undefined;

async function mountRebindingHarness() {
  const consumerKey = ref(0);
  let currentApi: ExtendedDialogApi | undefined;
  const onOpenChange = vi.fn();

  const Consumer = defineComponent(() => {
    const [Dialog, dialogApi] = useTamanDialog();
    currentApi = dialogApi;
    return () => h(Dialog);
  });

  const ConnectedDialog = defineComponent(() => {
    return () => h(Consumer, { key: consumerKey.value });
  });

  const [ParentDialog, parentApi] = useTamanDialog({
    connectedComponent: ConnectedDialog,
    onOpenChange,
    title: 'Parent dialog title',
  });
  const host = document.createElement('div');
  document.body.append(host);

  activeApp = createApp(() => h(ParentDialog));
  activeApp.mount(host);
  await nextTick();

  return {
    consumerKey,
    getCurrentApi: () => currentApi,
    onOpenChange,
    parentApi,
  };
}

async function remountConsumer(consumerKey: Ref<number>) {
  consumerKey.value += 1;
  await nextTick();
}

afterEach(() => {
  activeApp?.unmount();
  activeApp = undefined;
  document.body.innerHTML = '';
  vi.restoreAllMocks();
});

describe('useTamanDialog', () => {
  it('rebinds the parent api when the consumer is recreated', async () => {
    const { consumerKey, getCurrentApi, onOpenChange, parentApi }
      = await mountRebindingHarness();
    const initialApi = getCurrentApi();

    expect(initialApi).toBeDefined();
    if (!initialApi) {
      return;
    }
    expect(toRaw(parentApi.store)).toBe(initialApi.store);
    const initialData = { id: 1 };
    parentApi.setData(initialData);
    expect(initialApi.getData()).toBe(initialData);

    await remountConsumer(consumerKey);
    const recreatedApi = getCurrentApi();

    expect(recreatedApi).toBeDefined();
    if (!recreatedApi) {
      return;
    }
    expect(recreatedApi).not.toBe(initialApi);
    expect(recreatedApi.store.state.title).toBe('Parent dialog title');
    expect(toRaw(parentApi.store)).toBe(recreatedApi.store);
    const recreatedData = { id: 2 };
    parentApi.setData(recreatedData);
    expect(recreatedApi.getData()).toBe(recreatedData);

    parentApi.open();
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(recreatedApi.store.state.isOpen).toBe(true);
    expect(initialApi.store.state.isOpen).toBe(false);

    await parentApi.close();
    expect(recreatedApi.store.state.isOpen).toBe(false);
  });
});
