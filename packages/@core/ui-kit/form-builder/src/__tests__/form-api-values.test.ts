import { describe, expect, it, vi } from 'vitest';

import type { PohonFormRef } from '../types';

import { FormApi } from '../form-api';

const Noop = {} as any;

function stubFormRef(overrides: Partial<PohonFormRef> = {}): PohonFormRef {
  return {
    clear: vi.fn(),
    dirty: false,
    dirtyFields: new Set<string>(),
    errors: [],
    getErrors: vi.fn(() => []),
    setErrors: vi.fn(),
    submit: vi.fn(async () => {}),
    touchedFields: new Set<string>(),
    validate: vi.fn(async () => ({})),
    ...overrides,
  };
}

describe('FormApi values', () => {
  it('setValues applies transform.in and merges; getValues applies transform.out', async () => {
    const api = new FormApi({
      fields: [
        {
          component: Noop,
          name: 'range',
          transform: {
            in: (_v, values) => [values.startDate, values.endDate],
            out: (value: any, setExtra) => {
              setExtra('startDate', value?.[0]);
              setExtra('endDate', value?.[1]);
              return undefined;
            },
          },
        },
      ],
    });
    await api.setValues({ startDate: 'a', endDate: 'b' });
    expect(api.values.range).toEqual(['a', 'b']);

    const out = api.getValues();
    expect(out.startDate).toBe('a');
    expect(out.endDate).toBe('b');
    expect('range' in out).toBe(false);

    expect(api.getRawValues().range).toEqual(['a', 'b']);
  });

  it('getValues excludes if===false fields unless keepValueOnHide', () => {
    const api = new FormApi({
      fields: [
        { component: Noop, name: 'a' },
        { component: Noop, name: 'b', keepValueOnHide: true },
      ],
      initialValues: { a: 1, b: 2 },
    });
    api.setFieldRuntime('a', { if: false });
    api.setFieldRuntime('b', { if: false });
    expect(api.getValues()).toEqual({ b: 2 });
  });

  it('setFieldValue writes a dot path and optionally validates', async () => {
    const validate = vi.fn(async () => ({}));
    const api = new FormApi();
    api.mount(stubFormRef({ validate }));
    await api.setFieldValue('user.name', 'x', true);
    expect(api.values.user.name).toBe('x');
    expect(validate).toHaveBeenCalledWith({ name: ['user.name'], silent: true });
  });

  it('setErrors maps {path,message} to pohon {name,message}; clearErrors clears', async () => {
    const formRef = stubFormRef();
    const api = new FormApi();
    api.mount(formRef);
    await api.setErrors([{ message: 'taken', path: 'email' }]);
    expect(formRef.setErrors).toHaveBeenCalledWith([{ message: 'taken', name: 'email' }]);
    await api.clearErrors(['email']);
    expect(formRef.clear).toHaveBeenCalledWith('email');
    await api.clearErrors();
    expect(formRef.clear).toHaveBeenCalledWith();
  });

  it('submit validates, applies transforms, calls handleSubmit, records latest submission', async () => {
    const handleSubmit = vi.fn();
    const api = new FormApi({
      fields: [{ component: Noop, name: 'tags', transform: { out: (v: any) => v.join(',') } }],
      handleSubmit,
      initialValues: { tags: ['a', 'b'] },
    });
    api.mount(stubFormRef());
    const out = await api.submit();
    expect(out).toEqual({ tags: 'a,b' });
    expect(handleSubmit).toHaveBeenCalledWith({ tags: 'a,b' });
    expect(api.getLatestSubmissionValues()).toEqual({ tags: 'a,b' });
  });

  it('submit returns undefined and does not call handleSubmit when invalid', async () => {
    const handleSubmit = vi.fn();
    const api = new FormApi({ handleSubmit });
    api.mount(
      stubFormRef({
        getErrors: vi.fn(() => [{ message: 'bad', name: 'a' }]),
        validate: vi.fn(async () => false as const),
      }),
    );
    expect(await api.submit()).toBeUndefined();
    expect(handleSubmit).not.toHaveBeenCalled();
  });

  it('submit awaits in-flight async validations and blocks on async errors', async () => {
    const handleSubmit = vi.fn();
    const api = new FormApi({ handleSubmit });
    const formRef = stubFormRef();
    api.mount(formRef);

    const pending = (async () => {
      await new Promise((resolve) => setTimeout(resolve, 20));
      await api.setAsyncError('email', 'taken');
    })();
    api.trackAsyncValidation(pending);

    expect(await api.submit()).toBeUndefined();
    expect(handleSubmit).not.toHaveBeenCalled();
    expect(formRef.setErrors).toHaveBeenCalledWith([{ message: 'taken', name: 'email' }]);
  });

  it('submitFromNativeEvent blocks on recorded async errors, skips handleSubmit, re-applies the error', async () => {
    const handleSubmit = vi.fn();
    const api = new FormApi({ handleSubmit });
    const formRef = stubFormRef();
    api.mount(formRef);

    // PForm's own submit-time validation already succeeded by the time the
    // native entry runs (that's how we got here) and its errors.value wipe
    // wholesale — simulate that: async error recorded, then form.setErrors
    // call history cleared so we can prove submitFromNativeEvent re-applies it.
    await api.setAsyncError('email', 'already taken');
    vi.mocked(formRef.setErrors).mockClear();

    expect(await api.submitFromNativeEvent()).toBeUndefined();
    expect(handleSubmit).not.toHaveBeenCalled();
    expect(formRef.setErrors).toHaveBeenCalledWith([
      { message: 'already taken', name: 'email' },
    ]);
  });

  it('submitFromNativeEvent proceeds when there are no async errors', async () => {
    const handleSubmit = vi.fn();
    const api = new FormApi({ handleSubmit });
    api.mount(stubFormRef());

    const result = await api.submitFromNativeEvent();
    expect(result).toEqual({});
    expect(handleSubmit).toHaveBeenCalledWith({});
  });

  it('submit keeps sync errors alongside async errors when both exist', async () => {
    const handleSubmit = vi.fn();
    const api = new FormApi({ handleSubmit });
    const formRef = stubFormRef({
      getErrors: vi.fn(() => [{ message: 'sync bad', name: 'a' }]),
      validate: vi.fn(async () => false as const),
    });
    api.mount(formRef);

    const pending = api.setAsyncError('email', 'taken');
    api.trackAsyncValidation(pending);
    await pending;

    expect(await api.submit()).toBeUndefined();
    expect(handleSubmit).not.toHaveBeenCalled();
    const lastSetErrorsCall = vi.mocked(formRef.setErrors).mock.calls.at(-1)?.[0];
    expect(lastSetErrorsCall).toEqual(
      expect.arrayContaining([
        { message: 'sync bad', name: 'a' },
        { message: 'taken', name: 'email' },
      ]),
    );
    expect(lastSetErrorsCall).toHaveLength(2);
  });

  it('resetForm restores initial values, clears errors, calls handleReset', async () => {
    const handleReset = vi.fn();
    const api = new FormApi({ handleReset, initialValues: { a: 1 } });
    const formRef = stubFormRef();
    api.mount(formRef);
    api.values.a = 99;
    api.values.extra = true;
    await api.resetForm();
    expect(api.values).toEqual({ a: 1 });
    expect(formRef.clear).toHaveBeenCalled();
    expect(handleReset).toHaveBeenCalledWith({ a: 1 });
  });

  it('resetForm(values) resets to the provided values instead', async () => {
    const api = new FormApi({ initialValues: { a: 1 } });
    api.mount(stubFormRef());
    await api.resetForm({ a: 7 });
    expect(api.values).toEqual({ a: 7 });
  });

  it('resetValidate clears errors without touching values', async () => {
    const formRef = stubFormRef();
    const api = new FormApi({ initialValues: { a: 1 } });
    api.mount(formRef);
    api.values.a = 99;
    await api.resetValidate();
    expect(formRef.clear).toHaveBeenCalledWith();
    expect(api.values.a).toBe(99);
  });

  it('getFieldError reads the live error for a name from the mounted form ref', async () => {
    const formRef = stubFormRef({
      errors: [{ message: 'bad email', name: 'email' }],
    });
    const api = new FormApi();
    api.mount(formRef);

    expect(api.getFieldError('email')).toBe('bad email');
    expect(api.getFieldError('missing')).toBeUndefined();
  });

  it('getFieldError returns undefined before the form mounts', () => {
    const api = new FormApi();
    expect(api.getFieldError('email')).toBeUndefined();
  });

  it('useValues returns a reactive computed over values', () => {
    const api = new FormApi({ initialValues: { count: 1 } });
    const selected = api.useValues((values) => values.count * 2);
    expect(selected.value).toBe(2);
    api.values.count = 5;
    expect(selected.value).toBe(10);
  });
});
