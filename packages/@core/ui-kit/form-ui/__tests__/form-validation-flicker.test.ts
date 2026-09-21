import type { VueWrapper } from '@vue/test-utils';

import { flushPromises, mount } from '@vue/test-utils';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import { defineComponent, h, watch } from 'vue';
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

describe('validation error stability while typing', () => {
  it('never passes through an empty error while the field stays invalid', async () => {
    const [Form, formApi] = useTamanForm({
      schema: [
        {
          component: TestInput,
          defaultValue: '',
          fieldName: 'name',
          label: 'Name',
          rules: z.string().min(5, 'Too short'),
        },
      ],
    });
    const wrapper = mount(Form, { attachTo: document.body });
    wrappers.push(wrapper);
    await flushPromises();

    await formApi.validate();
    await flushPromises();

    const errorRef = formApi.form.useFieldError('name');
    expect(errorRef.value).toBe('Too short');

    const seen: Array<string | undefined> = [];
    const stop = watch(errorRef, (value) => seen.push(value), {
      flush: 'sync',
    });

    await wrapper.get('input').setValue('ab');
    await flushPromises();
    await new Promise((resolve) => setTimeout(resolve, 50));
    await flushPromises();

    stop();

    expect(errorRef.value).toBe('Too short');
    expect(seen.filter((value) => !value)).toEqual([]);
  });

  it('clears the error once the value becomes valid', async () => {
    const [Form, formApi] = useTamanForm({
      schema: [
        {
          component: TestInput,
          defaultValue: '',
          fieldName: 'name',
          label: 'Name',
          rules: z.string().min(5, 'Too short'),
        },
      ],
    });
    const wrapper = mount(Form, { attachTo: document.body });
    wrappers.push(wrapper);
    await flushPromises();

    await formApi.validate();
    await flushPromises();
    expect(formApi.form.useFieldError('name').value).toBe('Too short');

    await wrapper.get('input').setValue('long enough');
    await flushPromises();

    expect(formApi.form.useFieldError('name').value).toBeUndefined();
  });

  it('drops a manually set error as soon as the user edits', async () => {
    const [Form, formApi] = useTamanForm({
      schema: [
        {
          component: TestInput,
          defaultValue: '',
          fieldName: 'name',
          label: 'Name',
        },
      ],
    });
    const wrapper = mount(Form, { attachTo: document.body });
    wrappers.push(wrapper);
    await flushPromises();

    await formApi.setFieldError('name', 'Username already taken');
    await flushPromises();
    expect(formApi.form.useFieldError('name').value).toBe(
      'Username already taken',
    );

    await wrapper.get('input').setValue('a');
    await flushPromises();

    expect(formApi.form.useFieldError('name').value).toBeUndefined();
  });
});
