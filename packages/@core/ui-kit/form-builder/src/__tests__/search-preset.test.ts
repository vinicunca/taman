import type { VueWrapper } from '@vue/test-utils';

import { mount } from '@vue/test-utils';
// See renderer.test.ts: pohon-ui registers PInput etc. as compile-time
// auto-imports via its vite plugin, not as app-level global components —
// pull the real component object from its package export instead.
import PInput from 'pohon-ui/components/Input.vue';
import pohon from 'pohon-ui/vue-plugin';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { defineComponent, h, nextTick } from 'vue';

import { createFormBuilder, defineFieldComponents } from '../plugin';
import { applySearchPreset } from '../presets/search';
import { useTamanForm } from '../use-taman-form';

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

let wrapper: undefined | VueWrapper<any>;

afterEach(() => {
  wrapper?.unmount();
  wrapper = undefined;
  // A failing fake-timers test would otherwise leak frozen timers into the
  // mount tests below (whose settle() awaits a real setTimeout).
  vi.useRealTimers();
});

async function settle() {
  await nextTick();
  await new Promise((resolve) => setTimeout(resolve, 0));
  await nextTick();
}

describe('applySearchPreset', () => {
  it('merges search defaults under user options', () => {
    const options = applySearchPreset({ preset: 'search' });
    expect(options.layout?.cols).toEqual({ base: 1, lg: 3, md: 2 });
    expect(options.collapsed).toBe(true);
    expect(options.collapsedRows).toBe(1);
    expect(options.showDefaultActions).toBe(true);
  });

  it('user options win over preset defaults', () => {
    const options = applySearchPreset({
      collapsedRows: 2,
      layout: { cols: { base: 4 } },
      preset: 'search',
    });
    expect(options.collapsedRows).toBe(2);
    expect(options.layout?.cols?.base).toBe(4);
  });

  it('passes non-search options through untouched', () => {
    const input = { fields: [] };
    expect(applySearchPreset(input)).toBe(input);
  });
});

describe('submitOnChange diffing (FormApi level)', () => {
  it('submitOnChange debounce submits only when values differ from last submission', async () => {
    vi.useFakeTimers();
    const { FormApi } = await import('../form-api');
    const { createSubmitOnChange } = await import('../presets/search');

    const api = new FormApi({ initialValues: { q: '' }, submitOnChange: true });
    const submit = vi.spyOn(api, 'submit').mockResolvedValue({ q: 'x' });

    const notify = createSubmitOnChange(api, 50);
    notify(); // values differ from (null) last submission
    await vi.advanceTimersByTimeAsync(50);
    expect(submit).toHaveBeenCalledTimes(1);

    // simulate recorded submission, unchanged values -> no submit
    (api as any).latestSubmissionValues = api.getValues();
    notify();
    await vi.advanceTimersByTimeAsync(50);
    expect(submit).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });

  it('cancel() drops a pending debounce so unmount cannot leak a submit', async () => {
    vi.useFakeTimers();
    const { FormApi } = await import('../form-api');
    const { createSubmitOnChange } = await import('../presets/search');

    const api = new FormApi({ initialValues: { q: '' }, submitOnChange: true });
    const submit = vi.spyOn(api, 'submit').mockResolvedValue({ q: 'x' });

    const notify = createSubmitOnChange(api, 50);
    notify(); // values differ -> would submit at +50ms...
    notify.cancel(); // ...but the component unmounts first
    await vi.advanceTimersByTimeAsync(200);
    expect(submit).not.toHaveBeenCalled();
    vi.useRealTimers();
  });
});

describe('collapse hiding over visible fields', () => {
  /** True when the element or an ancestor carries an inline display:none. */
  function isCollapsedAway(el: Element): boolean {
    for (
      let node: HTMLElement | null = el as HTMLElement;
      node;
      node = node.parentElement
    ) {
      if (node.style?.display === 'none') {
        return true;
      }
    }
    return false;
  }

  it('computes the hidden set over rendered fields, skipping if-excluded ones', async () => {
    const Host = defineComponent({
      setup(_, { expose }) {
        const [Form, formApi] = useTamanForm({
          fields: [
            { component: 'Input', name: 'kind' },
            {
              component: 'Input',
              dependencies: {
                if: (values) => values.kind !== 'off',
                triggerFields: ['kind'],
              },
              name: 'gated',
            },
            { component: 'Input', name: 'a' },
            { component: 'Input', name: 'b' },
          ],
          initialValues: { a: '', b: '', gated: '', kind: 'off' },
          preset: 'search',
        });
        expose({ formApi });
        return () => h(Form);
      },
    });
    wrapper = mount(Host, {
      global: {
        plugins: [
          pohon,
          createFormBuilder({ components: defineFieldComponents({ Input: PInput }) }),
        ],
      },
      attachTo: document.body,
    });
    await settle();

    // kind === 'off' -> gated is if-excluded (not rendered at all)
    expect(wrapper.find('input[name="gated"]').exists()).toBe(false);

    // happy-dom yields no grid rows, so keepItemIndex holds its default (1).
    // Visible indices must therefore be kind=0, a=1 (kept), b=2 (hidden):
    // the excluded `gated` must not shift `a` past the collapse boundary.
    expect(isCollapsedAway(wrapper.find('input[name="kind"]').element)).toBe(false);
    expect(isCollapsedAway(wrapper.find('input[name="a"]').element)).toBe(false);
    expect(isCollapsedAway(wrapper.find('input[name="b"]').element)).toBe(true);
  });
});
