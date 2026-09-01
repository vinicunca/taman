import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import { defineComponent, h, markRaw, nextTick, ref } from 'vue';

import ApiComponent from '../app-fetch-component.vue';

vi.mock('pohon-ui/runtime/vue/components/Icon.vue', () => ({
  default: {
    name: 'PIconStub',
    render() {
      return null;
    },
  },
}));

const ValueInput = defineComponent({
  name: 'ValueInput',
  props: {
    value: { type: String, default: undefined },
  },
  emits: ['update:value'],
  setup(props, { emit }) {
    return () =>
      h(
        'button',
        { onClick: () => emit('update:value', 'selected') },
        props.value,
      );
  },
});

const ModelValueInput = defineComponent({
  name: 'ModelValueInput',
  props: {
    modelValue: { type: String, default: undefined },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    return () =>
      h(
        'button',
        { onClick: () => emit('update:modelValue', 'selected') },
        props.modelValue,
      );
  },
});

const KebabModelInput = defineComponent({
  name: 'KebabModelInput',
  props: {
    modelValue: { type: String, default: undefined },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    return () =>
      h(
        'button',
        { onClick: () => emit('update:modelValue', 'selected') },
        props.modelValue,
      );
  },
});

describe('api-component.vue', () => {
  it('bridges a custom model prop in both directions', async () => {
    const outerValue = ref('initial');
    const handleUpdate = vi.fn((value: string) => {
      outerValue.value = value;
    });
    const Harness = defineComponent({
      setup() {
        return () =>
          h(ApiComponent, {
            'component': markRaw(ValueInput),
            'modelPropName': 'value',
            'value': outerValue.value,
            'onUpdate:value': handleUpdate,
          });
      },
    });
    const wrapper = mount(Harness);
    const input = wrapper.findComponent(ValueInput);

    expect(input.props('value')).toBe('initial');

    await input.trigger('click');
    await nextTick();
    expect(handleUpdate).toHaveBeenCalledWith('selected');
    expect(input.props('value')).toBe('selected');

    outerValue.value = 'external';
    await nextTick();
    expect(input.props('value')).toBe('external');
  });

  it('preserves the default modelValue protocol', async () => {
    const wrapper = mount(ApiComponent, {
      props: {
        component: markRaw(ModelValueInput),
        modelValue: 'initial',
      },
    });
    const input = wrapper.findComponent(ModelValueInput);

    expect(input.props('modelValue')).toBe('initial');

    await input.trigger('click');
    await nextTick();
    expect(wrapper.emitted('update:modelValue')).toEqual([['selected']]);
    expect(input.props('modelValue')).toBe('selected');
  });

  it('bridges a kebab-case custom model prop', async () => {
    const outerValue = ref('initial');
    const handleUpdate = vi.fn((value: string) => {
      outerValue.value = value;
    });
    const Harness = defineComponent({
      setup() {
        return () =>
          h(ApiComponent, {
            'component': markRaw(KebabModelInput),
            'modelPropName': 'model-value',
            'model-value': outerValue.value,
            'onUpdate:model-value': handleUpdate,
          });
      },
    });
    const wrapper = mount(Harness);
    const input = wrapper.findComponent(KebabModelInput);

    expect(input.props('modelValue')).toBe('initial');

    await input.trigger('click');
    await nextTick();
    expect(handleUpdate).toHaveBeenCalledWith('selected');
    expect(input.props('modelValue')).toBe('selected');
  });

  it('auto-selects the first option onto modelValue for a PSelect-like inner', async () => {
    const SelectLike = defineComponent({
      name: 'SelectLike',
      props: {
        modelValue: { type: String, default: undefined },
        items: { type: Array, default: () => [] },
        loading: { type: Boolean, default: false },
      },
      emits: ['update:modelValue'],
      setup: (props) => () =>
        h('div', {
          'data-value': String(props.modelValue ?? ''),
          'data-items': props.items.length,
        }),
    });

    const wrapper = mount(ApiComponent, {
      props: {
        api: vi.fn().mockResolvedValue([
          { label: 'Alpha', value: 'alpha' },
          { label: 'Beta', value: 'beta' },
        ]),
        autoSelect: 'first',
        component: markRaw(SelectLike),
        optionsPropName: 'items',
      },
    });

    await vi.waitFor(() => {
      expect(wrapper.emitted('update:modelValue')).toEqual([['alpha']]);
    });

    const inner = wrapper.findComponent(SelectLike);
    expect(inner.props('modelValue')).toBe('alpha');
    expect(inner.props('loading')).toBe(false);
    expect(inner.props('items')).toEqual([
      expect.objectContaining({ label: 'Alpha', value: 'alpha' }),
      expect.objectContaining({ label: 'Beta', value: 'beta' }),
    ]);
  });
});
