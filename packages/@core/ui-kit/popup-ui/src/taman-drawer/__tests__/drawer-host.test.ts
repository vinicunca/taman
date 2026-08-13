import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { defineComponent, h, nextTick } from 'vue';

import { registerDrawer, unregisterDrawer } from '../drawer.registry';
import TamanDrawerProvider from '../taman-drawer-provider.vue';

const Stub = defineComponent({
  name: 'StubDrawer',
  render: () => h('div', { 'data-testid': 'stub-drawer' }, 'stub'),
});

describe('tamanDrawerProvider', () => {
  it('renders entries registered before mount', () => {
    const id = Symbol('pre');
    registerDrawer(id, Stub);
    const wrapper = mount(TamanDrawerProvider);
    expect(wrapper.find('[data-testid="stub-drawer"]').exists()).toBe(true);
    unregisterDrawer(id);
    wrapper.unmount();
  });

  it('reacts to entries registered after mount and to unregistration', async () => {
    const id = Symbol('post');
    const wrapper = mount(TamanDrawerProvider);
    expect(wrapper.find('[data-testid="stub-drawer"]').exists()).toBe(false);

    registerDrawer(id, Stub);
    await nextTick();
    expect(wrapper.find('[data-testid="stub-drawer"]').exists()).toBe(true);

    unregisterDrawer(id);
    await nextTick();
    expect(wrapper.find('[data-testid="stub-drawer"]').exists()).toBe(false);
    wrapper.unmount();
  });
});
