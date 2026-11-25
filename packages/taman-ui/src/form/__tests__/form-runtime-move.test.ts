import type { FormActions } from '../form.types';

import { flushPromises, mount } from '@vue/test-utils';
import { afterEach, describe, expect, it } from 'vitest';
import { defineComponent, h } from 'vue';

import { useFormRuntime } from '../form.runtime';

const wrappers: Array<ReturnType<typeof mount>> = [];

afterEach(() => {
  for (const wrapper of wrappers.splice(0)) {
    wrapper.unmount();
  }
});

interface Row {
  id: string;
  name: string;
}

/** Invalid when the value starts with "bad", with a message naming the value. */
function nameValidator({ value }: { value: string }) {
  return value?.startsWith('bad')
    ? `invalid:${value}`
    : undefined;
}

/**
 * Renders one runtime field per row of `arrayField`, keyed by index or by
 * `row.id`, the way `TamanFormFieldArray` renders without and with `rowKey`.
 */
function mountRows(
  defaultValues: Record<string, any>,
  options: {
    arrayField: string;
    keyBy: 'id' | 'index';
  },
) {
  let form!: FormActions;
  const Harness = defineComponent({
    setup() {
      form = useFormRuntime(defaultValues);
      const rows = form.useFieldValue(options.arrayField as never);
      return () =>
        h(
          'div',
          ((rows.value as Array<Row> | undefined) ?? []).map((row, index) => {
            const fieldName = `${options.arrayField}[${index}].name`;
            return h(
              'div',
              {
                'key': options.keyBy === 'id'
                  ? row.id
                  : index,
                'data-row': '',
              },
              [
                h(
                  form.fieldComponent,
                  {
                    key: fieldName,
                    name: fieldName,
                    validators: { onSubmit: nameValidator },
                  },
                  {
                    default: ({ field }: Record<string, any>) =>
                      h('input', {
                        name: fieldName,
                        value: field.state.value,
                      }),
                  },
                ),
              ],
            );
          }),
        );
    },
  });
  const wrapper = mount(Harness);
  wrappers.push(wrapper);
  return { form, wrapper };
}

function rows(...names: Array<string>): Array<Row> {
  return names.map((name) => ({ id: name, name }));
}

describe('form runtime moveFieldValue', () => {
  it.each(['index', 'id'] as const)(
    'moves values and validation errors with their rows (keyed by %s)',
    async (keyBy) => {
      const { form, wrapper } = mountRows(
        {
          items: rows('ok-a', 'bad-b', 'bad-c', 'ok-d'),
        },
        { arrayField: 'items', keyBy },
      );
      await flushPromises();
      await form.validate();
      await flushPromises();
      expect(form.errors).toEqual({
        'items[1].name': 'invalid:bad-b',
        'items[2].name': 'invalid:bad-c',
      });

      await form.moveFieldValue('items', 2, 0);
      await flushPromises();

      expect(form.getFieldValue('items')).toEqual(
        rows('bad-c', 'ok-a', 'bad-b', 'ok-d'),
      );
      expect(form.errors).toEqual({
        'items[0].name': 'invalid:bad-c',
        'items[2].name': 'invalid:bad-b',
      });
      expect(
        wrapper.findAll('input').map((input) => input.attributes('value')),
      ).toEqual(['bad-c', 'ok-a', 'bad-b', 'ok-d']);

      await form.moveFieldValue('items', 0, 3);
      await flushPromises();

      expect(form.errors).toEqual({
        'items[1].name': 'invalid:bad-b',
        'items[3].name': 'invalid:bad-c',
      });
    },
  );

  it('moves manual errors with the row', async () => {
    const { form } = mountRows(
      {
        items: rows('a', 'b', 'c'),
      },
      { arrayField: 'items', keyBy: 'index' },
    );
    await flushPromises();
    form.setFieldError('items[0].name', 'server error on a');
    await flushPromises();

    await form.moveFieldValue('items', 0, 2);
    await flushPromises();

    expect(form.errors).toEqual({ 'items[2].name': 'server error on a' });
  });

  it('moves meta within a nested array', async () => {
    const { form } = mountRows(
      {
        groups: [
          {
            items: rows('g0-a', 'g0-b'),
          },
          {
            items: rows('bad-g1-a', 'bad-g1-b', 'g1-c'),
          },
        ],
      },
      { arrayField: 'groups[1].items', keyBy: 'index' },
    );
    await flushPromises();
    await form.validate();
    await flushPromises();
    expect(form.errors).toEqual({
      'groups[1].items[0].name': 'invalid:bad-g1-a',
      'groups[1].items[1].name': 'invalid:bad-g1-b',
    });

    await form.moveFieldValue('groups[1].items', 0, 2);
    await flushPromises();

    expect(form.errors).toEqual({
      'groups[1].items[0].name': 'invalid:bad-g1-b',
      'groups[1].items[2].name': 'invalid:bad-g1-a',
    });
  });

  it('ignores out-of-range and no-op moves', async () => {
    const { form } = mountRows(
      {
        items: rows('a', 'b'),
      },
      { arrayField: 'items', keyBy: 'index' },
    );
    await flushPromises();

    await form.moveFieldValue('items', 0, 0);
    await form.moveFieldValue('items', 0, 5);
    await form.moveFieldValue('items', -1, 1);
    await form.moveFieldValue('missing', 0, 1);
    await flushPromises();

    expect(form.getFieldValue('items')).toEqual(rows('a', 'b'));
  });
});
