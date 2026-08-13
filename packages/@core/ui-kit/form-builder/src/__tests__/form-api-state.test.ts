import { describe, expect, it, vi } from 'vitest';
import { readonly } from 'vue';
import { z } from 'zod';

import type { PohonFormRef } from '../types';

import { FormApi } from '../form-api';

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

const Noop = {} as any;

describe('FormApi state', () => {
  it('constructs with defaults merged under options', () => {
    const api = new FormApi({ collapsedRows: 2 });
    expect(api.state!.collapsedRows).toBe(2);
    expect(api.state!.showDefaultActions).toBe(true);
    expect(api.state!.showResetButton).toBe(true);
    expect(api.state!.errorDisplay).toBe('inline');
    expect(api.state!.fields).toEqual([]);
  });

  it('showResetButton can be turned off independently of showDefaultActions', () => {
    const api = new FormApi({ showResetButton: false });
    expect(api.state!.showResetButton).toBe(false);
    expect(api.state!.showDefaultActions).toBe(true);
  });

  it('seeds values from initialValues', () => {
    const api = new FormApi({ initialValues: { a: { b: 1 } } });
    expect(api.values.a.b).toBe(1);
  });

  it('setState merges partial state and functional updates', () => {
    const api = new FormApi();
    api.setState({ disabled: true });
    expect(api.state!.disabled).toBe(true);
    api.setState((prev) => ({ collapsedRows: prev.collapsedRows + 1 }));
    expect(api.state!.collapsedRows).toBe(2);
  });

  it('setState({ fields }) marks field configs raw', () => {
    const api = new FormApi();
    api.setState({
      fields: [{ component: Noop, name: 'a', rules: z.string() }],
    });

    const field = api.state!.fields[0] as any;
    // markRaw flag: keeps Vue's reactive()/readonly() from proxying the
    // config, whose zod rules carry non-configurable lazy getters that
    // violate Proxy invariants once wrapped (see markFieldsRaw).
    expect(field.__v_skip).toBe(true);
    // readonly() must skip a marked object entirely, so nested access
    // returns the raw schema by identity instead of a throwing proxy.
    expect(readonly(field).rules).toBe(field.rules);
  });

  it('setState functional updates returning fields mark field configs raw', () => {
    const api = new FormApi();
    api.setState(() => ({
      fields: [{ component: Noop, name: 'b', rules: z.string() }],
    }));

    const field = api.state!.fields[0] as any;
    expect(field.__v_skip).toBe(true);
    expect(readonly(field).rules).toBe(field.rules);
  });

  it('updateSchema merges partial field configs by name', () => {
    const api = new FormApi({
      fields: [{ component: Noop, name: 'a', label: 'A' }],
    });
    api.updateSchema([{ name: 'a', label: 'A2', help: 'hint' }]);
    const field = api.state!.fields[0] as any;
    expect(field.label).toBe('A2');
    expect(field.help).toBe('hint');
    expect(field.component).toBe(Noop);
  });

  it('setFields replaces fields, prunes removed values and clears their errors', () => {
    const api = new FormApi({
      fields: [
        { component: Noop, name: 'a' },
        { component: Noop, name: 'b' },
      ],
      initialValues: { a: 1, b: 2 },
    });
    const formRef = stubFormRef();
    api.mount(formRef);

    api.setFields([{ component: Noop, name: 'a' }]);
    expect(api.state!.fields).toHaveLength(1);
    expect('b' in api.values).toBe(false);
    expect(api.values.a).toBe(1);
    expect(formRef.clear).toHaveBeenCalledWith('b');
  });

  it('setFields throws on duplicate names', () => {
    const api = new FormApi();
    expect(() =>
      api.setFields([
        { component: Noop, name: 'x' },
        { component: Noop, name: 'x' },
      ]),
    ).toThrowError(/duplicate/i);
  });

  it('queues calls made before mount and flushes them after mount', async () => {
    const api = new FormApi({ fields: [{ component: Noop, name: 'a', rules: z.string() }] });
    const validateSpy = vi.fn(async () => ({}));
    const pending = api.validate(); // Task 7 method; queues on getForm()

    let settled = false;
    pending.then(() => {
      settled = true;
    });
    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(settled).toBe(false);

    api.mount(stubFormRef({ validate: validateSpy }));
    await pending;
    expect(validateSpy).toHaveBeenCalled();
  });

  it('queued pre-mount call rejects when the form unmounts first', async () => {
    const api = new FormApi();
    const pending = api.validate();
    pending.catch(() => {});
    api.unmount();
    await expect(pending).rejects.toThrow(/unmounted before mounting/);
  });

  it('latch re-arms after an unmount/mount cycle', async () => {
    const api = new FormApi();
    api.mount(stubFormRef());
    api.unmount();

    const validateSpy = vi.fn(async () => ({}));
    const pending = api.validate();
    pending.catch(() => {});

    let settled = false;
    pending.then(
      () => {
        settled = true;
      },
      () => {
        settled = true;
      },
    );
    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(settled).toBe(false);

    api.mount(stubFormRef({ validate: validateSpy }));
    await pending;
    expect(validateSpy).toHaveBeenCalled();
  });

  it('unmount resets the latch so post-unmount calls queue again', () => {
    const api = new FormApi();
    api.mount(stubFormRef());
    api.unmount();
    expect(api.isMounted).toBe(false);
  });

  it('setFieldRuntime merges partial runtime and getFieldRuntime returns defaults', () => {
    const api = new FormApi();
    expect(api.getFieldRuntime('a').if).toBe(true);
    api.setFieldRuntime('a', { if: false, disabled: true });
    expect(api.runtime.a.if).toBe(false);
    expect(api.runtime.a.disabled).toBe(true);
    expect(api.runtime.a.show).toBe(true);
  });
});
