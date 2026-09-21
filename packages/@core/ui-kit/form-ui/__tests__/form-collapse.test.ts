import type { VueWrapper } from '@vue/test-utils';

import { flushPromises, mount } from '@vue/test-utils';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { defineComponent, h } from 'vue';
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

describe('form-level collapse', () => {
  function threeFieldSchema() {
    return [
      { component: TestInput, fieldName: 'a', label: 'A' },
      { component: TestInput, collapsed: true, fieldName: 'b', label: 'B' },
      { component: TestInput, collapsed: true, fieldName: 'c', label: 'C' },
    ];
  }

  it('hides only the marked entries when collapsed', async () => {
    const [Form] = useTamanForm({
      collapsed: true,
      schema: threeFieldSchema(),
    });
    const wrapper = mount(Form, { attachTo: document.body });
    wrappers.push(wrapper);
    await flushPromises();

    const items = wrapper.findAll('[data-slot="form-item"]');
    expect(items).toHaveLength(3);
    expect(items[0]?.isVisible()).toBe(true);
    expect(items[1]?.isVisible()).toBe(false);
    expect(items[2]?.isVisible()).toBe(false);
  });

  it('shows every entry when expanded', async () => {
    const [Form] = useTamanForm({
      collapsed: false,
      schema: threeFieldSchema(),
    });
    const wrapper = mount(Form, { attachTo: document.body });
    wrappers.push(wrapper);
    await flushPromises();

    for (const item of wrapper.findAll('[data-slot="form-item"]')) {
      expect(item.isVisible()).toBe(true);
    }
  });

  it('never hides anything when no entry is marked', async () => {
    const [Form] = useTamanForm({
      collapsed: true,
      schema: [
        { component: TestInput, fieldName: 'a', label: 'A' },
        { component: TestInput, fieldName: 'b', label: 'B' },
      ],
    });
    const wrapper = mount(Form, { attachTo: document.body });
    wrappers.push(wrapper);
    await flushPromises();

    for (const item of wrapper.findAll('[data-slot="form-item"]')) {
      expect(item.isVisible()).toBe(true);
    }
  });

  it('can mark a whole group as collapsed', async () => {
    const [Form] = useTamanForm({
      collapsed: true,
      schema: [
        { component: TestInput, fieldName: 'a', label: 'A' },
        {
          children: [{ component: TestInput, fieldName: 'b', label: 'B' }],
          collapsed: true,
          name: 'extra',
          title: 'Extra',
          type: 'group',
        },
      ],
    });
    const wrapper = mount(Form, { attachTo: document.body });
    wrappers.push(wrapper);
    await flushPromises();

    expect(wrapper.get('.form-group').isVisible()).toBe(false);
  });
});

describe('collapse toggle', () => {
  it('is absent when no entry is marked', async () => {
    const [Form] = useTamanForm({
      schema: [{ component: TestInput, fieldName: 'a', label: 'A' }],
    });
    const wrapper = mount(Form, { attachTo: document.body });
    wrappers.push(wrapper);
    await flushPromises();

    expect(wrapper.find('.form-collapse-trigger').exists()).toBe(false);
  });

  it('appears when only a group is marked collapsed', async () => {
    const [Form] = useTamanForm({
      schema: [
        { component: TestInput, fieldName: 'a', label: 'A' },
        {
          children: [{ component: TestInput, fieldName: 'b', label: 'B' }],
          collapsed: true,
          name: 'extra',
          title: 'Extra',
          type: 'group',
        },
      ],
    });
    const wrapper = mount(Form, { attachTo: document.body });
    wrappers.push(wrapper);
    await flushPromises();

    expect(wrapper.find('.form-collapse-trigger').exists()).toBe(true);
  });

  it('toggles the marked entries and reports state via aria-expanded', async () => {
    const [Form] = useTamanForm({
      collapsed: true,
      schema: [
        { component: TestInput, fieldName: 'a', label: 'A' },
        { component: TestInput, collapsed: true, fieldName: 'b', label: 'B' },
      ],
    });
    const wrapper = mount(Form, { attachTo: document.body });
    wrappers.push(wrapper);
    await flushPromises();

    const trigger = wrapper.get('button.form-collapse-trigger');
    expect(trigger.attributes('aria-expanded')).toBe('false');
    expect(wrapper.findAll('[data-slot="form-item"]')[1]?.isVisible()).toBe(
      false,
    );

    await trigger.trigger('click');
    await flushPromises();

    expect(trigger.attributes('aria-expanded')).toBe('true');
    expect(wrapper.findAll('[data-slot="form-item"]')[1]?.isVisible()).toBe(
      true,
    );
  });

  it('re-shows a collapsed group after clicking the toggle', async () => {
    const [Form] = useTamanForm({
      collapsed: true,
      schema: [
        { component: TestInput, fieldName: 'a', label: 'A' },
        {
          children: [{ component: TestInput, fieldName: 'b', label: 'B' }],
          collapsed: true,
          name: 'extra',
          title: 'Extra',
          type: 'group',
        },
      ],
    });
    const wrapper = mount(Form, { attachTo: document.body });
    wrappers.push(wrapper);
    await flushPromises();

    expect(wrapper.get('.form-group').isVisible()).toBe(false);

    await wrapper.get('button.form-collapse-trigger').trigger('click');
    await flushPromises();

    expect(wrapper.get('.form-group').isVisible()).toBe(true);
  });

  it('invokes handleCollapsedChange', async () => {
    const onCollapsedChange = vi.fn();
    const [Form] = useTamanForm({
      collapsed: true,
      handleCollapsedChange: onCollapsedChange,
      schema: [
        { component: TestInput, fieldName: 'a', label: 'A' },
        { component: TestInput, collapsed: true, fieldName: 'b', label: 'B' },
      ],
    });
    const wrapper = mount(Form, { attachTo: document.body });
    wrappers.push(wrapper);
    await flushPromises();

    await wrapper.get('button.form-collapse-trigger').trigger('click');
    await flushPromises();

    expect(onCollapsedChange).toHaveBeenCalledWith(false);
  });

  it('force-expands when a field hidden by the collapse toggle fails validation', async () => {
    // Mirrors form-render-group.vue's `hasInvalidField` auto-expand, but for
    // the form-level `collapsed` state: a field hidden behind the collapse
    // toggle that fails validation must not be left invisibly broken.
    const onCollapsedChange = vi.fn();
    const [Form, formApi] = useTamanForm({
      collapsed: true,
      handleCollapsedChange: onCollapsedChange,
      schema: [
        { component: TestInput, fieldName: 'a', label: 'A' },
        {
          component: TestInput,
          collapsed: true,
          fieldName: 'b',
          label: 'B',
          rules: z.string().min(1, 'B is required'),
        },
      ],
    });
    const wrapper = mount(Form, { attachTo: document.body });
    wrappers.push(wrapper);
    await flushPromises();

    expect(wrapper.findAll('[data-slot="form-item"]')[1]?.isVisible()).toBe(
      false,
    );

    await formApi.validateField('b');
    await flushPromises();

    expect(
      wrapper.get('button.form-collapse-trigger').attributes('aria-expanded'),
    ).toBe('true');
    expect(wrapper.findAll('[data-slot="form-item"]')[1]?.isVisible()).toBe(
      true,
    );
    expect(onCollapsedChange).toHaveBeenCalledWith(false);
  });

  it('does not force-expand while every hidden field is valid', async () => {
    const [Form, formApi] = useTamanForm({
      collapsed: true,
      schema: [
        { component: TestInput, fieldName: 'a', label: 'A' },
        {
          component: TestInput,
          collapsed: true,
          defaultValue: 'ok',
          fieldName: 'b',
          label: 'B',
          rules: z.string().min(1, 'B is required'),
        },
      ],
    });
    const wrapper = mount(Form, { attachTo: document.body });
    wrappers.push(wrapper);
    await flushPromises();

    await formApi.validateField('b');
    await flushPromises();

    expect(
      wrapper.get('button.form-collapse-trigger').attributes('aria-expanded'),
    ).toBe('false');
    expect(wrapper.findAll('[data-slot="form-item"]')[1]?.isVisible()).toBe(
      false,
    );
  });

  it('stays collapsed after the user re-collapses while the hidden field is still invalid', async () => {
    // Regression test for a predicate that depended on the very state it
    // controls: `hiddenFieldNames` must come from schema membership
    // (`schema.collapsed === true`) alone, never from `props.collapsed` /
    // `computedSchema.hidden`. With the buggy version, auto-expand opens the
    // form and `collapsed` becomes `false`, which forces `hidden` (and so
    // `hasInvalidHiddenField`) to `false` regardless of the still-standing
    // error. The instant the user clicks the toggle to collapse again,
    // `collapsed` flips back to `true`, `hidden`/`hasInvalidHiddenField`
    // flips `false -> true`, and the watcher fires a spurious
    // `update:collapsed(false)` that snaps the form straight back open — the
    // user can never collapse it, and `handleCollapsedChange` sees a
    // spurious `true`/`false` pair on every attempt.
    const onCollapsedChange = vi.fn();
    const [Form, formApi] = useTamanForm({
      collapsed: true,
      handleCollapsedChange: onCollapsedChange,
      schema: [
        { component: TestInput, fieldName: 'a', label: 'A' },
        {
          component: TestInput,
          collapsed: true,
          fieldName: 'b',
          label: 'B',
          rules: z.string().min(1, 'B is required'),
        },
      ],
    });
    const wrapper = mount(Form, { attachTo: document.body });
    wrappers.push(wrapper);
    await flushPromises();

    await formApi.validateField('b');
    await flushPromises();

    // Auto-expand fired once, as in the test above.
    expect(
      wrapper.get('button.form-collapse-trigger').attributes('aria-expanded'),
    ).toBe('true');
    expect(onCollapsedChange).toHaveBeenCalledTimes(1);
    expect(onCollapsedChange).toHaveBeenNthCalledWith(1, false);

    // The user now collapses it back manually. The error on 'b' still
    // stands, but this must not immediately re-open the form.
    await wrapper.get('button.form-collapse-trigger').trigger('click');
    await flushPromises();

    expect(
      wrapper.get('button.form-collapse-trigger').attributes('aria-expanded'),
    ).toBe('false');
    expect(wrapper.findAll('[data-slot="form-item"]')[1]?.isVisible()).toBe(
      false,
    );
    // Exactly one further call — the user's own collapse — and no spurious
    // re-expand pair on top of it.
    expect(onCollapsedChange).toHaveBeenCalledTimes(2);
    expect(onCollapsedChange).toHaveBeenNthCalledWith(2, true);
  });
});
