import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import { defineComponent, h } from 'vue';

import {
  createFormBuilder,
  defineFieldComponents,
  resolveFieldComponent,
  useFormBuilderConfig,
} from '../plugin';

const Dummy = defineComponent({ name: 'Dummy', render: () => h('input') });

function mountWithPlugin(setupFn: () => any) {
  const Probe = defineComponent({
    setup: () => {
      const result = setupFn();
      return () => h('div');
    },
  });
  return mount(Probe, {
    global: {
      plugins: [
        createFormBuilder({
          components: defineFieldComponents({ Input: Dummy }),
          defaults: { Input: { placeholder: 'type here' } },
          messages: { submit: 'Simpan' },
        }),
      ],
    },
  });
}

describe('createFormBuilder plugin', () => {
  it('provides registry, defaults, and merged messages', () => {
    let config: any;
    mountWithPlugin(() => {
      config = useFormBuilderConfig();
    });
    expect(config.components.Input).toBe(Dummy);
    expect(config.defaults.Input).toEqual({ placeholder: 'type here' });
    expect(config.messages.submit).toBe('Simpan');
    expect(config.messages.reset).toBe('Reset'); // English default preserved
  });

  it('useFormBuilderConfig works without the plugin (empty registry, defaults intact)', () => {
    let config: any;
    const Probe = defineComponent({
      setup: () => {
        config = useFormBuilderConfig();
        return () => h('div');
      },
    });
    mount(Probe);
    expect(config.components).toEqual({});
    expect(config.messages.submit).toBe('Submit');
  });

  it('resolveFieldComponent resolves registry names and passes raw components through', () => {
    let config: any;
    mountWithPlugin(() => {
      config = useFormBuilderConfig();
    });
    expect(resolveFieldComponent('Input', config)).toBe(Dummy);
    expect(resolveFieldComponent(Dummy, config)).toBe(Dummy);
  });

  it('resolveFieldComponent throws in dev for unknown registry names, listing options', () => {
    let config: any;
    mountWithPlugin(() => {
      config = useFormBuilderConfig();
    });
    expect(() => resolveFieldComponent('Nope', config)).toThrowError(/Nope.*Input/s);
  });

  it('resolveFieldComponent in prod logs console.error and renders nothing', () => {
    vi.stubEnv('DEV', false);
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    try {
      let config: any;
      mountWithPlugin(() => {
        config = useFormBuilderConfig();
      });
      const fallback = resolveFieldComponent('Nope', config);
      expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('Nope'));
      expect(typeof fallback).toBe('function');
      expect((fallback as any)()).toBeNull();
    } finally {
      errorSpy.mockRestore();
      vi.unstubAllEnvs();
    }
  });
});
