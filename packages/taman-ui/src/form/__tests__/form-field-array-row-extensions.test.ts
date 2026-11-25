import type { VueWrapper } from '@vue/test-utils';

import { useSortable } from '@vinicunca/taman-core/composables';
import { flushPromises, mount } from '@vue/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { defineComponent, h } from 'vue';

import { useTamanForm } from '../form.use-taman-form';

vi.mock('@vinicunca/taman-core/composables', async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>();
  return {
    ...actual,
    useSortable: vi.fn(() => ({
      initializeSortable: async () => undefined,
    })),
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
  vi.restoreAllMocks();
});

function items(...titles: Array<string>): Array<PortfolioItem> {
  return titles.map((title) => ({ id: `id-${title}`, title }));
}

async function mountPortfolio(
  options: {
    arrayProps?: Record<string, unknown>;
    children?: Array<Record<string, any>>;
    commonConfig?: Record<string, any>;
    portfolio?: Array<PortfolioItem>;
  } = {},
) {
  const [Form, formApi] = useTamanForm({
    commonConfig: options.commonConfig,
    schema: [
      {
        arrayProps: { ...options.arrayProps },
        children: options.children ?? [
          { component: TestInput, fieldName: 'title', label: 'Title' },
        ],
        defaultValue: options.portfolio ?? items('a', 'b', 'c'),
        fieldName: 'portfolio',
        type: 'array',
      },
    ] as never,
  });
  const wrapper = mount(Form, { attachTo: document.body });
  wrappers.push(wrapper);
  await flushPromises();
  return { formApi, wrapper };
}

function getRows(wrapper: VueWrapper) {
  return wrapper.findAll('[data-array-row-index]');
}

describe('array child callbacks', () => {
  it('marks every row with its index', async () => {
    const { wrapper } = await mountPortfolio();
    expect(getRows(wrapper).map((row) => row.attributes('data-array-row-index')))
      .toEqual(['0', '1', '2']);
  });

  it('passes the row to child componentProps and suffix', async () => {
    const { formApi, wrapper } = await mountPortfolio({
      children: [
        {
          component: TestInput,
          componentProps: ({ row }: any) => ({ placeholder: `Title for ${row?.id}` }),
          fieldName: 'title',
          label: 'Title',
          suffix: ({ row, rootValues }: any) => `${row?.title}/${rootValues?.portfolio.length}`,
        },
      ],
    });
    expect(wrapper.findAll('input').map((i) => i.attributes('placeholder')))
      .toEqual(['Title for id-a', 'Title for id-b', 'Title for id-c']);
    expect(wrapper.text()).toContain('b/3');

    formApi.form.setFieldValue('portfolio[1].title', 'z');
    await flushPromises();
    expect(wrapper.text()).toContain('z/3');
  });

  it('re-runs child callbacks only for the changed row', async () => {
    const componentProps = vi.fn(({ row }: any) => ({ placeholder: row?.title }));
    const { formApi } = await mountPortfolio({
      children: [
        {
          component: TestInput,
          componentProps,
          fieldName: 'title',
          label: 'Title',
        },
      ],
    });
    componentProps.mockClear();
    formApi.form.setFieldValue('portfolio[1].title', 'z');
    await flushPromises();
    const indexes = componentProps.mock.calls.map(([ctx]) => ctx.rowIndex);
    expect(indexes).not.toContain(0);
    expect(indexes).not.toContain(2);
  });

  it('keeps common config out of the row context', async () => {
    const commonComponentProps = vi.fn((ctx: any) => ({
      title: `${ctx.row?.title}/${ctx.rootValues?.portfolio?.length}`,
    }));
    const componentProps = vi.fn(({ row }: any) => ({ placeholder: row?.title }));
    const { formApi } = await mountPortfolio({
      children: [
        {
          component: TestInput,
          componentProps,
          fieldName: 'title',
          label: 'Title',
        },
      ],
      commonConfig: { componentProps: commonComponentProps },
    });
    expect(commonComponentProps).toHaveBeenCalled();
    for (const [ctx] of commonComponentProps.mock.calls) {
      expect(ctx.row).toBeUndefined();
      expect(ctx.rootValues).toBeUndefined();
    }
    commonComponentProps.mockClear();
    componentProps.mockClear();

    formApi.form.setFieldValue('portfolio[1].title', 'z');
    await flushPromises();

    expect(commonComponentProps).not.toHaveBeenCalled();
    const indexes = componentProps.mock.calls.map(([ctx]) => ctx.rowIndex);
    expect(indexes).not.toContain(0);
    expect(indexes).not.toContain(2);
  });

  it('still renders a top-level suffix function', async () => {
    const [Form] = useTamanForm({
      schema: [
        {
          component: TestInput,
          fieldName: 'weight',
          suffix: () => 'kg',
        },
      ] as never,
    });
    const wrapper = mount(Form, { attachTo: document.body });
    wrappers.push(wrapper);
    await flushPromises();
    expect(wrapper.text()).toContain('kg');
  });
});

function rowExtraTexts(wrapper: VueWrapper) {
  return wrapper.findAll('[data-array-row-extra]').map((el) => el.text());
}

function removePresence(wrapper: VueWrapper) {
  return getRows(wrapper).map((row) => row.find('[data-array-remove]').exists());
}

function findAddButton(wrapper: VueWrapper) {
  const button = wrapper.findAll('button').find((b) => b.text().includes('Add a row'));
  if (!button) {
    throw new Error('add button not found');
  }
  return button;
}

describe('array row extensions', () => {
  const preview = ({ row }: any) => `Preview ${row.title}`;

  it('renders as before when no row options are set', async () => {
    const { wrapper } = await mountPortfolio();
    const grids = wrapper.findAll('[style*="grid-template-columns"]');
    expect(grids).toHaveLength(4);
    for (const grid of grids) {
      expect((grid.element as HTMLElement).style.gridTemplateColumns)
        .toBe('3rem minmax(0, 1fr) 4rem');
    }
    expect(wrapper.find('[data-array-row-extra]').exists()).toBe(false);
    expect(wrapper.find('[data-array-row-actions]').exists()).toBe(false);
    expect(wrapper.findAll('[data-array-remove]')).toHaveLength(3);
  });

  it('renders rowExtra per row and updates it with the row', async () => {
    const { formApi, wrapper } = await mountPortfolio({
      arrayProps: { rowExtra: preview },
    });
    expect(rowExtraTexts(wrapper)).toEqual(['Preview a', 'Preview b', 'Preview c']);
    const rows = getRows(wrapper);
    wrapper.findAll('[data-array-row-extra]').forEach((extra, index) => {
      expect(rows[index]!.element.contains(extra.element)).toBe(true);
      expect((extra.element as HTMLElement).style.gridColumn).toBe('1 / -1');
    });

    formApi.form.setFieldValue('portfolio[1].title', 'z');
    await flushPromises();
    expect(rowExtraTexts(wrapper)).toEqual(['Preview a', 'Preview z', 'Preview c']);
  });

  it('renders nothing extra when rowExtra returns null', async () => {
    const { wrapper } = await mountPortfolio({
      arrayProps: {
        rowExtra: ({ row }: any) => (row.title === 'b'
          ? 'Importing from Drive…'
          : null),
      },
    });
    const extras = wrapper.findAll('[data-array-row-extra]');
    expect(extras).toHaveLength(1);
    expect(getRows(wrapper)[1]!.element.contains(extras[0]!.element)).toBe(true);
  });

  it('re-runs rowExtra only for the changed row', async () => {
    const rowExtra = vi.fn(({ row }: any) => row.title);
    const { formApi } = await mountPortfolio({
      arrayProps: { rowExtra },
    });
    rowExtra.mockClear();
    formApi.form.setFieldValue('portfolio[1].title', 'z');
    await flushPromises();
    expect(rowExtra.mock.calls.length).toBeGreaterThan(0);
    for (const [ctx] of rowExtra.mock.calls) {
      expect(ctx.index).toBe(1);
    }
  });

  it('keeps row extras with their rows after a remove', async () => {
    const { wrapper } = await mountPortfolio({
      arrayProps: { rowExtra: preview },
    });
    await wrapper.find('[data-array-remove]').trigger('click');
    await flushPromises();
    expect(rowExtraTexts(wrapper)).toEqual(['Preview b', 'Preview c']);
  });

  it('renders rowActions before the row buttons, with that row', async () => {
    const retry = vi.fn();
    const rowActions = (ctx: any) =>
      h('button', {
        'data-test': 'retry',
        'onClick': () => retry(ctx.index, ctx.row.title),
      }, 'Retry');
    const { wrapper } = await mountPortfolio({
      arrayProps: { rowActions, sortable: true },
    });
    await wrapper.findAll('[data-test="retry"]')[1]!.trigger('click');
    expect(retry).toHaveBeenCalledWith(1, 'b');

    for (const row of getRows(wrapper)) {
      const actions = row.find('[data-array-row-actions]').element;
      const move = row.find('[data-array-move]').element;
      const remove = row.find('[data-array-remove]').element;
      expect(actions.compareDocumentPosition(move) & Node.DOCUMENT_POSITION_FOLLOWING)
        .toBeTruthy();
      expect(actions.compareDocumentPosition(remove) & Node.DOCUMENT_POSITION_FOLLOWING)
        .toBeTruthy();
    }
  });

  it('shares one auto action column when rowActions is set', async () => {
    const { wrapper } = await mountPortfolio({
      arrayProps: {
        rowActions: () => 'x',
      },
    });
    const container = wrapper.find('[style*="display: grid"]').element as HTMLElement;
    expect(container.style.display).toBe('grid');
    expect(container.style.gridTemplateColumns).toBe('3rem minmax(0, 1fr) auto');
    const header = container.children[0] as HTMLElement;
    const rows = getRows(wrapper).map((row) => row.element as HTMLElement);
    for (const el of [header, ...rows]) {
      expect(el.style.gridColumn).toBe('1 / -1');
      expect(el.style.gridTemplateColumns).toBe('subgrid');
    }
  });

  it('keeps Sortable vertical when rowActions turns the container into a grid', async () => {
    vi.mocked(useSortable).mockClear();
    await mountPortfolio({
      arrayProps: {
        rowActions: () => 'x',
        sortable: true,
      },
    });
    expect(useSortable).toHaveBeenCalled();
    expect(vi.mocked(useSortable).mock.calls[0]![1]).toMatchObject({ direction: 'vertical' });
  });

  it('hides the remove button where rowRemovable returns false', async () => {
    const { formApi, wrapper } = await mountPortfolio({
      arrayProps: {
        rowRemovable: ({ row }: any) => row.title !== 'b',
      },
    });
    expect(removePresence(wrapper)).toEqual([true, false, true]);
    formApi.form.setFieldValue('portfolio[0].title', 'b');
    await flushPromises();
    expect(removePresence(wrapper)).toEqual([false, false, true]);
  });

  it('passes addButtonProps to the add button', async () => {
    const { wrapper } = await mountPortfolio({
      arrayProps: {
        addButtonProps: { class: 'self-end', variant: 'solid' },
      },
    });
    const classes = findAddButton(wrapper).classes();
    expect(classes).toContain('self-end');
    expect(classes).toContain('border-dashed');
    expect(classes).toContain('w-full');
  });

  it('keeps the default add button full width', async () => {
    const { wrapper } = await mountPortfolio({});
    const classes = findAddButton(wrapper).classes();
    expect(classes).toContain('border-dashed');
    expect(classes).toContain('w-full');
  });

  it('drops the full width when addButtonProps.block is false', async () => {
    const { wrapper } = await mountPortfolio({
      arrayProps: {
        addButtonProps: { block: false, class: 'self-end' },
      },
    });
    const classes = findAddButton(wrapper).classes();
    expect(classes).toContain('self-end');
    expect(classes).toContain('border-dashed');
    expect(classes).not.toContain('w-full');
  });

  it('keeps the add button disabled at max despite addButtonProps', async () => {
    const atMax = await mountPortfolio({
      arrayProps: {
        addButtonProps: { disabled: false },
        max: 3,
      },
    });
    expect(findAddButton(atMax.wrapper).attributes('disabled')).toBeDefined();

    const forced = await mountPortfolio({
      arrayProps: {
        addButtonProps: { disabled: true },
      },
    });
    expect(findAddButton(forced.wrapper).attributes('disabled')).toBeDefined();
  });
});
