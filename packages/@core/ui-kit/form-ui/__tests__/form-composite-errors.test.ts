import type { VueWrapper } from '@vue/test-utils';

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

describe('composite field errors', () => {
  const rules = z
    .array(z.string().optional())
    .length(2)
    .refine((v) => !!v[0], { message: 'Please select a type' })
    .refine((v) => !!v[1], { message: 'Please enter a phone number' });

  it('exposes error and issues to the field slot', async () => {
    const [Form, formApi] = useTamanForm({
      schema: [
        {
          component: TestInput,
          defaultValue: [undefined, ''],
          fieldName: 'phone',
          label: 'Phone',
          rules,
        },
      ],
    });
    const seen: Array<Record<string, unknown>> = [];
    const wrapper = mount(Form, {
      slots: {
        phone: (slotProps: Record<string, any>) => {
          seen.push(slotProps);
          return h('input');
        },
      },
    });
    wrappers.push(wrapper);
    await flushPromises();

    await formApi.validate();
    await flushPromises();

    const last = seen.at(-1);
    expect(last).toHaveProperty('error');
    expect(Array.isArray(last?.issues)).toBe(true);
    const issues = last?.issues as Array<{
      message: string;
      path: Array<PropertyKey>;
    }>;
    expect(issues.length).toBeGreaterThan(0);
    // Both `.refine()` failures must be present — proves the full issue list
    // is recorded, not just the first issue (which is all `error` carries).
    expect(issues.map((issue) => issue.message)).toEqual([
      'Please select a type',
      'Please enter a phone number',
    ]);
    for (const issue of issues) {
      expect(Array.isArray(issue.path)).toBe(true);
    }
  });

  it('clears issues once the value passes validation', async () => {
    const [Form, formApi] = useTamanForm({
      schema: [
        {
          component: TestInput,
          defaultValue: [undefined, ''],
          fieldName: 'phone',
          label: 'Phone',
          rules,
        },
      ],
    });
    const seen: Array<Record<string, unknown>> = [];
    const wrapper = mount(Form, {
      slots: {
        phone: (slotProps: Record<string, any>) => {
          seen.push(slotProps);
          return h('input');
        },
      },
    });
    wrappers.push(wrapper);
    await flushPromises();

    await formApi.validate();
    await flushPromises();

    expect((seen.at(-1)?.issues as Array<unknown>).length).toBeGreaterThan(0);

    await formApi.setFieldValue('phone', ['mobile', '555-1234'], true);
    await flushPromises();

    expect(seen.at(-1)?.issues).toEqual([]);
  });

  it('clears issues when error is cleared through a route that never re-runs the validator', async () => {
    const [Form, formApi] = useTamanForm({
      schema: [
        {
          component: TestInput,
          defaultValue: [undefined, ''],
          fieldName: 'phone',
          label: 'Phone',
          rules,
        },
      ],
    });
    const seen: Array<Record<string, unknown>> = [];
    const wrapper = mount(Form, {
      slots: {
        phone: (slotProps: Record<string, any>) => {
          seen.push(slotProps);
          return h('input');
        },
      },
    });
    wrappers.push(wrapper);
    await flushPromises();

    await formApi.validate();
    await flushPromises();
    expect((seen.at(-1)?.issues as Array<unknown>).length).toBeGreaterThan(0);

    formApi.clearValidation('phone');
    await flushPromises();

    expect(seen.at(-1)?.error).toBeUndefined();
    expect(seen.at(-1)?.issues).toEqual([]);
  });

  it('suppresses the field-level message when hideMessage is set', async () => {
    const [Form, formApi] = useTamanForm({
      schema: [
        {
          component: TestInput,
          defaultValue: [undefined, ''],
          fieldName: 'phone',
          hideMessage: true,
          label: 'Phone',
          rules,
        },
      ],
    });
    const wrapper = mount(Form);
    wrappers.push(wrapper);
    await flushPromises();

    await formApi.validate();
    await flushPromises();

    expect(wrapper.find('[data-slot="form-message"]').exists()).toBe(false);
  });

  it('suppresses messages form-wide via commonConfig.hideMessage', async () => {
    // Regression test: `createFormFieldSchema` forwards every other
    // `commonConfig` key (hideLabel, hideRequiredMark, labelClass, ...) but
    // used to drop `hideMessage`, so it only ever worked set per-field, never
    // through the form-wide `commonConfig` it's documented on.
    const [Form, formApi] = useTamanForm({
      commonConfig: { hideMessage: true },
      schema: [
        {
          component: TestInput,
          defaultValue: [undefined, ''],
          fieldName: 'phone',
          label: 'Phone',
          rules,
        },
      ],
    });
    const wrapper = mount(Form);
    wrappers.push(wrapper);
    await flushPromises();

    await formApi.validate();
    await flushPromises();

    expect(wrapper.find('[data-slot="form-message"]').exists()).toBe(false);
  });

  it('drops the reserved message gutter when hideMessage is set', async () => {
    // `pb-6` exists solely to reserve room for the absolutely-positioned
    // `FormMessage` below the control — with the message suppressed there is
    // nothing to reserve room for.
    const [Form] = useTamanForm({
      schema: [
        {
          component: TestInput,
          defaultValue: [undefined, ''],
          fieldName: 'phone',
          hideMessage: true,
          label: 'Phone',
          rules,
        },
      ],
    });
    const wrapper = mount(Form);
    wrappers.push(wrapper);
    await flushPromises();

    expect(
      wrapper.get('[data-slot="form-item"]').classes(),
    ).not.toContain('pb-6');
  });

  it('still renders the message by default', async () => {
    const [Form, formApi] = useTamanForm({
      schema: [
        {
          component: TestInput,
          defaultValue: [undefined, ''],
          fieldName: 'phone',
          label: 'Phone',
          rules,
        },
      ],
    });
    const wrapper = mount(Form);
    wrappers.push(wrapper);
    await flushPromises();

    await formApi.validate();
    await flushPromises();

    expect(wrapper.find('[data-slot="form-message"]').exists()).toBe(true);
  });
});
