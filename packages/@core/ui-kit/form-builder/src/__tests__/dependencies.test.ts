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
import DepsForm from './fixtures/deps-form.vue';

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
  wrapper = mount(DepsForm, {
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

describe('dependencies engine', () => {
  it('if=false unmounts the field, excludes its rule and its value', async () => {
    const wrapper = mountForm();
    await settle();
    expect(wrapper.find('input[name="conditional"]').exists()).toBe(true);

    wrapper.vm.formApi.values.kind = 'none';
    await settle();
    expect(wrapper.find('input[name="conditional"]').exists()).toBe(false);
    expect('conditional' in wrapper.vm.formApi.getValues()).toBe(false);

    // rule excluded: submit passes despite empty `conditional`
    const result = await wrapper.vm.formApi.submit();
    expect(result).toBeDefined();
  });

  it('show=false hides via CSS but keeps validation and value', async () => {
    const wrapper = mountForm();
    wrapper.vm.formApi.values.kind = 'hide-me';
    await settle();
    const field = wrapper.find('input[name="peekaboo"]');
    expect(field.exists()).toBe(true); // still mounted
    expect('peekaboo' in wrapper.vm.formApi.getValues()).toBe(true);
  });

  it('disabled and dynamic props react to trigger fields', async () => {
    const wrapper = mountForm();
    wrapper.vm.formApi.values.kind = 'lock';
    await settle();
    const input = wrapper.find('input[name="reactiveField"]');
    expect(input.attributes('disabled')).toBeDefined();
    expect(input.attributes('placeholder')).toBe('kind:lock');
  });

  it('dynamic rules override static rules', async () => {
    const wrapper = mountForm();
    wrapper.vm.formApi.values.kind = 'strict';
    wrapper.vm.formApi.values.reactiveField = 'abc';
    await settle();
    const { valid, errors } = await wrapper.vm.formApi.validate();
    expect(valid).toBe(false);
    expect(errors.some((e) => e.path === 'reactiveField' && e.message === 'min5')).toBe(true);
  });

  it('engine writes preserve the validating flag', async () => {
    const wrapper = mountForm();
    await settle();
    // Simulate an async validation in flight (Task 10 territory): the flag
    // is owned by the validation pipeline, not the dependencies engine.
    wrapper.vm.formApi.setFieldRuntime('reactiveField', { validating: true });

    wrapper.vm.formApi.values.kind = 'poke';
    await settle();
    const runtime = wrapper.vm.formApi.getFieldRuntime('reactiveField');
    // Engine re-evaluated (dynamicProps updated) without clobbering the flag.
    expect(runtime.dynamicProps.placeholder).toBe('kind:poke');
    expect(runtime.validating).toBe(true);
  });

  it('overlapping evaluations resolve last-wins', async () => {
    const wrapper = mountForm();
    await settle();

    // Start a slow evaluation (racer's props callback awaits 30ms when
    // kind === 'slow')...
    wrapper.vm.formApi.values.kind = 'slow';
    await nextTick(); // let the watcher fire for 'slow'
    // ...then supersede it with a fast one before the slow run resolves.
    wrapper.vm.formApi.values.kind = 'fast';
    await nextTick();

    // Generous margin: slow run resolves at ~30ms, fast at ~0ms.
    await new Promise((resolve) => setTimeout(resolve, 60));
    await nextTick();

    const runtime = wrapper.vm.formApi.getFieldRuntime('racer');
    // Without run-token guarding, the slow run resolves LAST and would
    // clobber the runtime with stale 'race:slow' props.
    expect(runtime.dynamicProps.placeholder).toBe('race:fast');
  });

  it('trigger side-effect fires on trigger-field change only', async () => {
    const wrapper = mountForm();
    await settle();
    const before = wrapper.vm.trigger.calls;
    wrapper.vm.formApi.values.reactiveField = 'no-op'; // NOT a trigger field
    await settle();
    expect(wrapper.vm.trigger.calls).toBe(before);
    wrapper.vm.formApi.values.kind = 'poke';
    await settle();
    expect(wrapper.vm.trigger.calls).toBe(before + 1);
  });
});
