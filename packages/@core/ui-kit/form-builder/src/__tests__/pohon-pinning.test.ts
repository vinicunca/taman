import type { VueWrapper } from '@vue/test-utils';

import { mount } from '@vue/test-utils';
import pohon from 'pohon-ui/vue-plugin';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { defineComponent, h, nextTick } from 'vue';

import PinningForm from './fixtures/pinning-form.vue';

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

function mountFixture() {
  wrapper = mount(PinningForm, {
    global: { plugins: [pohon] },
    attachTo: document.body,
  });
  return wrapper;
}

afterEach(() => {
  wrapper?.unmount();
  wrapper = undefined;
});

describe('pohon-ui form behavior pinning', () => {
  it('validate({ silent: true }) returns false and maps zod issues to dot paths', async () => {
    const wrapper = mountFixture();
    const form = wrapper.vm.formRef;

    const result = await form.validate({ silent: true });
    expect(result).toBe(false);

    const errors = form.getErrors();
    const names = errors.map((e: any) => e.name);
    expect(names).toContain('user.email');
    expect(names).toContain('age');
  });

  it('validate resolves with (transformed) data when state is valid', async () => {
    const wrapper = mountFixture();
    wrapper.vm.state.user.email = 'a@b.co';
    wrapper.vm.state.age = 30;
    await nextTick();

    const form = wrapper.vm.formRef;
    const result = await form.validate({ silent: true });
    expect(result).toMatchObject({ user: { email: 'a@b.co' }, age: 30 });
  });

  it('setErrors/getErrors/clear round-trip with { name, message } shape', async () => {
    const wrapper = mountFixture();
    const form = wrapper.vm.formRef;

    form.setErrors([{ name: 'user.email', message: 'taken' }]);
    expect(form.getErrors('user.email')[0].message).toBe('taken');

    form.clear('user.email');
    expect(form.getErrors('user.email')).toHaveLength(0);
  });

  it('PFormField renders the error message for its dot-path name', async () => {
    const wrapper = mountFixture();
    await wrapper.vm.formRef.validate({ silent: true }).catch(() => {});
    await nextTick();
    expect(wrapper.text()).toContain('email required');
  });

  it('native submit emits @submit with parsed data when valid', async () => {
    const wrapper = mountFixture();
    wrapper.vm.state.user.email = 'a@b.co';
    wrapper.vm.state.age = 30;
    await nextTick();

    await wrapper.find('form').trigger('submit');
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(wrapper.vm.submitted).toMatchObject({ user: { email: 'a@b.co' }, age: 30 });
  });
});
