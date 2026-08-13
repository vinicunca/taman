import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { defineComponent, h, nextTick } from 'vue';

import { registerDialog, unregisterDialog } from '../dialog.registry.js';
import TamanDialogProvider from '../taman-dialog-provider.vue';

const Stub = defineComponent({
  name: 'StubDialog',
  render: () => h('div', { 'data-testid': 'stub-dialog' }, 'stub'),
});

describe('tamanDialogHost', () => {
  it('renders entries registered before mount', () => {
    const id = Symbol('pre');
    registerDialog(id, Stub);
    const wrapper = mount(TamanDialogProvider);
    expect(wrapper.find('[data-testid="stub-dialog"]').exists()).toBe(true);
    unregisterDialog(id);
    wrapper.unmount();
  });

  it('reacts to entries registered after mount and to unregistration', async () => {
    const id = Symbol('post');
    const wrapper = mount(TamanDialogProvider);
    expect(wrapper.find('[data-testid="stub-dialog"]').exists()).toBe(false);

    registerDialog(id, Stub);
    await nextTick();
    expect(wrapper.find('[data-testid="stub-dialog"]').exists()).toBe(true);

    unregisterDialog(id);
    await nextTick();
    expect(wrapper.find('[data-testid="stub-dialog"]').exists()).toBe(false);
    wrapper.unmount();
  });
});
