import type { VueWrapper } from '@vue/test-utils';

import type { FormZodErrorMap } from '../form.types';

import { flushPromises, mount } from '@vue/test-utils';
import { afterEach, describe, expect, it } from 'vitest';
import { defineComponent, h } from 'vue';
import { z } from 'zod';

import { setupTamanForm } from '../form.config';
import { useTamanForm } from '../form.use-taman-form';

const wrappers: Array<VueWrapper> = [];

const TestInput = defineComponent({
  inheritAttrs: false,
  emits: ['update:modelValue'],
  setup(_, { attrs, emit }) {
    return () =>
      h('input', {
        ...attrs,
        onInput: (event: Event) => emit('update:modelValue', (event.target as HTMLInputElement).value),
        value: attrs.modelValue ?? '',
      });
  },
});

async function validateField(
  rules: z.ZodType,
  { value, withDependencies = false }: { value: unknown; withDependencies?: boolean },
) {
  const [Form, formApi] = useTamanForm({
    schema: [
      {
        component: TestInput,
        fieldName: 'name',
        label: 'Name',
        rules,
        ...(withDependencies && {
          dependencies: {
            resolve: () => ({ disabled: false }),
            triggerFields: ['other'],
          },
        }),
      },
    ],
  });
  const wrapper = mount(Form);
  wrappers.push(wrapper);
  await flushPromises();
  await formApi.setFieldValue('name', value);
  return formApi.validate();
}

const describeIssue: FormZodErrorMap = (issue, context) =>
  `${context.label} (${context.name}): ${issue.code}`;

afterEach(() => {
  for (const wrapper of wrappers.splice(0)) {
    wrapper.unmount();
  }
  setupTamanForm({});
});

describe('setupTamanForm zodErrorMap', () => {
  it('formats zod rule issues with the field context', async () => {
    setupTamanForm({ zodErrorMap: describeIssue });

    expect(await validateField(z.string().min(3), { value: 'ab' })).toEqual({
      errors: { name: 'Name (name): too_small' },
      valid: false,
    });
  });

  it('formats zod rule issues on fields with dependencies', async () => {
    setupTamanForm({ zodErrorMap: describeIssue });

    expect(
      await validateField(z.string().min(3), { value: 'ab', withDependencies: true }),
    ).toEqual({
      errors: { name: 'Name (name): too_small' },
      valid: false,
    });
  });

  it('exposes the raw input so empty values can be reported as required', async () => {
    setupTamanForm({
      zodErrorMap: (issue, { label }) => (issue.input === ''
        ? `${label} is required`
        : undefined),
    });

    expect(await validateField(z.string().trim().min(1), { value: '' })).toEqual({
      errors: { name: 'Name is required' },
      valid: false,
    });
  });

  it('keeps messages written on the schema', async () => {
    setupTamanForm({ zodErrorMap: describeIssue });

    expect(await validateField(z.string().min(3, 'Schema message'), { value: 'ab' })).toEqual({
      errors: { name: 'Schema message' },
      valid: false,
    });
  });

  it('falls back to zod messages when the map returns undefined', async () => {
    const zodMessage = z.string().min(3).safeParse('ab').error?.issues[0]?.message;
    setupTamanForm({
      zodErrorMap: () => undefined,
    });

    expect(await validateField(z.string().min(3), { value: 'ab' })).toEqual({
      errors: { name: zodMessage },
      valid: false,
    });
  });

  it('is cleared when setupTamanForm runs again without one', async () => {
    const zodMessage = z.string().min(3).safeParse('ab').error?.issues[0]?.message;
    setupTamanForm({ zodErrorMap: describeIssue });
    setupTamanForm({});

    expect(await validateField(z.string().min(3), { value: 'ab' })).toEqual({
      errors: { name: zodMessage },
      valid: false,
    });
  });
});
