import type { ExtendedDialogApi } from '../dialog.types';

import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import { defineComponent, h, KeepAlive, nextTick, shallowRef } from 'vue';

import { dialogRegistry } from '../dialog.registry';
import TamanDialogProvider from '../taman-dialog-provider.vue';
import { useTamanDialog } from '../use-taman-dialog';

// The chrome is not under test here; the stub renders the body only while
// the api reports isOpen, which exercises the useStore wiring end to end.
vi.mock('../dialog.vue', () => ({
  default: defineComponent({
    name: 'TamanDialogStub',
    props: { dialogApi: { type: Object, default: undefined } },
    setup(props: any, { slots }: any) {
      const state = props.dialogApi?.useStore?.();
      return () =>
        state?.value?.isOpen
          ? h('div', { 'data-testid': 'dialog-body' }, slots.default?.())
          : null;
    },
  }),
}));

function makeContent(received: { api?: ExtendedDialogApi }) {
  return defineComponent({
    name: 'TestContent',
    setup() {
      const [Dialog, api] = useTamanDialog();
      received.api = api;
      return () => h(Dialog, null, { default: () => h('p', 'dialog body') });
    },
  });
}

describe('useTamanDialog', () => {
  it('registers a connector and renders/opens/closes through the host', async () => {
    const received: { api?: ExtendedDialogApi } = {};
    const Content = makeContent(received);
    let outerApi!: ExtendedDialogApi;
    const Harness = defineComponent({
      setup() {
        outerApi = useTamanDialog({ connectedComponent: Content });
        return () => h(TamanDialogProvider);
      },
    });

    const wrapper = mount(Harness);
    expect(wrapper.find('[data-testid="dialog-body"]').exists()).toBe(false);

    const promise = outerApi.open();
    await nextTick();
    expect(wrapper.find('[data-testid="dialog-body"]').text()).toContain(
      'dialog body',
    );

    await received.api!.close('result-value');
    await expect(promise).resolves.toBe('result-value');
    await nextTick();
    expect(wrapper.find('[data-testid="dialog-body"]').exists()).toBe(false);
    wrapper.unmount();
  });

  it('shares data between caller and content via setData/getData', async () => {
    const received: { api?: ExtendedDialogApi } = {};
    const Content = makeContent(received);
    let outerApi!: ExtendedDialogApi;
    const Harness = defineComponent({
      setup() {
        outerApi = useTamanDialog({ connectedComponent: Content });
        return () => h(TamanDialogProvider);
      },
    });

    const wrapper = mount(Harness);
    outerApi.setData({ row: 42 });
    expect(received.api!.getData()).toEqual({ row: 42 });
    wrapper.unmount();
  });

  it('applies provider default-props with the lowest merge priority', async () => {
    const received: { api?: ExtendedDialogApi } = {};
    const Content = makeContent(received);
    const Harness = defineComponent({
      setup() {
        useTamanDialog({
          connectedComponent: Content,
          centered: false,
        });
        return () =>
          h(TamanDialogProvider, {
            centered: true,
            title: 'Default title',
          });
      },
    });

    const wrapper = mount(Harness);
    // untouched key falls back to the provider default
    expect(received.api!.store.state.title).toBe('Default title');
    // per-dialog option wins over the provider default
    expect(received.api!.store.state.centered).toBe(false);
    wrapper.unmount();
  });

  it('unregisters when the owning component unmounts', () => {
    const Content = makeContent({});
    const Harness = defineComponent({
      setup() {
        useTamanDialog({ connectedComponent: Content });
        return () => h('div');
      },
    });

    const before = dialogRegistry.length;
    const wrapper = mount(Harness);
    expect(dialogRegistry).toHaveLength(before + 1);
    wrapper.unmount();
    expect(dialogRegistry).toHaveLength(before);
  });

  it('warns and resolves undefined when open() is called before any host renders the connector', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const api = useTamanDialog({
      connectedComponent: defineComponent({ render: () => null }),
    });
    await expect(api.open()).resolves.toBeUndefined();
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('TamanDialogProvider'),
    );
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('effect scope'),
    );
    warnSpy.mockRestore();
  });

  it('warns about the incomplete handshake when the connected component never renders <Dialog>', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    let outerApi!: ExtendedDialogApi;
    const PlainDiv = defineComponent({
      name: 'PlainDiv',
      setup() {
        return () => h('div', 'no dialog here');
      },
    });
    const Harness = defineComponent({
      setup() {
        outerApi = useTamanDialog({ connectedComponent: PlainDiv });
        return () => h(TamanDialogProvider);
      },
    });

    const wrapper = mount(Harness);
    await nextTick();
    await expect(outerApi.open()).resolves.toBeUndefined();
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('never completed the dialog handshake'),
    );
    warnSpy.mockRestore();
    wrapper.unmount();
  });

  it('closes the dialog when the caller is deactivated inside a KeepAlive', async () => {
    const received: { api?: ExtendedDialogApi } = {};
    const Content = makeContent(received);
    let outerApi!: ExtendedDialogApi;

    const CallerView = defineComponent({
      name: 'CallerView',
      setup() {
        outerApi = useTamanDialog({ connectedComponent: Content });
        return () => h('div', 'caller');
      },
    });
    const OtherView = defineComponent({
      name: 'OtherView',
      setup() {
        return () => h('div', 'other');
      },
    });

    const current = shallowRef(CallerView);
    const Harness = defineComponent({
      setup() {
        return () =>
          h('div', [
            h(KeepAlive, () => h(current.value)),
            h(TamanDialogProvider),
          ]);
      },
    });

    const wrapper = mount(Harness);
    const promise = outerApi.open();
    await nextTick();
    expect(wrapper.find('[data-testid="dialog-body"]').exists()).toBe(true);

    // Deactivate the caller by switching the keep-alive'd view away from it.
    current.value = OtherView;
    await expect(promise).resolves.toBeUndefined();
    await nextTick();

    expect(wrapper.find('[data-testid="dialog-body"]').exists()).toBe(false);
    wrapper.unmount();
  });

  it('throws when called inline outside a host-rendered content component', () => {
    const Harness = defineComponent({
      setup() {
        expect(() => useTamanDialog()).toThrow(/connectedComponent/);
        return () => null;
      },
    });
    mount(Harness).unmount();
  });
});
