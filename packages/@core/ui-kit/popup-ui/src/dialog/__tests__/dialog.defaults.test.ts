import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

import { dialogDefaults } from '../dialog.defaults';
import TamanDialogProvider from '../taman-dialog-provider.vue';

describe('dialog defaults', () => {
  it('is populated from TamanDialogProvider props at setup time', () => {
    const wrapper = mount(TamanDialogProvider, {
      props: { centered: true, title: 'Default title' },
    });
    expect(dialogDefaults.centered).toBe(true);
    expect(dialogDefaults.title).toBe('Default title');
    wrapper.unmount();
  });

  it('does not write Boolean fields the parent never passed', () => {
    // Vue coerces every declared Boolean prop to `false` when absent —
    // mounting with zero props must not let that coercion leak into
    // dialogDefaults and override DialogApi's own `true` defaults
    // (destroyOnClose, header, footer, showConfirmButton, etc.) app-wide.
    const wrapper = mount(TamanDialogProvider);
    expect(dialogDefaults.destroyOnClose).toBeUndefined();
    expect(dialogDefaults.header).toBeUndefined();
    expect(dialogDefaults.footer).toBeUndefined();
    expect(dialogDefaults.showConfirmButton).toBeUndefined();
    wrapper.unmount();
  });

  it('still writes an explicitly-passed false Boolean prop', () => {
    const wrapper = mount(TamanDialogProvider, {
      props: { fullscreenButton: false },
    });
    expect(dialogDefaults.fullscreenButton).toBe(false);
    wrapper.unmount();
  });
});
