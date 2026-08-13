import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { defineComponent, h, nextTick } from 'vue';
import { mount } from '@vue/test-utils';

import type { FieldConfig } from '../types';

import { FormApi } from '../form-api';
import { useAsyncValidate } from '../use-async-validate';

const Noop = {} as any;

function harness(field: FieldConfig, api: FormApi) {
  let result: ReturnType<typeof useAsyncValidate>;
  const Host = defineComponent({
    setup: () => {
      result = useAsyncValidate({ api, field: () => field });
      return () => h('div');
    },
  });
  const wrapper = mount(Host);
  return { result: result!, wrapper };
}

describe('useAsyncValidate', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('debounces input-mode validation and reports errors via setAsyncError', async () => {
    const handler = vi.fn(async (value: unknown) =>
      value === 'taken' ? 'already taken' : undefined,
    );
    const api = new FormApi({ initialValues: { email: '' } });
    const setAsyncError = vi.spyOn(api, 'setAsyncError').mockResolvedValue();

    const field: FieldConfig = {
      asyncValidate: { debounce: 100, handler, on: 'input' },
      component: Noop,
      name: 'email',
    };
    harness(field, api);

    api.values.email = 't';
    await nextTick();
    api.values.email = 'taken';
    await nextTick();

    expect(handler).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(100);
    expect(handler).toHaveBeenCalledTimes(1); // debounced to one call
    expect(handler).toHaveBeenCalledWith('taken', expect.anything());
    expect(setAsyncError).toHaveBeenCalledWith('email', 'already taken');
  });

  it('blur-mode validates on onBlur, not on value change', async () => {
    const handler = vi.fn(async () => undefined);
    const api = new FormApi({ initialValues: { email: '' } });
    vi.spyOn(api, 'setAsyncError').mockResolvedValue();

    const field: FieldConfig = {
      asyncValidate: { handler },
      component: Noop,
      name: 'email',
    };
    const { result } = harness(field, api);

    api.values.email = 'x';
    await nextTick();
    await vi.advanceTimersByTimeAsync(1000);
    expect(handler).not.toHaveBeenCalled();

    result.onBlur();
    await vi.advanceTimersByTimeAsync(300); // default debounce
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('stale results are discarded (last-wins run tokens)', async () => {
    const resolvers: Array<(v: string | undefined) => void> = [];
    const handler = vi.fn(
      () => new Promise<string | undefined>((resolve) => resolvers.push(resolve)),
    );
    const api = new FormApi({ initialValues: { email: '' } });
    const setAsyncError = vi.spyOn(api, 'setAsyncError').mockResolvedValue();

    const field: FieldConfig = {
      asyncValidate: { debounce: 10, handler, on: 'input' },
      component: Noop,
      name: 'email',
    };
    const { result } = harness(field, api);

    api.values.email = 'first';
    await nextTick();
    await vi.advanceTimersByTimeAsync(10); // run 1 in flight

    api.values.email = 'second';
    await nextTick();
    await vi.advanceTimersByTimeAsync(10); // run 2 in flight

    resolvers[1]('second-error');
    await vi.runAllTicks();
    resolvers[0]('first-error'); // stale — must be ignored
    await vi.runAllTicks();

    expect(setAsyncError).toHaveBeenCalledWith('email', 'second-error');
    expect(setAsyncError).not.toHaveBeenCalledWith('email', 'first-error');
    expect(result.validating.value).toBe(false);
  });

  it('exposes validating state while a run is in flight', async () => {
    let release!: (v: string | undefined) => void;
    const handler = vi.fn(() => new Promise<string | undefined>((r) => (release = r)));
    const api = new FormApi({ initialValues: { email: '' } });
    vi.spyOn(api, 'setAsyncError').mockResolvedValue();

    const { result } = harness(
      { asyncValidate: { debounce: 0, handler, on: 'input' }, component: Noop, name: 'email' },
      api,
    );
    api.values.email = 'x';
    await nextTick();
    await vi.advanceTimersByTimeAsync(0);
    expect(result.validating.value).toBe(true);
    release(undefined);
    await vi.runAllTicks();
    expect(result.validating.value).toBe(false);
  });

  it('rejecting handler reports the message with no unhandled rejection', async () => {
    const unhandled: unknown[] = [];
    const onUnhandled = (reason: unknown) => {
      unhandled.push(reason);
    };
    process.on('unhandledRejection', onUnhandled);
    try {
      const handler = vi.fn(async () => {
        throw new Error('boom');
      });
      const api = new FormApi({ initialValues: { email: '' } });
      const setAsyncError = vi.spyOn(api, 'setAsyncError').mockResolvedValue();

      const field: FieldConfig = {
        asyncValidate: { debounce: 5, handler, on: 'input' },
        component: Noop,
        name: 'email',
      };
      harness(field, api);

      api.values.email = 'x';
      await nextTick();
      await vi.advanceTimersByTimeAsync(5);
      await vi.runAllTicks();
      expect(setAsyncError).toHaveBeenCalledWith('email', 'boom');

      // Give Node real macrotask turns so any unhandled rejection from the
      // trackAsyncValidation chain would surface before we assert.
      vi.useRealTimers();
      await new Promise((resolve) => setTimeout(resolve, 0));
      await new Promise((resolve) => setTimeout(resolve, 0));
      expect(unhandled).toEqual([]);
    } finally {
      process.off('unhandledRejection', onUnhandled);
    }
  });
});
