import type { Sortable } from '@vinicunca/taman-core/composables';
import type { VueWrapper } from '@vue/test-utils';

import { flushPromises, mount } from '@vue/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { defineComponent, h } from 'vue';
import { z } from 'zod';

import { useTamanForm } from '../form.use-taman-form';

interface SortableCall {
  container: HTMLElement;
  instance: {
    destroy: ReturnType<typeof vi.fn>;
    option: ReturnType<typeof vi.fn>;
  };
  options: Sortable.Options;
}

const sortable = vi.hoisted(() => ({
  calls: [] as Array<SortableCall>,
  /** When set, `initializeSortable()` waits for it. */
  gate: undefined as Promise<void> | undefined,
}));

vi.mock('@vinicunca/taman-core/composables', async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>();
  return {
    ...actual,
    useSortable: vi.fn((container: HTMLElement, options: Sortable.Options) => {
      const call: SortableCall = {
        container,
        instance: {
          destroy: vi.fn(),
          option: vi.fn(),
        },
        options,
      };
      sortable.calls.push(call);
      return {
        async initializeSortable() {
          await sortable.gate;
          return call.instance;
        },
      };
    }),
  };
});

const TestInput = defineComponent({
  inheritAttrs: false,
  emits: ['update:modelValue'],
  setup(_, { attrs, emit }) {
    return () =>
      h('input', {
        ...attrs,
        onInput: (event: Event) =>
          emit('update:modelValue', (event.target as HTMLInputElement).value),
        value: attrs.modelValue ?? '',
      });
  },
});

interface PortfolioItem {
  id: string;
  title: string;
}

const wrappers: Array<VueWrapper> = [];

afterEach(() => {
  for (const wrapper of wrappers.splice(0)) {
    wrapper.unmount();
  }
  sortable.calls.length = 0;
  sortable.gate = undefined;
  vi.restoreAllMocks();
});

function items(...titles: Array<string>): Array<PortfolioItem> {
  return titles.map((title) => ({ id: `id-${title}`, title }));
}

async function mountPortfolio(
  options: {
    arrayProps?: Record<string, unknown>;
    disabled?: boolean;
    portfolio?: Array<PortfolioItem>;
  } = {},
) {
  const [Form, formApi] = useTamanForm({
    disabled: options.disabled,
    schema: [
      {
        arrayProps: { sortable: true, ...options.arrayProps },
        children: [
          {
            component: TestInput,
            fieldName: 'title',
            label: 'Title',
            rules: z.string().refine(
              (value) => !value.startsWith('bad'),
              'Title is bad',
            ),
          },
        ],
        defaultValue: options.portfolio ?? items('a', 'b', 'c'),
        fieldName: 'portfolio',
        type: 'array',
      },
    ],
  });
  const wrapper = mount(Form, { attachTo: document.body });
  wrappers.push(wrapper);
  await flushPromises();
  return { formApi, wrapper };
}

function getRows(wrapper: VueWrapper) {
  return wrapper.findAll('[data-array-row]').map((row) => row.element as HTMLElement);
}

function getRenderedTitles(wrapper: VueWrapper) {
  return getRows(wrapper).map(
    (row) => row.querySelector('input')?.value,
  );
}

function lastSortable() {
  const call = sortable.calls.at(-1);
  if (!call) {
    throw new Error('useSortable was not called');
  }
  return call;
}

/** Does what Sortable does on a drop: move the node, then call `onEnd`. */
function simulateDrop(from: number, to: number) {
  const { container, options } = lastSortable();
  const rows = Array.from(container.querySelectorAll<HTMLElement>(':scope > [data-array-row]'));
  const item = rows[from]!;
  options.onStart?.({ item } as never);
  const target = rows[to]!;
  if (from < to) {
    target.after(item);
  } else {
    target.before(item);
  }
  options.onEnd?.({
    item,
    newDraggableIndex: to,
    oldDraggableIndex: from,
  } as never);
}

describe('tamanFormFieldArray sortable', () => {
  it('renders as before when sortable is off', async () => {
    const { wrapper } = await mountPortfolio({
      arrayProps: { sortable: false },
    });

    expect(wrapper.find('[data-array-drag-handle]').exists()).toBe(false);
    expect(wrapper.find('[data-array-move]').exists()).toBe(false);
    expect(wrapper.find('[data-array-row]').exists()).toBe(false);
    const grids = wrapper.findAll('[style*="grid-template-columns"]');
    expect(grids).toHaveLength(4);
    for (const grid of grids) {
      expect((grid.element as HTMLElement).style.gridTemplateColumns).toBe(
        '3rem minmax(0, 1fr) 4rem',
      );
    }
    // Header cells: index, one column, action.
    expect(grids[0]!.element.children).toHaveLength(3);
    expect(sortable.calls).toHaveLength(0);
  });

  it('adds a handle column and limits dragging to row handles', async () => {
    const { wrapper } = await mountPortfolio();

    const grids = wrapper.findAll('[style*="grid-template-columns"]');
    for (const grid of grids) {
      expect((grid.element as HTMLElement).style.gridTemplateColumns).toBe(
        '2.5rem 3rem minmax(0, 1fr) 7.5rem',
      );
    }
    expect(grids[0]!.element.children).toHaveLength(4);
    expect(wrapper.findAll('[data-array-drag-handle]')).toHaveLength(3);

    const { container, options } = lastSortable();
    const rows = getRows(wrapper);
    expect(rows.every((row) => row.parentElement === container)).toBe(true);
    // Only rows are draggable (not the header or the empty state), and only by the handle.
    expect(rows.every((row) => row.matches(options.draggable!))).toBe(true);
    expect(container.querySelectorAll(options.draggable!)).toHaveLength(3);
    expect(
      container.querySelectorAll(options.handle!),
    ).toHaveLength(3);
    expect(rows[0]!.querySelector(options.handle!)).not.toBeNull();
    // Touch delay defaults from useSortable are kept.
    expect(options).not.toHaveProperty('delay');
    expect(options).not.toHaveProperty('delayOnTouchOnly');
  });

  it('reorders the form values when a row is dropped', async () => {
    const { formApi, wrapper } = await mountPortfolio();

    simulateDrop(2, 0);
    await flushPromises();

    expect(formApi.form.values.portfolio).toEqual(items('c', 'a', 'b'));
    expect(getRenderedTitles(wrapper)).toEqual(['c', 'a', 'b']);
    expect(wrapper.findAll('input').map((input) => input.attributes('name')))
      .toEqual(['portfolio[0].title', 'portfolio[1].title', 'portfolio[2].title']);
  });

  it('keeps the DOM order matching the data when a drop does not change the value', async () => {
    const { formApi, wrapper } = await mountPortfolio();
    const rowsBefore = getRows(wrapper);
    vi.spyOn(formApi.form, 'moveFieldValue').mockResolvedValue();

    simulateDrop(0, 2);
    await flushPromises();

    expect(formApi.form.moveFieldValue).toHaveBeenCalledWith('portfolio', 0, 2);
    expect(formApi.form.values.portfolio).toEqual(items('a', 'b', 'c'));
    expect(getRows(wrapper)).toEqual(rowsBefore);
    expect(getRenderedTitles(wrapper)).toEqual(['a', 'b', 'c']);
  });

  it.each([
    ['index', {}],
    [
      'rowKey',
      { rowKey: 'id' },
    ],
  ])('keeps validation errors with their row after a move (keyed by %s)', async (_, arrayProps) => {
    const { formApi, wrapper } = await mountPortfolio({
      arrayProps,
      portfolio: items('a', 'bad-b', 'c'),
    });
    await formApi.validate();
    formApi.form.setFieldError('portfolio[2].title', 'Server rejected c');
    await flushPromises();

    simulateDrop(2, 0);
    await flushPromises();

    expect(formApi.form.errors).toEqual({
      'portfolio[0].title': 'Server rejected c',
      'portfolio[2].title': 'Title is bad',
    });
    const rows = getRows(wrapper);
    expect(rows[0]!.textContent).toContain('Server rejected c');
    expect(rows[1]!.textContent).not.toContain('Title is bad');
    expect(rows[2]!.textContent).toContain('Title is bad');
  });

  it('moves rows with the move up and move down buttons', async () => {
    const { formApi, wrapper } = await mountPortfolio();

    const upButtons = wrapper.findAll('[data-array-move$=":up"]');
    const downButtons = wrapper.findAll('[data-array-move$=":down"]');
    expect(upButtons.map((button) => button.attributes('aria-label')))
      .toEqual(['Move up', 'Move up', 'Move up']);
    expect(downButtons.map((button) => button.attributes('aria-label')))
      .toEqual(['Move down', 'Move down', 'Move down']);
    expect(upButtons.map((button) => button.attributes('disabled') !== undefined))
      .toEqual([true, false, false]);
    expect(downButtons.map((button) => button.attributes('disabled') !== undefined))
      .toEqual([false, false, true]);

    await upButtons[1]!.trigger('click');
    await flushPromises();
    expect(formApi.form.values.portfolio).toEqual(items('b', 'a', 'c'));
    expect(getRenderedTitles(wrapper)).toEqual(['b', 'a', 'c']);
    // Focus follows the moved row; at the top, "Move up" is disabled, so "Move down" gets it.
    expect(document.activeElement).toBe(
      getRows(wrapper)[0]!.querySelector('[data-array-move$=":down"]'),
    );

    await wrapper.findAll('[data-array-move$=":down"]')[1]!.trigger('click');
    await flushPromises();
    expect(formApi.form.values.portfolio).toEqual(items('b', 'c', 'a'));
    expect(document.activeElement).toBe(
      getRows(wrapper)[2]!.querySelector('[data-array-move$=":up"]'),
    );
  });

  it('uses custom labels', async () => {
    const { wrapper } = await mountPortfolio({
      arrayProps: {
        dragHandleText: 'Reorder row',
        moveDownText: 'Shift down',
        moveUpText: 'Shift up',
      },
    });

    expect(wrapper.get('[data-array-drag-handle]').attributes('title')).toBe('Reorder row');
    expect(wrapper.get('[data-array-move$=":up"]').attributes('aria-label')).toBe('Shift up');
    expect(wrapper.get('[data-array-move$=":down"]').attributes('aria-label')).toBe('Shift down');
  });

  it('turns reordering off while disabled', async () => {
    const { formApi, wrapper } = await mountPortfolio({ disabled: true });
    const { instance, options } = lastSortable();

    expect(wrapper.find('[data-array-drag-handle]').exists()).toBe(false);
    expect(wrapper.find('[data-array-move]').exists()).toBe(false);
    expect(options.disabled).toBe(true);
    expect(instance.option).toHaveBeenLastCalledWith('disabled', true);

    formApi.setState({ disabled: false });
    await flushPromises();
    expect(instance.option).toHaveBeenLastCalledWith('disabled', false);
    expect(wrapper.findAll('[data-array-drag-handle]')).toHaveLength(3);
    expect(wrapper.findAll('[data-array-move]')).toHaveLength(6);

    formApi.setState({ disabled: true });
    await flushPromises();
    expect(instance.option).toHaveBeenLastCalledWith('disabled', true);
    expect(wrapper.find('[data-array-drag-handle]').exists()).toBe(false);
  });

  it('ignores a drop that finishes after the field was disabled', async () => {
    const { formApi, wrapper } = await mountPortfolio();
    const { container, options } = lastSortable();
    const rows = getRows(wrapper);
    options.onStart?.({ item: rows[0] } as never);
    formApi.setState({ disabled: true });
    await flushPromises();

    rows[2]!.after(rows[0]!);
    options.onEnd?.({ item: rows[0] } as never);
    await flushPromises();

    expect(formApi.form.values.portfolio).toEqual(items('a', 'b', 'c'));
    expect(Array.from(container.querySelectorAll(':scope > [data-array-row]')))
      .toEqual(rows);
  });

  it('keeps row identity across a move with rowKey', async () => {
    const { wrapper } = await mountPortfolio({
      arrayProps: { rowKey: 'id' },
    });
    const [rowA, rowB, rowC] = getRows(wrapper);

    simulateDrop(2, 0);
    await flushPromises();

    expect(getRows(wrapper)).toEqual([rowC, rowA, rowB]);
    expect(getRenderedTitles(wrapper)).toEqual(['c', 'a', 'b']);
  });

  it('keeps rows in place by index without rowKey', async () => {
    const { wrapper } = await mountPortfolio();
    const rowsBefore = getRows(wrapper);

    simulateDrop(2, 0);
    await flushPromises();

    expect(getRows(wrapper)).toEqual(rowsBefore);
    expect(getRenderedTitles(wrapper)).toEqual(['c', 'a', 'b']);
  });

  it('falls back to index keys for rows without a unique rowKey value', async () => {
    const { formApi, wrapper } = await mountPortfolio({
      arrayProps: { rowKey: 'id' },
      portfolio: [
        { id: 'same', title: 'a' },
        { id: 'same', title: 'b' },
        { title: 'c' } as PortfolioItem,
      ],
    });

    simulateDrop(0, 2);
    await flushPromises();

    expect(formApi.form.values.portfolio.map((row: PortfolioItem) => row.title))
      .toEqual(['b', 'c', 'a']);
    expect(getRenderedTitles(wrapper)).toEqual(['b', 'c', 'a']);
  });

  it('destroys Sortable on unmount', async () => {
    const { wrapper } = await mountPortfolio();
    const { instance } = lastSortable();

    wrapper.unmount();
    wrappers.splice(wrappers.indexOf(wrapper), 1);

    expect(instance.destroy).toHaveBeenCalledOnce();
  });

  it('destroys Sortable when unmounted before it finished initializing', async () => {
    let openGate!: () => void;
    sortable.gate = new Promise((resolve) => {
      openGate = resolve;
    });
    const { wrapper } = await mountPortfolio();
    const { instance } = lastSortable();

    wrapper.unmount();
    wrappers.splice(wrappers.indexOf(wrapper), 1);
    expect(instance.destroy).not.toHaveBeenCalled();

    openGate();
    await flushPromises();
    expect(instance.destroy).toHaveBeenCalledOnce();
  });
});
