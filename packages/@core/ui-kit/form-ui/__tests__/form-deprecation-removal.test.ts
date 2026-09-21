import type { FormSchema } from '../src/form.types';

import { beforeAll, describe, expect, it, vi } from 'vitest';

import { setupTamanForm } from '../src/form.config';
import { useTamanForm } from '../src/form.use-taman-form';

beforeAll(() => {
  setupTamanForm({});
});

describe('removed deprecated form api aliases', () => {
  it('no longer exposes the legacy method names', () => {
    const [, formApi] = useTamanForm({ schema: [] });
    const untypedFormApi = formApi as unknown as Record<string, unknown>;

    expect(untypedFormApi.resetForm).toBeUndefined();
    expect(untypedFormApi.resetValidate).toBeUndefined();
    expect(untypedFormApi.submitForm).toBeUndefined();
    expect(untypedFormApi.validateAndSubmitForm).toBeUndefined();
  });

  it('still exposes the canonical method names', () => {
    const [, formApi] = useTamanForm({ schema: [] });

    expect(typeof formApi.reset).toBe('function');
    expect(typeof formApi.clearValidation).toBe('function');
    expect(typeof formApi.submit).toBe('function');
    expect(typeof formApi.validateAndSubmit).toBe('function');
  });
});

describe('removed legacy dependency callbacks', () => {
  it('only accepts the resolve form', () => {
    const schema: FormSchema = {
      component: 'Input',
      dependencies: {
        resolve: () => ({ disabled: true }),
        triggerFields: ['other'],
      },
      fieldName: 'name',
    };

    expect(schema.dependencies?.resolve).toBeTypeOf('function');
    expect(
      Object.keys(schema.dependencies ?? {}).sort(),
    ).toEqual(['resolve', 'triggerFields']);
  });
});

describe('removed defineRules setup option', () => {
  it('registers rules only through the `rules` option', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    setupTamanForm({
      rules: {
        required: () => true,
      },
    });

    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });
});
