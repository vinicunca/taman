import type { VueWrapper } from '@vue/test-utils';

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
    portfolio?: Array<PortfolioItem>;
  } = {},
) {
  const [Form, formApi] = useTamanForm({
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
