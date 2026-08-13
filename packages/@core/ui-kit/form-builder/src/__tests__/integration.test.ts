import type { VueWrapper } from '@vue/test-utils';

import { mount } from '@vue/test-utils';
// pohon-ui registers PInput etc. as compile-time auto-imports via its vite
// plugin, not as app-level global components — pull the real component
// object from its package export instead (see package.json
// `exports["./components/*"]`), matching renderer.test.ts's convention.
import PInput from 'pohon-ui/components/Input.vue';
import pohon from 'pohon-ui/vue-plugin';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { defineComponent, h, nextTick } from 'vue';

import { createFormBuilder, defineFieldComponents } from '../index';
import CrudForm from './fixtures/crud-form.vue';

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

async function settle() {
  await nextTick();
  await new Promise((resolve) => setTimeout(resolve, 0));
  await nextTick();
}

afterEach(() => {
  wrapper?.unmount();
  wrapper = undefined;
});

describe('end-to-end CRUD form', () => {
  it('setValues -> edit -> submit round-trips transforms, deps, and server errors', async () => {
    wrapper = mount(CrudForm, {
      global: {
        plugins: [
          pohon,
          createFormBuilder({
            components: defineFieldComponents({ Input: PInput }),
          }),
        ],
      },
      attachTo: document.body,
    });
    await settle();
    const api = wrapper.vm.formApi;

    // load "API" data through transform.in
    await api.setValues({ from: '2026-01-01', name: 'Gig', to: '2026-01-31' });
    await settle();
    expect(api.values.window).toBe('2026-01-01|2026-01-31');

    // dependency mounted because name is set
    expect(wrapper.find('input[name="meta.slug"]').exists()).toBe(true);

    // invalid: slug empty -> submit blocked, inline error visible
    expect(await api.submit()).toBeUndefined();
    await settle();
    expect(wrapper.text()).toContain('slug required');

    // fix and submit -> transform.out splits window
    await api.setFieldValue('meta.slug', 'gig');
    const result = await api.submit();
    expect(result).toMatchObject({
      from: '2026-01-01',
      meta: { slug: 'gig' },
      name: 'Gig',
      to: '2026-01-31',
    });
    expect('window' in result!).toBe(false);
    expect(wrapper.emitted('submitted')).toBeTruthy();

    // server-side 422 mapping
    await api.setErrors([{ message: 'slug taken', path: 'meta.slug' }]);
    await settle();
    expect(wrapper.text()).toContain('slug taken');
  });
});
