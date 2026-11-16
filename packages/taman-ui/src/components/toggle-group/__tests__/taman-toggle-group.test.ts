import type { TamanToggleGroupModel } from '../taman-toggle-group.types';

import { flushPromises, mount } from '@vue/test-utils';
import { ToggleGroupItem, ToggleGroupRoot } from 'akar';
import { describe, expect, it, vi } from 'vitest';
import { defineComponent, h, ref } from 'vue';

import TamanToggleGroup from '../taman-toggle-group.vue';

const ui = {
  label: () => '',
  leadingIcon: () => '',
};

/**
 * Mirrors pohon's ToggleGroup wiring on top of akar's real root and items,
 * so the pressed state and proposed values come from akar itself. Only the
 * themed PButton is replaced by a plain button. Every other prop lands in
 * `$attrs`, where the forwarding tests read it.
 */
vi.mock('pohon-ui/components/ToggleGroup.vue', () => ({
  default: defineComponent({
    name: 'PToggleGroup',
    inheritAttrs: false,
    props: {
      disabled: Boolean,
      items: {
        type: Array,
        default: () => [],
      },
      modelValue: { type: null, default: undefined },
      type: { type: String, default: 'single' },
    },
    emits: ['update:modelValue'],
    setup(props, { emit, slots }) {
      return () =>
        h(
          ToggleGroupRoot,
          {
            'disabled': props.disabled,
            'modelValue': props.modelValue,
            'type': props.type as 'single' | 'multiple',
            'onUpdate:modelValue': (value: unknown) => emit('update:modelValue', value),
          },
          () => (props.items as Array<Record<string, any>>).map((item, index) =>
            h(
              ToggleGroupItem,
              {
                asChild: true,
                disabled: item.disabled,
                key: String(item.value ?? index),
                value: item.value ?? String(index),
              },
              {
                default: ({ modelValue: pressed }: { modelValue: boolean }) => {
                  const slotProps = { index, item, pressed, ui };

                  return h(
                    'button',
                    {
                      'data-active': String(pressed),
                      'data-icon': item.leadingIcon,
                      'data-loading': String(Boolean(item.loading)),
                      'disabled': item.disabled || item.loading,
                    },
                    [
                      slots.leading?.(slotProps),
                      slots.default?.(slotProps) ?? item.label,
                    ],
                  );
                },
              },
            ),
          ),
        );
    },
  }),
}));

const items = [
  { label: 'Option A', value: 'a' },
  { label: 'Option B', value: 'b' },
  { label: 'Option C', value: 'c' },
];

function mountGroup(
  initial: TamanToggleGroupModel,
  props: Record<string, unknown> = {},
  slots: Record<string, unknown> = {},
) {
  const modelValue = ref<TamanToggleGroupModel>(initial);
  const clicks: Array<unknown> = [];

  const Harness = defineComponent({
    setup() {
      return () =>
        h(TamanToggleGroup, {
          items,
          'modelValue': modelValue.value,
          'onItemClick': (value: unknown) => clicks.push(value),
          'onUpdate:modelValue': (value: TamanToggleGroupModel) => {
            modelValue.value = value;
          },
          ...props,
        }, slots);
    },
  });

  const wrapper = mount(Harness, { attachTo: document.body });
  const buttons = () => wrapper.findAll('button');
  const forwarded = () => wrapper.findComponent({ name: 'PToggleGroup' }).vm.$attrs;

  return {
    buttons,
    clicks,
    forwarded,
    modelValue,
    wrapper,
  };
}

async function click(button: { trigger: (event: string) => Promise<void> }) {
  await button.trigger('click');
  await flushPromises();
}

/** A `beforeChange` that stays pending until `resolve` is called. */
function deferredBeforeChange() {
  let resolve!: (value: boolean) => void;
  const beforeChange = () => new Promise<boolean>((r) => {
    resolve = r;
  });

  return {
    beforeChange,
    resolve: (value: boolean) => resolve(value),
  };
}

describe('taman-toggle-group', () => {
  it('renders one button per item and marks the checked one', () => {
    const { buttons } = mountGroup('a');

    expect(buttons().map((button) => button.text())).toEqual(['Option A', 'Option B', 'Option C']);
    expect(buttons()[0]!.attributes('data-active')).toBe('true');
    expect(buttons()[0]!.attributes('aria-pressed')).toBe('true');
    expect(buttons()[1]!.attributes('data-active')).toBe('false');
    expect(buttons()[1]!.attributes('aria-pressed')).toBe('false');
  });

  it('shows check icons unless showIcon is off or the item sets its own', () => {
    const { buttons } = mountGroup('a', {
      items: [
        ...items.slice(0, 2),
        { label: 'Option C', leadingIcon: 'lucide:star', value: 'c' },
      ],
    });

    expect(buttons().map((button) => button.attributes('data-icon')))
      .toEqual(['lucide:circle-check-big', 'lucide:circle', 'lucide:star']);

    const hidden = mountGroup('a', { showIcon: false });
    expect(hidden.buttons()[0]!.attributes('data-icon')).toBeUndefined();
  });

  it('forwards PToggleGroup props with the taman styling defaults', () => {
    const { forwarded } = mountGroup('a', { orientation: 'vertical', size: 'lg' });

    expect(forwarded()).toMatchObject({
      activeColor: 'primary',
      activeVariant: 'solid',
      attached: true,
      color: 'neutral',
      orientation: 'vertical',
      size: 'lg',
      variant: 'outline',
    });
    for (const key of [
      'allowClear',
      'beforeChange',
      'items',
      'maxCount',
      'showIcon',
    ]) {
      expect(forwarded()).not.toHaveProperty(key);
    }
  });

  it('keeps PToggleGroup\'s boolean defaults and lets callers override styling', () => {
    const { forwarded } = mountGroup('a', { attached: false, variant: 'ghost' });

    expect(forwarded()).toMatchObject({
      attached: false,
      loop: true,
      rovingFocus: true,
      variant: 'ghost',
    });
  });

  it('selects a single value and emits itemClick', async () => {
    const { buttons, clicks, modelValue } = mountGroup('a');

    await click(buttons()[1]!);

    expect(modelValue.value).toBe('b');
    expect(clicks).toEqual(['b']);
    expect(buttons()[1]!.attributes('data-active')).toBe('true');
    expect(buttons()[0]!.attributes('data-active')).toBe('false');
  });

  it('selects from an empty single selection', async () => {
    const { buttons, modelValue } = mountGroup(undefined);

    await click(buttons()[2]!);

    expect(modelValue.value).toBe('c');
    expect(buttons()[2]!.attributes('data-active')).toBe('true');
  });

  it('falls back to the index for items without a value', async () => {
    const { buttons, modelValue } = mountGroup(undefined, {
      items: [
        { label: 'First' },
        { label: 'Second' },
      ],
    });

    await click(buttons()[1]!);

    expect(modelValue.value).toBe('1');
    expect(buttons()[1]!.attributes('data-active')).toBe('true');
  });

  it('supports boolean values, including false', async () => {
    const { buttons, modelValue } = mountGroup(true, {
      items: [
        { label: 'Yes', value: true },
        { label: 'No', value: false },
      ],
    });

    await click(buttons()[1]!);

    expect(modelValue.value).toBe(false);
    expect(buttons().map((button) => button.attributes('data-active'))).toEqual(['false', 'true']);

    await click(buttons()[1]!);

    expect(modelValue.value).toBe(false);
    expect(buttons()[1]!.attributes('data-active')).toBe('true');
  });

  it('keeps the checked item pressed without allowClear', async () => {
    const { buttons, clicks, modelValue } = mountGroup('a');

    await click(buttons()[0]!);

    expect(modelValue.value).toBe('a');
    expect(clicks).toEqual(['a']);
    expect(buttons()[0]!.attributes('data-active')).toBe('true');
  });

  it('clears the value with allowClear and emits undefined', async () => {
    const { buttons, clicks, modelValue } = mountGroup('a', { allowClear: true });

    await click(buttons()[0]!);

    expect(modelValue.value).toBeUndefined();
    expect(clicks).toEqual([undefined]);
    expect(buttons()[0]!.attributes('data-active')).toBe('false');
  });

  it('toggles values in multiple mode', async () => {
    const { buttons, modelValue } = mountGroup(['a'], { type: 'multiple' });

    await click(buttons()[1]!);
    expect(modelValue.value).toEqual(['a', 'b']);

    await click(buttons()[0]!);
    expect(modelValue.value).toEqual(['b']);
    expect(buttons()[0]!.attributes('data-active')).toBe('false');
    expect(buttons()[1]!.attributes('data-active')).toBe('true');
  });

  it('replaces the newest pick at maxCount', async () => {
    const { buttons, modelValue } = mountGroup(['a', 'b'], { maxCount: 2, type: 'multiple' });

    await click(buttons()[2]!);

    expect(modelValue.value).toEqual(['a', 'c']);
    expect(buttons().map((button) => button.attributes('data-active'))).toEqual(['true', 'false', 'true']);
  });

  it('keeps the value when beforeChange resolves false', async () => {
    const beforeChange = vi.fn(async () => false);
    const { buttons, clicks, modelValue } = mountGroup('a', { beforeChange });

    await click(buttons()[1]!);

    expect(beforeChange).toHaveBeenCalledWith('b', true);
    expect(modelValue.value).toBe('a');
    expect(clicks).toEqual([]);
    expect(buttons()[1]!.attributes('data-active')).toBe('false');
  });

  it('leaves an empty single selection unpressed when beforeChange refuses', async () => {
    const { buttons, modelValue } = mountGroup(undefined, {
      beforeChange: async () => false,
    });

    await click(buttons()[0]!);

    expect(modelValue.value).toBeUndefined();
    expect(buttons()[0]!.attributes('data-active')).toBe('false');
  });

  it('shows loading and locks single mode while beforeChange is pending', async () => {
    const { beforeChange, resolve } = deferredBeforeChange();
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

  it('forwards slots with the pressed state and loading item', async () => {
    const { beforeChange, resolve } = deferredBeforeChange();
    const { buttons } = mountGroup('a', { beforeChange }, {
      default: ({ item }: { item: { label: string } }) => h('b', item.label.toUpperCase()),
      leading: ({ item, pressed }: { item: { loading?: boolean }; pressed: boolean }) =>
        h('i', {
          'data-loading-slot': String(Boolean(item.loading)),
          'data-pressed': String(pressed),
        }),
    });

    expect(buttons()[0]!.find('b').text()).toBe('OPTION A');
    expect(buttons()[0]!.find('i').attributes('data-pressed')).toBe('true');
    expect(buttons()[1]!.find('i').attributes('data-pressed')).toBe('false');

    await buttons()[1]!.trigger('click');
    expect(buttons()[1]!.find('i').attributes('data-loading-slot')).toBe('true');

    resolve(false);
    await flushPromises();
  });
});
