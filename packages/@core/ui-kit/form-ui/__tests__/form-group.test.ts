import type { VueWrapper } from '@vue/test-utils';

import type { FormSchema } from '../src/form.types';

import { flushPromises, mount } from '@vue/test-utils';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import { defineComponent, h } from 'vue';
import { z } from 'zod';

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

function createContactGroup(
  overrides: Partial<Extract<FormSchema, { type: 'group' }>> = {},
): FormSchema {
  return {
    children: [
      {
        component: TestInput,
        defaultValue: 'ada@example.com',
        fieldName: 'email',
        label: 'Email',
      },
      { component: TestInput, fieldName: 'phone', label: 'Phone' },
    ],
    name: 'contact',
    title: 'Contact',
    type: 'group',
    ...overrides,
  };
}

function getGroupState(wrapper: VueWrapper) {
  return wrapper.get('.form-group [data-state]').attributes('data-state');
}

describe('form group rendering', () => {
  it('renders grouped fields as regular form fields', async () => {
    const [Form, formApi] = useTamanForm({
      schema: [
        { component: TestInput, fieldName: 'name', label: 'Name' },
        createContactGroup({ extra: 'Optional' }),
      ],
    });
    const wrapper = mount(Form);
    wrappers.push(wrapper);
    await flushPromises();

    expect(wrapper.get('.form-group-title').text()).toBe('Contact');
    expect(wrapper.text()).toContain('Optional');
    expect(wrapper.get('.form-group-trigger').text()).not.toContain('Optional');
    expect(wrapper.findAll('input')).toHaveLength(3);
    expect(wrapper.get('.form-group').findAll('input')).toHaveLength(2);
    expect(getGroupState(wrapper)).toBe('open');
    expect(await formApi.getValues()).toEqual({ email: 'ada@example.com' });
  });

  it('toggles the group from its header and honors defaultCollapsed', async () => {
    const [Form] = useTamanForm({
      schema: [createContactGroup({ defaultCollapsed: true })],
    });
    const wrapper = mount(Form);
    wrappers.push(wrapper);
    await flushPromises();

    expect(getGroupState(wrapper)).toBe('closed');
    expect(wrapper.get('button.form-group-trigger').attributes('type')).toBe(
      'button',
    );
    expect(
      wrapper.get('button.form-group-trigger').attributes('aria-expanded'),
    ).toBe('false');

    await wrapper.get('button.form-group-trigger').trigger('click');
    expect(getGroupState(wrapper)).toBe('open');
    expect(
      wrapper.get('button.form-group-trigger').attributes('aria-expanded'),
    ).toBe('true');

    await wrapper.get('button.form-group-trigger').trigger('click');
    expect(getGroupState(wrapper)).toBe('closed');
  });

  it('does not toggle when clicking the extra region', async () => {
    // Regression test: pohon's `Collapsible` wraps its entire default-slot
    // root in Akar's `CollapsibleTrigger` (`as-child`). Passing the whole
    // `.form-group-header` (trigger *and* `extra`) as that slot used to make
    // the whole header clickable, including `extra` — contradicting the
    // very assertion above that `extra` isn't part of the trigger.
    const [Form] = useTamanForm({
      schema: [createContactGroup({ defaultCollapsed: true, extra: 'Optional' })],
    });
    const wrapper = mount(Form);
    wrappers.push(wrapper);
    await flushPromises();

    expect(getGroupState(wrapper)).toBe('closed');
    expect(wrapper.text()).toContain('Optional');

    // The `extra` region is rendered in its own `.flex-none` sibling of
    // `.form-group-trigger`, not inside it.
    await wrapper.get('.form-group-header > .flex-none').trigger('click');
    await flushPromises();

    expect(getGroupState(wrapper)).toBe('closed');
  });

  it('does not merge trigger-only ARIA attributes onto the header', async () => {
    // Regression test: Akar's `CollapsibleTrigger` (via `as-child`) used to
    // merge `aria-expanded`, `aria-controls=""`, and `type="button"` onto
    // whichever element it wrapped — here, `.form-group-header`, a
    // `role=generic` element, which fails axe's `aria-allowed-attr` /
    // `aria-valid-attr-value`. The header must carry none of those; only
    // the real `.form-group-trigger` button does.
    const [Form] = useTamanForm({
      schema: [createContactGroup()],
    });
    const wrapper = mount(Form);
    wrappers.push(wrapper);
    await flushPromises();

    const header = wrapper.get('.form-group-header');
    expect(header.attributes('aria-expanded')).toBeUndefined();
    expect(header.attributes('aria-controls')).toBeUndefined();
    expect(header.attributes('type')).toBeUndefined();
    expect(header.attributes('data-state')).toBeUndefined();
  });

  it('keeps a non-collapsible group open despite defaultCollapsed', async () => {
    const [Form] = useTamanForm({
      schema: [
        createContactGroup({ collapsible: false, defaultCollapsed: true }),
      ],
    });
    const wrapper = mount(Form);
    wrappers.push(wrapper);
    await flushPromises();

    expect(wrapper.find('button.form-group-trigger').exists()).toBe(false);
    await wrapper.get('.form-group-header').trigger('click');
    expect(getGroupState(wrapper)).toBe('open');
  });

  it('expands a collapsed group when one of its fields fails validation', async () => {
    const [Form, formApi] = useTamanForm({
      schema: [
        createContactGroup({
          children: [
            {
              component: TestInput,
              fieldName: 'email',
              label: 'Email',
              rules: z.string().min(1, 'Email is required'),
            },
          ],
          defaultCollapsed: true,
        }),
      ],
    });
    const wrapper = mount(Form);
    wrappers.push(wrapper);
    await flushPromises();

    expect(getGroupState(wrapper)).toBe('closed');

    expect(await formApi.validate()).toEqual({
      errors: { email: 'Email is required' },
      valid: false,
    });
    await flushPromises();

    expect(getGroupState(wrapper)).toBe('open');
    expect(wrapper.text()).toContain('Email is required');
  });

  it('expands for validation errors in array descendants', async () => {
    const [Form, formApi] = useTamanForm({
      schema: [
        createContactGroup({
          children: [
            {
              children: [
                {
                  component: TestInput,
                  fieldName: 'phone',
                  label: 'Phone',
                  rules: z.string().min(1, 'Phone is required'),
                },
              ],
              defaultValue: [{ phone: '' }],
              fieldName: 'contacts',
              type: 'array',
            },
          ],
          defaultCollapsed: true,
        }),
      ],
    });
    const wrapper = mount(Form);
    wrappers.push(wrapper);
    await flushPromises();

    expect(getGroupState(wrapper)).toBe('closed');
    expect(await formApi.validate()).toEqual({
      errors: { 'contacts[0].phone': 'Phone is required' },
      valid: false,
    });
    await flushPromises();

    expect(getGroupState(wrapper)).toBe('open');
  });

  it('skips hidden groups and forwards field slots into groups', async () => {
    const [Form] = useTamanForm({
      schema: [
        createContactGroup(),
        {
          children: [{ component: TestInput, fieldName: 'secret' }],
          hide: true,
          name: 'hidden',
          type: 'group',
        },
      ],
    });
    const wrapper = mount(Form, {
      slots: {
        phone: (slotProps: Record<string, any>) =>
          h(TestInput, {
            ...slotProps.componentProps,
            class: 'slot-phone',
          }),
      },
    });
    wrappers.push(wrapper);
    await flushPromises();

    expect(wrapper.findAll('.form-group')).toHaveLength(1);
    expect(wrapper.findAll('input')).toHaveLength(2);
    expect(wrapper.get('.form-group').find('.slot-phone').exists()).toBe(true);
  });

  it('re-renders grouped fields after updateSchema', async () => {
    const [Form, formApi] = useTamanForm({
      schema: [createContactGroup()],
    });
    const wrapper = mount(Form);
    wrappers.push(wrapper);
    await flushPromises();

    formApi.updateSchema([{ fieldName: 'phone', label: 'Mobile' }]);
    await flushPromises();

    expect(wrapper.text()).toContain('Mobile');
    expect(wrapper.text()).not.toContain('Phone');
  });
});
