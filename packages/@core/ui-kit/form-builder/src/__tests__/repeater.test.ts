import type { VueWrapper } from '@vue/test-utils';

import { mount } from '@vue/test-utils';
// See renderer.test.ts: pohon-ui registers PInput etc. as compile-time
// auto-imports via its vite plugin, not as app-level global components —
// `probe._context.components` stays empty after `probe.use(pohon)`. Pull the
// real component object from its package export instead.
import PInput from 'pohon-ui/components/Input.vue';
import pohon from 'pohon-ui/vue-plugin';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { defineComponent, h, nextTick } from 'vue';

import { createFormBuilder, defineFieldComponents } from '../plugin';
import RepeaterForm from './fixtures/repeater-form.vue';

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

function mountForm() {
  wrapper = mount(RepeaterForm, {
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
  return wrapper;
}

afterEach(() => {
  wrapper?.unmount();
  wrapper = undefined;
});

async function settle() {
  await nextTick();
  await new Promise((resolve) => setTimeout(resolve, 0));
  await nextTick();
}

describe('FieldRepeater', () => {
  it('renders one row per item with indexed names', async () => {
    const wrapper = mountForm();
    await settle();
    expect(wrapper.find('input[name="contacts.0.email"]').exists()).toBe(true);
  });

  it('add appends a row up to max; remove respects min', async () => {
    const wrapper = mountForm();
    await settle();
    const addButton = wrapper
      .findAll('button')
      .find((b) => b.text().includes('Add contact'))!;

    await addButton.trigger('click');
    await addButton.trigger('click');
    await settle();
    expect(wrapper.vm.formApi.values.contacts).toHaveLength(3);

    await addButton.trigger('click'); // max=3 — no-op
    await settle();
    expect(wrapper.vm.formApi.values.contacts).toHaveLength(3);

    const removeButtons = wrapper.findAll('button[data-repeater-remove]');
    await removeButtons[2].trigger('click');
    await removeButtons[1].trigger('click');
    await settle();
    expect(wrapper.vm.formApi.values.contacts).toHaveLength(1);

    await wrapper.find('button[data-repeater-remove]').trigger('click'); // min=1 — no-op
    await settle();
    expect(wrapper.vm.formApi.values.contacts).toHaveLength(1);
  });

  it('keeps DOM rows keyed by uid: reorder moves values with rows', async () => {
    const wrapper = mountForm();
    await settle();
    wrapper.vm.formApi.values.contacts.push({ email: 'second@x.co' });
    await settle();

    // Capture the physical DOM node of row 0's input BEFORE the move. With
    // uid keys, Vue's keyed diff relocates this exact subtree to position 1
    // (where it picks up the indexed name contacts.1.email). With index keys
    // (or a values-only swap that leaves uids alone) the node would stay at
    // position 0 and only its value would patch — identity below would fail.
    const el0 = wrapper.find('input[name="contacts.0.email"]').element;

    const moveDown = wrapper.findAll('button[data-repeater-down]')[0];
    await moveDown.trigger('click');
    await settle();

    expect(wrapper.vm.formApi.values.contacts.map((c: any) => c.email)).toEqual([
      'second@x.co',
      'first@x.co',
    ]);
    const first = wrapper.find('input[name="contacts.0.email"]')
      .element as HTMLInputElement;
    expect(first.value).toBe('second@x.co');
    // The SAME node moved rows: DOM identity followed the uid, not the index.
    expect(wrapper.find('input[name="contacts.1.email"]').element).toBe(el0);
  });

  it('item errors land on indexed paths and render inside the offending row', async () => {
    const wrapper = mountForm();
    await settle();
    // Two rows: only row 0 is invalid — proves the error is scoped to the
    // indexed PFormField, not smeared across the repeater.
    wrapper.vm.formApi.values.contacts.push({ email: 'second@x.co' });
    wrapper.vm.formApi.values.contacts[0].email = '';
    await settle();

    const { errors, valid } = await wrapper.vm.formApi.validate();
    expect(valid).toBe(false);
    expect(errors.some((e) => e.path === 'contacts.0.email')).toBe(true);
    await settle();

    // The error message must render through the repeater's DOM: inside the
    // PFormField of the FIRST row (the one wrapping contacts.0.email) and
    // NOT inside the second, valid row.
    const rowOf = (name: string) =>
      wrapper.find(`input[name="${name}"]`).element.closest('[data-repeater-row]')!;
    const row0 = rowOf('contacts.0.email');
    const row1 = rowOf('contacts.1.email');
    expect(row1).not.toBe(row0);
    expect(row0.textContent).toContain('email required');
    expect(row1.textContent).not.toContain('email required');
  });
});
