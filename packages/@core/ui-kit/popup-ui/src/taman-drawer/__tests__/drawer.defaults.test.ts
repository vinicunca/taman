import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

import { drawerDefaults } from '../drawer.defaults';
import TamanDrawerProvider from '../taman-drawer-provider.vue';

describe('drawer defaults', () => {
  it('is populated from TamanDrawerProvider props at setup time', () => {
    const wrapper = mount(TamanDrawerProvider, {
      props: { title: 'Default title' },
    });
    expect(drawerDefaults.title).toBe('Default title');
    wrapper.unmount();
  });

  it('does not write Boolean fields the parent never passed', () => {
    // Vue coerces every declared Boolean prop to `false` when absent —
    // mounting with zero props must not let that coercion leak into
    // drawerDefaults and override TamanDrawerApi's own `true` defaults
    // (header, footer, showConfirmButton, closable, modal, etc.).
    const wrapper = mount(TamanDrawerProvider);
    expect(drawerDefaults.header).toBeUndefined();
    expect(drawerDefaults.footer).toBeUndefined();
    expect(drawerDefaults.showConfirmButton).toBeUndefined();
    expect(drawerDefaults.closable).toBeUndefined();
    wrapper.unmount();
  });

  it('still writes an explicitly-passed false Boolean prop', () => {
    const wrapper = mount(TamanDrawerProvider, {
      props: { showConfirmButton: false },
    });
    expect(drawerDefaults.showConfirmButton).toBe(false);
    wrapper.unmount();
  });
});
