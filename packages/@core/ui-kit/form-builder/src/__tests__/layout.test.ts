import type { VueWrapper } from '@vue/test-utils';

import { mount } from '@vue/test-utils';
// pohon-ui registers PInput etc. as compile-time auto-imports via its vite
// plugin, not as app-level global components — pull the real component
// object from its package export instead (see renderer.test.ts).
import PInput from 'pohon-ui/components/Input.vue';
import pohon from 'pohon-ui/vue-plugin';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { defineComponent, h, nextTick } from 'vue';

import { createFormBuilder, defineFieldComponents } from '../plugin';
import LayoutForm from './fixtures/layout-form.vue';

// pohon-ui's Icon component renders @iconify/vue's <Icon>, which fetches
// icon data from the Iconify API over the network. Stub it out so tests
// stay offline and happy-dom teardown does not abort in-flight fetches.
vi.mock('@iconify/vue', () => ({
  Icon: defineComponent({
    name: 'IconifyIconStub',
    props: { icon: { type: String, default: '' } },
    setup: (props) => () => h('span', { 'data-icon': props.icon }),
  }),
}));

const Heading = defineComponent({
  name: 'Heading',
  render: () => h('h3', { class: 'display-only-heading' }, 'Section'),
});

// happy-dom defaults to a 1024px viewport, which already satisfies
// @vueuse/core's `md`/`lg` Tailwind breakpoints. Force a narrow viewport so
// the grid layout tests deterministically exercise the `base` column count
// (the scenario these fixtures target) rather than depending on happy-dom's
// unspecified default width.
(window as any).happyDOM?.setInnerWidth?.(375);

let wrapper: undefined | VueWrapper<any>;

function mountForm() {
  wrapper = mount(LayoutForm, {
    global: {
      plugins: [
        pohon,
        createFormBuilder({
          components: defineFieldComponents({
            Heading,
            Input: PInput,
          }),
        }),
      ],
    },
    attachTo: document.body,
  });
  return wrapper;
}

async function settle() {
  await nextTick();
  await new Promise((resolve) => setTimeout(resolve, 0));
  await nextTick();
}

afterEach(() => {
  wrapper?.unmount();
  wrapper = undefined;
});

describe('layout & misc', () => {
  it('renders a CSS grid with the configured base column count', async () => {
    const wrapper = mountForm();
    await settle();
    const grid = wrapper.find('form > div');
    expect(grid.attributes('style')).toContain('grid-template-columns');
    expect(grid.attributes('style')).toContain('repeat(2'); // base cols (happy-dom = no md breakpoint)
  });

  it('applies span and newRow styles per field', async () => {
    const wrapper = mountForm();
    await settle();
    const html = wrapper.html();
    expect(html).toContain('span 2');
    expect(html).toContain('grid-column-start: 1');
    expect(html).toContain('1 / -1');
  });

  it('renders display-only entries without value binding or rules', async () => {
    const wrapper = mountForm();
    await settle();
    const heading = wrapper.find('.display-only-heading');
    expect(heading.exists()).toBe(true);
    // Even in form-level tooltip mode, a nameless entry must render through
    // the plain display-only branch: no name attribute and no tooltip flex
    // row wrapper around it.
    expect(heading.attributes('name')).toBeUndefined();
    expect(heading.element.closest('.flex.items-center.gap-1')).toBeNull();
    // no phantom key added to values
    expect(Object.keys(wrapper.vm.formApi.values)).toEqual(['a', 'b', 'c']);
  });

  it('tooltip mode: no inline error text, tooltip marker instead', async () => {
    const wrapper = mountForm();
    await settle();
    await wrapper.vm.formApi.validate();
    await settle();
    expect(wrapper.text()).not.toContain('a required');
    // the invalid field's row renders the tooltip trigger marker instead
    const row = wrapper
      .find('input[name="a"]')
      .element.closest('.flex.items-center.gap-1');
    expect(row).not.toBeNull();
    const marker = row!.querySelector('.text-error');
    expect(marker).not.toBeNull();
    expect(marker!.textContent).toContain('!');
  });

  it('focusField focuses the registered control', async () => {
    const wrapper = mountForm();
    await settle();
    wrapper.vm.formApi.focusField('a');
    await settle();
    const input = wrapper.find('input[name="a"]').element as HTMLInputElement;
    expect(document.activeElement).toBe(input);
  });

  it('getFieldComponentRef returns the component instance', async () => {
    const wrapper = mountForm();
    await settle();
    expect(wrapper.vm.formApi.getFieldComponentRef('a')).toBeTruthy();
    expect(wrapper.vm.formApi.getFieldComponentRef('nope')).toBeUndefined();
  });
});
