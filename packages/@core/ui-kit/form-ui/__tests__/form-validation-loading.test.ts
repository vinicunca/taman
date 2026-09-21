import type { VueWrapper } from '@vue/test-utils';

import { flushPromises, mount } from '@vue/test-utils';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { defineComponent, effectScope, h, nextTick, ref } from 'vue';
import { z } from 'zod';

import { setupTamanForm } from '../src/form.config';
import { useDelayedFlag } from '../src/form.use-delayed-flag';
import { useTamanForm } from '../src/form.use-taman-form';

const wrappers: Array<VueWrapper> = [];

function createDeferred<T>() {
  let resolvePromise: (value: T) => void = () => {};
  const promise = new Promise<T>((resolve) => {
    resolvePromise = resolve;
  });
  return { promise, resolve: resolvePromise };
}

// Declares `loading` as an actual prop (not left to fall through `$attrs`) so
// `.props('loading')` below reads the value `createComponentProps` binds —
// an attrs-based read would see it stripped, since a declared prop is never
// part of `$attrs`.
const TestInput = defineComponent({
  inheritAttrs: false,
  props: {
    loading: {
      default: false,
      type: Boolean,
    },
  },
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

describe('useDelayedFlag', () => {
  it('stays false until the source has been true for the full delay', async () => {
    vi.useFakeTimers();
    const scope = effectScope();
    const source = ref(false);
    let flag!: { value: boolean };

    scope.run(() => {
      flag = useDelayedFlag(() => source.value, 150);
    });

    source.value = true;
    await nextTick();
    expect(flag.value).toBe(false);

    vi.advanceTimersByTime(149);
    expect(flag.value).toBe(false);

    vi.advanceTimersByTime(1);
    await nextTick();
    expect(flag.value).toBe(true);

    scope.stop();
    vi.useRealTimers();
  });

  it('never flips for a source that settles before the delay', async () => {
    vi.useFakeTimers();
    const scope = effectScope();
    const source = ref(false);
    let flag!: { value: boolean };

    scope.run(() => {
      flag = useDelayedFlag(() => source.value, 150);
    });

    source.value = true;
    await nextTick();
    vi.advanceTimersByTime(100);
    source.value = false;
    await nextTick();
    vi.advanceTimersByTime(100);
    await nextTick();

    expect(flag.value).toBe(false);

    scope.stop();
    vi.useRealTimers();
  });

  it('drops to false immediately when the source goes false', async () => {
    vi.useFakeTimers();
    const scope = effectScope();
    const source = ref(false);
    let flag!: { value: boolean };

    scope.run(() => {
      flag = useDelayedFlag(() => source.value, 150);
    });

    source.value = true;
    await nextTick();
    vi.advanceTimersByTime(150);
    await nextTick();
    expect(flag.value).toBe(true);

    source.value = false;
    await nextTick();
    expect(flag.value).toBe(false);

    scope.stop();
    vi.useRealTimers();
  });

  it('clears its pending timer when the owning scope is disposed', async () => {
    vi.useFakeTimers();
    const clearTimeoutSpy = vi.spyOn(globalThis, 'clearTimeout');
    const scope = effectScope();
    const source = ref(false);
    let flag!: { value: boolean };

    scope.run(() => {
      flag = useDelayedFlag(() => source.value, 150);
    });

    source.value = true;
    await nextTick();

    const callsBeforeDispose = clearTimeoutSpy.mock.calls.length;
    scope.stop();
    expect(clearTimeoutSpy.mock.calls.length).toBeGreaterThan(
      callsBeforeDispose,
    );

    // With the timer cleared, advancing past the delay must not flip the
    // flag — proving the pending callback never fires into the dead scope.
    vi.advanceTimersByTime(150);
    expect(flag.value).toBe(false);

    clearTimeoutSpy.mockRestore();
    vi.useRealTimers();
  });
});

// `useDelayedFlag` in isolation (above) proves the delay/drop timing in a
// vacuum. This proves the other half of the wiring: that a field's
// `useFieldValidating(fieldName)` state actually reaches the rendered
// component's `loading` prop through `createComponentProps`
// (form-render-form-field.vue), not just the composable's own return value.
describe('useFieldValidating reaching the field component', () => {
  it('keeps the field and submit action busy across repeated async schema validation', async () => {
    vi.useFakeTimers();
    const validationResults = [
      createDeferred<boolean>(),
      createDeferred<boolean>(),
    ];
    let currentValidation = validationResults[0]!;
    const [Form] = useTamanForm({
      schema: [
        {
          component: TestInput,
          defaultValue: 'valid',
          fieldName: 'name',
          formFieldProps: {
            validators: {
              onChangeAsync: z.string().refine(
                async () => currentValidation.promise,
              ),
            },
          },
          label: 'Name',
        },
      ],
    });
    const wrapper = mount(Form);
    wrappers.push(wrapper);
    await flushPromises();
    const input = wrapper.getComponent(TestInput);
    const submitButton = wrapper
      .findAll('button')
      .find((button) => button.text() === 'Submit');
    expect(submitButton).toBeDefined();

    for (const [index, validationResult] of validationResults.entries()) {
      currentValidation = validationResult;
      await wrapper.get('input').setValue(`valid-${index}`);
      await nextTick();
      await Promise.resolve();
      expect(input.props('loading')).toBe(false);

      await vi.advanceTimersByTimeAsync(149);
      expect(input.props('loading')).toBe(false);

      await vi.advanceTimersByTimeAsync(1);
      expect(input.props('loading')).toBe(true);
      expect(submitButton?.attributes('disabled')).toBeDefined();

      validationResult.resolve(true);
      await flushPromises();
      expect(input.props('loading')).toBe(false);
      expect(submitButton?.attributes('disabled')).toBeUndefined();
    }

    vi.useRealTimers();
  });
});
