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

describe('form label', () => {
  it('marks required fields with an after: pseudo-element, not a span', async () => {
    const [Form] = useTamanForm({
      schema: [
        {
          component: TestInput,
          fieldName: 'name',
          label: 'Name',
          rules: 'required',
        },
      ],
    });
    const wrapper = mount(Form);
    wrappers.push(wrapper);
    await flushPromises();

    const label = wrapper.get('[data-slot="form-label"]');
    expect(label.classes()).toContain('after:content-[\'*\']');
    expect(label.text()).not.toContain('*');
  });

  it('omits the marker on optional fields', async () => {
    const [Form] = useTamanForm({
      schema: [{ component: TestInput, fieldName: 'name', label: 'Name' }],
    });
    const wrapper = mount(Form);
    wrappers.push(wrapper);
    await flushPromises();

    expect(
      wrapper.get('[data-slot="form-label"]').classes(),
    ).not.toContain('after:content-[\'*\']');
  });

  it('omits the marker when hideRequiredMark is set', async () => {
    const [Form] = useTamanForm({
      commonConfig: { hideRequiredMark: true },
      schema: [
        {
          component: TestInput,
          fieldName: 'name',
          label: 'Name',
          rules: 'required',
        },
      ],
    });
    const wrapper = mount(Form);
    wrappers.push(wrapper);
    await flushPromises();

    expect(
      wrapper.get('[data-slot="form-label"]').classes(),
    ).not.toContain('after:content-[\'*\']');
  });

  it('never renders a colon', async () => {
    const [Form] = useTamanForm({
      schema: [{ component: TestInput, fieldName: 'name', label: 'Name' }],
    });
    const wrapper = mount(Form);
    wrappers.push(wrapper);
    await flushPromises();

    expect(wrapper.get('[data-slot="form-label"]').text()).toBe('Name');
  });

  it('orders the required marker before the help tooltip', async () => {
    const [Form] = useTamanForm({
      schema: [
        {
          component: TestInput,
          fieldName: 'name',
          help: 'hint',
          label: 'Name',
          rules: 'required',
        },
      ],
    });
    const wrapper = mount(Form, {
      global: {
        stubs: {
          PTooltip: {
            template: '<div data-testid="tooltip-stub"><slot /></div>',
          },
        },
      },
    });
    wrappers.push(wrapper);
    await flushPromises();

    const label = wrapper.get('[data-slot="form-label"]');
    // The asterisk is `FormLabel`'s own `::after`, which becomes a flex item
    // of `FormLabel` itself (it's `flex items-center`). `order-1` is what
    // keeps it ahead of the tooltip in the painted order.
    expect(label.classes()).toContain('after:order-1');
    // The tooltip is the sibling flex item the asterisk must stay ahead of;
    // `order-2` is what pushes it after the label text and the asterisk.
    expect(label.get('[data-testid="tooltip-stub"]').classes()).toContain(
      'order-2',
    );
  });
});
