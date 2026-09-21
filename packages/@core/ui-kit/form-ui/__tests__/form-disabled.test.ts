import type { VueWrapper } from '@vue/test-utils';

import { flushPromises, mount } from '@vue/test-utils';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import { defineComponent, h } from 'vue';

import { setupTamanForm } from '../src/form.config';
import { useTamanForm } from '../src/form.use-taman-form';

const wrappers: Array<VueWrapper> = [];

const TestInput = defineComponent({
  inheritAttrs: false,
  emits: ['update:modelValue'],
  setup(_props, { attrs, emit }) {
    return () =>
      h('input', {
        ...attrs,
        onInput: (event: Event) => {
          emit('update:modelValue', (event.target as HTMLInputElement).value);
        },
        value: attrs.modelValue ?? '',
      });
  },
});

beforeAll(() => {
  setupTamanForm({});
});

afterEach(() => {
  for (const wrapper of wrappers.splice(0)) {
    wrapper.unmount();
  }
});

describe('form-level disabled', () => {
  it('disables fields and both action buttons', async () => {
    const [Form] = useTamanForm({
      disabled: true,
      schema: [{ component: TestInput, fieldName: 'name', label: 'Name' }],
    });
    const wrapper = mount(Form);
    wrappers.push(wrapper);
    await flushPromises();

    expect(wrapper.get('input').attributes('disabled')).toBeDefined();
    for (const button of wrapper.findAll('button')) {
      expect(button.attributes('disabled')).toBeDefined();
    }
  });

  it('leaves action buttons enabled for commonConfig.disabled', async () => {
    const [Form] = useTamanForm({
      commonConfig: { disabled: true },
      schema: [{ component: TestInput, fieldName: 'name', label: 'Name' }],
    });
    const wrapper = mount(Form);
    wrappers.push(wrapper);
    await flushPromises();

    expect(wrapper.get('input').attributes('disabled')).toBeDefined();
    expect(
      wrapper.findAll('button').every((b) => b.attributes('disabled') === undefined),
    ).toBe(true);
  });

  it('enables everything when disabled is false', async () => {
    const [Form] = useTamanForm({
      disabled: false,
      schema: [{ component: TestInput, fieldName: 'name', label: 'Name' }],
    });
    const wrapper = mount(Form);
    wrappers.push(wrapper);
    await flushPromises();

    expect(wrapper.get('input').attributes('disabled')).toBeUndefined();
    for (const button of wrapper.findAll('button')) {
      expect(button.attributes('disabled')).toBeUndefined();
    }
  });
});
