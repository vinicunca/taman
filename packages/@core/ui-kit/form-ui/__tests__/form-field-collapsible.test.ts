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

describe('per-field collapsible', () => {
  it('renders no collapsible wrapper by default', async () => {
    const [Form] = useTamanForm({
      schema: [{ component: TestInput, fieldName: 'name', label: 'Name' }],
    });
    const wrapper = mount(Form);
    wrappers.push(wrapper);
    await flushPromises();

    expect(wrapper.find('[data-slot="form-item"] [data-state]').exists()).toBe(
      false,
    );
    expect(wrapper.find('input').exists()).toBe(true);
  });

  it('renders a collapsible wrapper when opted in', async () => {
    const [Form] = useTamanForm({
      schema: [
        {
          collapsible: true,
          component: TestInput,
          fieldName: 'name',
          label: 'Name',
        },
      ],
    });
    const wrapper = mount(Form);
    wrappers.push(wrapper);
    await flushPromises();

    expect(wrapper.find('[data-state]').exists()).toBe(true);
    expect(wrapper.find('input').exists()).toBe(true);
  });

  it('starts closed when defaultCollapsed is set', async () => {
    const [Form] = useTamanForm({
      schema: [
        {
          collapsible: true,
          component: TestInput,
          defaultCollapsed: true,
          fieldName: 'name',
          label: 'Name',
        },
      ],
    });
    const wrapper = mount(Form);
    wrappers.push(wrapper);
    await flushPromises();

    expect(wrapper.get('[data-state]').attributes('data-state')).toBe('closed');
  });

  it('renders a reachable chevron toggle that flips the collapsible open/closed', async () => {
    const [Form] = useTamanForm({
      schema: [
        {
          collapsible: true,
          component: TestInput,
          fieldName: 'name',
          label: 'Name',
        },
      ],
    });
    const wrapper = mount(Form);
    wrappers.push(wrapper);
    await flushPromises();

    const formItem = wrapper.get('[data-slot="form-item"]');
    // The toggle must not be a descendant of the <label> (nested interactive
    // controls are invalid HTML and corrupt the input's accessible name), so
    // it's reached via its own accessible name, not via the label.
    const label = formItem.get('[data-slot="form-label"]');
    expect(label.find('button').exists()).toBe(false);
    const toggle = formItem.get('[aria-label="Toggle field"]');

    expect(
      formItem.get('[data-state]').attributes('data-state'),
    ).toBe('open');
    expect(toggle.attributes('aria-expanded')).toBe('true');

    await toggle.trigger('click');
    await flushPromises();

    expect(
      formItem.get('[data-state]').attributes('data-state'),
    ).toBe('closed');
    expect(toggle.attributes('aria-expanded')).toBe('false');

    await toggle.trigger('click');
    await flushPromises();

    expect(
      formItem.get('[data-state]').attributes('data-state'),
    ).toBe('open');
    expect(toggle.attributes('aria-expanded')).toBe('true');
  });

  it('renders no chevron toggle for a non-collapsible field', async () => {
    const [Form] = useTamanForm({
      schema: [{ component: TestInput, fieldName: 'name', label: 'Name' }],
    });
    const wrapper = mount(Form);
    wrappers.push(wrapper);
    await flushPromises();

    expect(wrapper.find('[aria-label="Toggle field"]').exists()).toBe(false);
  });

  it('keeps the field control mounted while closed, so its ref stays reachable', async () => {
    // Regression test: pohon's `Collapsible` defaults `unmountOnHide: true`,
    // which would tear the control out of the DOM whenever
    // `defaultCollapsed: true` starts it closed — `getFieldComponentRef`
    // would then return `undefined` and `scrollToFirstError` would silently
    // no-op for a field inside a collapsed-by-default section.
    const [Form, formApi] = useTamanForm({
      schema: [
        {
          collapsible: true,
          component: TestInput,
          defaultCollapsed: true,
          fieldName: 'name',
          label: 'Name',
        },
      ],
    });
    const wrapper = mount(Form);
    wrappers.push(wrapper);
    await flushPromises();

    expect(wrapper.get('[data-state]').attributes('data-state')).toBe('closed');
    expect(wrapper.find('input').exists()).toBe(true);
    expect(formApi.getFieldComponentRef('name')).toBeDefined();
  });

  it('renders a working toggle for a collapsible field with hideLabel', async () => {
    const [Form] = useTamanForm({
      schema: [
        {
          collapsible: true,
          component: TestInput,
          fieldName: 'name',
          hideLabel: true,
          label: 'Name',
        },
      ],
    });
    const wrapper = mount(Form);
    wrappers.push(wrapper);
    await flushPromises();

    const formItem = wrapper.get('[data-slot="form-item"]');
    expect(formItem.find('[data-slot="form-label"]').exists()).toBe(false);

    const toggle = formItem.get('[aria-label="Toggle field"]');
    expect(formItem.get('[data-state]').attributes('data-state')).toBe('open');

    await toggle.trigger('click');
    await flushPromises();

    expect(formItem.get('[data-state]').attributes('data-state')).toBe(
      'closed',
    );
  });
});
