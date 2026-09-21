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

describe('vertical-only layout', () => {
  it('always stacks the label above the control', async () => {
    const [Form] = useTamanForm({
      schema: [{ component: TestInput, fieldName: 'name', label: 'Name' }],
    });
    const wrapper = mount(Form);
    wrappers.push(wrapper);
    await flushPromises();

    const item = wrapper.get('[data-slot="form-item"]');
    expect(item.classes()).toContain('flex-col');
    expect(item.classes()).not.toContain('flex-row');
    expect(item.classes()).not.toContain('items-center');
  });

  it('never applies an inline width style to the label', async () => {
    const [Form] = useTamanForm({
      schema: [{ component: TestInput, fieldName: 'name', label: 'Name' }],
    });
    const wrapper = mount(Form);
    wrappers.push(wrapper);
    await flushPromises();

    const label = wrapper.get('[data-slot="form-label"]');
    expect(label.attributes('style')).toBeUndefined();
  });

  it('still forwards labelClass to the label element', async () => {
    const [Form] = useTamanForm({
      commonConfig: { labelClass: 'text-xs' },
      schema: [{ component: TestInput, fieldName: 'name', label: 'Name' }],
    });
    const wrapper = mount(Form);
    wrappers.push(wrapper);
    await flushPromises();

    expect(wrapper.get('[data-slot="form-label"]').classes()).toContain(
      'text-xs',
    );
  });
});
