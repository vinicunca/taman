import type { TamanButtonCheckGroupModel } from '../taman-button-check-group.types';

import { flushPromises, mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import { defineComponent, h, ref } from 'vue';

import TamanButtonCheckGroup from '../taman-button-check-group.vue';

const ui = { label: () => '', leadingIcon: () => '' };

vi.mock('pohon-ui/components/Button.vue', () => ({
  default: defineComponent({
    name: 'PButton',
    props: {
      active: Boolean,
      disabled: Boolean,
      leadingIcon: String,
      loading: Boolean,
    },
    setup(props, { attrs, slots }) {
      return () =>
        h(
          'button',
          {
            ...attrs,
            'data-active': String(props.active),
            'data-icon': props.leadingIcon,
            'data-loading': String(props.loading),
            'disabled': props.disabled,
          },
          [slots.leading?.({ ui }), slots.default?.({ ui })],
        );
    },
  }),
}));

vi.mock('pohon-ui/components/FieldGroup.vue', () => ({
  default: defineComponent({
    name: 'PFieldGroup',
    setup(_, { slots }) {
      return () => h('div', slots.default?.());
    },
  }),
}));

const options = [
  { label: 'Option A', value: 'a' },
  { label: 'Option B', value: 'b' },
];

function mountGroup(
  initial: TamanButtonCheckGroupModel,
  props: Record<string, unknown> = {},
) {
  const modelValue = ref<TamanButtonCheckGroupModel>(initial);
  const clicks: Array<unknown> = [];

  const Harness = defineComponent({
    setup() {
      return () =>
        h(TamanButtonCheckGroup, {
          'modelValue': modelValue.value,
          'onBtnClick': (value: unknown) => clicks.push(value),
          'onUpdate:modelValue': (value: TamanButtonCheckGroupModel) => {
            modelValue.value = value;
          },
          options,
          ...props,
        });
    },
  });

  const wrapper = mount(Harness);
  const buttons = () => wrapper.findAll('button');

  return { buttons, clicks, modelValue, wrapper };
}

describe('taman-button-check-group', () => {
  it('renders one button per option and marks the checked one', () => {
    const { buttons } = mountGroup('a');

    expect(buttons().map((button) => button.text())).toEqual(['Option A', 'Option B']);
    expect(buttons()[0]!.attributes('data-active')).toBe('true');
    expect(buttons()[0]!.attributes('aria-pressed')).toBe('true');
    expect(buttons()[1]!.attributes('data-active')).toBe('false');
    expect(buttons()[0]!.attributes('data-icon')).toBe('lucide:circle-check-big');
    expect(buttons()[1]!.attributes('data-icon')).toBe('lucide:circle');
  });

  it('selects a single value and emits btnClick', async () => {
    const { buttons, clicks, modelValue } = mountGroup('a');

    await buttons()[1]!.trigger('click');
    await flushPromises();

    expect(modelValue.value).toBe('b');
    expect(clicks).toEqual(['b']);
    expect(buttons()[1]!.attributes('data-active')).toBe('true');
  });

  it('toggles values in multiple mode', async () => {
    const { buttons, modelValue } = mountGroup(['a'], { multiple: true });

    await buttons()[1]!.trigger('click');
    await flushPromises();
    expect(modelValue.value).toEqual(['a', 'b']);

    await buttons()[0]!.trigger('click');
    await flushPromises();
    expect(modelValue.value).toEqual(['b']);
  });

  it('clears the value with allowClear and emits undefined', async () => {
    const { buttons, clicks, modelValue } = mountGroup('a', { allowClear: true });

    await buttons()[0]!.trigger('click');
    await flushPromises();

    expect(modelValue.value).toBeUndefined();
    expect(clicks).toEqual([undefined]);
  });

  it('keeps the value when beforeChange resolves false', async () => {
    const beforeChange = vi.fn(async () => false);
    const { buttons, clicks, modelValue } = mountGroup('a', { beforeChange });

    await buttons()[1]!.trigger('click');
    await flushPromises();

    expect(beforeChange).toHaveBeenCalledWith('b', true);
    expect(modelValue.value).toBe('a');
    expect(clicks).toEqual([]);
  });

  it('shows loading and locks single mode while beforeChange is pending', async () => {
    let resolve!: (value: boolean) => void;
    const beforeChange = () => new Promise<boolean>((r) => {
      resolve = r;
    });
    const { buttons, modelValue } = mountGroup('a', { beforeChange });

    await buttons()[1]!.trigger('click');

    expect(buttons()[1]!.attributes('data-loading')).toBe('true');
    expect(buttons()[0]!.attributes('disabled')).toBeDefined();
    expect(buttons()[1]!.attributes('disabled')).toBeDefined();

    resolve(true);
    await flushPromises();

    expect(modelValue.value).toBe('b');
    expect(buttons()[1]!.attributes('data-loading')).toBe('false');
    expect(buttons()[0]!.attributes('disabled')).toBeUndefined();
  });
});
