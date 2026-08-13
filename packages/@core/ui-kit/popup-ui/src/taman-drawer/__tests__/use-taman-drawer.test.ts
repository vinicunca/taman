import type { ExtendedTamanDrawerApi } from '../drawer.types';

import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import { defineComponent, h, KeepAlive, nextTick, ref, shallowRef } from 'vue';

import { drawerRegistry } from '../drawer.registry';
import TamanDrawerProvider from '../taman-drawer-provider.vue';
import { useTamanDrawer } from '../use-taman-drawer';

// The chrome is not under test here; the stub renders the body only while
// the api reports isOpen, which exercises the useStore wiring end to end.
vi.mock('../drawer.vue', () => ({
  default: defineComponent({
    name: 'TamanDrawerStub',
    props: { drawerApi: { type: Object, default: undefined } },
    setup(props: any, { slots }: any) {
      const state = props.drawerApi?.useStore?.();
      return () =>
        state?.value?.isOpen
          ? h('div', { 'data-testid': 'drawer-body' }, slots.default?.())
          : null;
    },
  }),
}));

function makeContent(received: { api?: ExtendedTamanDrawerApi }) {
  return defineComponent({
    name: 'TestContent',
    setup() {
      const [Drawer, api] = useTamanDrawer();
      received.api = api;
      return () => h(Drawer, null, { default: () => h('p', 'drawer body') });
    },
  });
}

describe('useTamanDrawer', () => {
  it('registers a connector and renders/opens/closes through the host', async () => {
    const received: { api?: ExtendedTamanDrawerApi } = {};
    const Content = makeContent(received);
    let outerApi!: ExtendedTamanDrawerApi;
    const Harness = defineComponent({
      setup() {
        outerApi = useTamanDrawer({ connectedComponent: Content });
        return () => h(TamanDrawerProvider);
      },
    });

    const wrapper = mount(Harness);
    expect(wrapper.find('[data-testid="drawer-body"]').exists()).toBe(false);

    const promise = outerApi.open();
    await nextTick();
    expect(wrapper.find('[data-testid="drawer-body"]').text()).toContain(
      'drawer body',
    );

    await received.api!.close('result-value');
    await expect(promise).resolves.toBe('result-value');
    await nextTick();
    expect(wrapper.find('[data-testid="drawer-body"]').exists()).toBe(false);
    wrapper.unmount();
  });

  it('shares data between caller and content via setData/getData', async () => {
    const received: { api?: ExtendedTamanDrawerApi } = {};
    const Content = makeContent(received);
    let outerApi!: ExtendedTamanDrawerApi;
    const Harness = defineComponent({
      setup() {
        outerApi = useTamanDrawer({ connectedComponent: Content });
        return () => h(TamanDrawerProvider);
      },
    });

    const wrapper = mount(Harness);
    outerApi.setData({ row: 42 });
    expect(received.api!.getData()).toEqual({ row: 42 });
    wrapper.unmount();
  });

  it('applies provider default-props with the lowest merge priority', async () => {
    const received: { api?: ExtendedTamanDrawerApi } = {};
    const Content = makeContent(received);
    const Harness = defineComponent({
      setup() {
        useTamanDrawer({
          connectedComponent: Content,
          placement: 'left',
        });
        return () =>
          h(TamanDrawerProvider, {
            placement: 'top',
            title: 'Default title',
          });
      },
    });

    const wrapper = mount(Harness);
    // untouched key falls back to the provider default
    expect(received.api!.store.state.title).toBe('Default title');
    // per-drawer option wins over the provider default
    expect(received.api!.store.state.placement).toBe('left');
    wrapper.unmount();
  });

  it('unregisters when the owning component unmounts', () => {
    const Content = makeContent({});
    const Harness = defineComponent({
      setup() {
        useTamanDrawer({ connectedComponent: Content });
        return () => h('div');
      },
    });

    const before = drawerRegistry.length;
    const wrapper = mount(Harness);
    expect(drawerRegistry).toHaveLength(before + 1);
    wrapper.unmount();
    expect(drawerRegistry).toHaveLength(before);
  });

  it('warns and resolves undefined when open() is called before any host renders the connector', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const api = useTamanDrawer({
      connectedComponent: defineComponent({ render: () => null }),
    });
    await expect(api.open()).resolves.toBeUndefined();
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('TamanDrawerProvider'),
    );
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('effect scope'),
    );
    warnSpy.mockRestore();
  });

  it('warns about the incomplete handshake when the connected component never renders <Drawer>', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    let outerApi!: ExtendedTamanDrawerApi;
    const PlainDiv = defineComponent({
      name: 'PlainDiv',
      setup() {
        return () => h('div', 'no drawer here');
      },
    });
    const Harness = defineComponent({
      setup() {
        outerApi = useTamanDrawer({ connectedComponent: PlainDiv });
        return () => h(TamanDrawerProvider);
      },
    });

    const wrapper = mount(Harness);
    await nextTick();
    await expect(outerApi.open()).resolves.toBeUndefined();
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('never completed the drawer handshake'),
    );
    warnSpy.mockRestore();
    wrapper.unmount();
  });

  it('closes the drawer when the caller is deactivated inside a KeepAlive', async () => {
    const received: { api?: ExtendedTamanDrawerApi } = {};
    const Content = makeContent(received);
    let outerApi!: ExtendedTamanDrawerApi;

    const CallerView = defineComponent({
      name: 'CallerView',
      setup() {
        outerApi = useTamanDrawer({ connectedComponent: Content });
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
            h(TamanDrawerProvider),
          ]);
      },
    });

    const wrapper = mount(Harness);
    const promise = outerApi.open();
    await nextTick();
    expect(wrapper.find('[data-testid="drawer-body"]').exists()).toBe(true);

    current.value = OtherView;
    await expect(promise).resolves.toBeUndefined();
    await nextTick();

    expect(wrapper.find('[data-testid="drawer-body"]').exists()).toBe(false);
    wrapper.unmount();
  });

  it('resets the consumed handshake when the content instance is torn down without a close (e.g. HMR)', async () => {
    const received: { api?: ExtendedTamanDrawerApi } = {};
    const showContent = ref(true);
    const Content = makeContent(received);
    const HmrWrapper = defineComponent({
      name: 'HmrWrapper',
      setup() {
        return () => (showContent.value ? h(Content) : h('div'));
      },
    });

    const errors: unknown[] = [];
    const Harness = defineComponent({
      setup() {
        useTamanDrawer({ connectedComponent: HmrWrapper });
        return () => h(TamanDrawerProvider);
      },
    });

    const wrapper = mount(Harness, {
      global: { config: { errorHandler: (err) => errors.push(err) } },
    });
    await nextTick();
    expect(received.api).toBeDefined();

    // Simulate Vite HMR tearing down and recreating the content instance in
    // place, without the drawer ever closing (so destroyOnClose's reset
    // never runs) — the scope-dispose reset must cover this case instead.
    showContent.value = false;
    await nextTick();
    showContent.value = true;
    await nextTick();

    expect(errors).toEqual([]);
    expect(received.api).toBeDefined();
    wrapper.unmount();
  });

  it('throws when called inline outside a host-rendered content component', () => {
    const Harness = defineComponent({
      setup() {
        expect(() => useTamanDrawer()).toThrow(/connectedComponent/);
        return () => null;
      },
    });
    mount(Harness).unmount();
  });
});
