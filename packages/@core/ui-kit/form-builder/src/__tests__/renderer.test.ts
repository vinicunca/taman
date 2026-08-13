import type { VueWrapper } from '@vue/test-utils';

import { mount } from '@vue/test-utils';
// pohon-ui registers PInput etc. as compile-time auto-imports via its vite
// plugin, not as app-level global components — `probe._context.components`
// stays empty after `probe.use(pohon)`. Pull the real component object from
// its package export instead (see package.json `exports["./components/*"]`).
import PInput from 'pohon-ui/components/Input.vue';
import pohon from 'pohon-ui/vue-plugin';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { defineComponent, h, nextTick } from 'vue';
import { z } from 'zod';

import { createFormBuilder, defineFieldComponents } from '../plugin';
import { useTamanForm } from '../use-taman-form';
import BasicForm from './fixtures/basic-form.vue';

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
  wrapper = mount(BasicForm, {
    global: {
      plugins: [
        pohon,
        createFormBuilder({
          components: defineFieldComponents({ Input: PInput }),
          defaults: { Input: { placeholder: 'default-ph' } },
        }),
      ],
    },
    attachTo: document.body,
  });
  return wrapper;
}

function mountAsyncForm(handler: (value: unknown, values: any) => Promise<string | undefined>) {
  const Host = defineComponent({
    setup(_, { expose }) {
      const [Form, formApi] = useTamanForm({
        fields: [
          { component: 'Input', label: 'Plain', name: 'plain' },
          {
            asyncValidate: { debounce: 0, handler },
            component: 'Input',
            label: 'Async',
            name: 'asyncField',
          },
        ],
        initialValues: { asyncField: '', plain: '' },
      });
      expose({ formApi });
      return () => h(Form);
    },
  });
  wrapper = mount(Host, {
    global: {
      plugins: [
        pohon,
        createFormBuilder({
          components: defineFieldComponents({ Input: PInput }),
          defaults: {},
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

describe('FormRenderer', () => {
  it('renders registry fields with labels and registry default props', async () => {
    const wrapper = mountForm();
    await nextTick();
    expect(wrapper.text()).toContain('Email');
    expect(wrapper.text()).toContain('Nick');
    const inputs = wrapper.findAll('input[placeholder="default-ph"]');
    expect(inputs.length).toBeGreaterThanOrEqual(2);
  });

  it('renders field controls with a full-width class so the grid/parent controls sizing', async () => {
    const wrapper = mountForm();
    await nextTick();
    const input = wrapper.find('input[name="nick"]').element as HTMLElement;
    // PInput's root wrapper (not necessarily the <input> itself) is where
    // Vue's attribute fallthrough lands our `class="w-full"` binding —
    // check both to stay robust to exact internal nesting.
    const classes = `${input.className} ${input.parentElement?.className ?? ''}`;
    expect(classes).toContain('w-full');
  });

  it('binds v-model through dot paths in both directions', async () => {
    const wrapper = mountForm();
    await nextTick();
    const api = wrapper.vm.formApi;

    // model -> view
    expect((wrapper.find('input[name="nick"]').element as HTMLInputElement).value)
      .toBe('n0');

    // view -> model
    await wrapper.find('input[name="user.email"]').setValue('a@b.co');
    expect(api.values.user.email).toBe('a@b.co');
  });

  it('passes named slots matching field names through to the control', async () => {
    const wrapper = mountForm();
    await nextTick();
    const slotted = wrapper.find('.custom-slot');
    expect(slotted.exists()).toBe(true);
    expect(slotted.attributes('data-field')).toBe('custom');
  });

  it('shows inline validation errors after submit and none after fixing', async () => {
    const wrapper = mountForm();
    await nextTick();
    const api = wrapper.vm.formApi;

    expect(await api.submit()).toBeUndefined();
    await nextTick();
    expect(wrapper.text()).toContain('required');

    await api.setFieldValue('user.email', 'a@b.co');
    const result = await api.submit();
    expect(result).toMatchObject({ user: { email: 'a@b.co' } });
  });

  it('emits handleSubmit through the default submit button', async () => {
    const wrapper = mountForm();
    await nextTick();
    await wrapper.vm.formApi.setFieldValue('user.email', 'a@b.co');
    await wrapper.find('form').trigger('submit');
    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(wrapper.emitted('submitted')).toBeTruthy();
    expect(wrapper.emitted('submitted')![0][0]).toMatchObject({
      user: { email: 'a@b.co' },
    });
  });

  it('default action buttons render with default messages and reset works', async () => {
    const wrapper = mountForm();
    await nextTick();
    const buttons = wrapper.findAll('button');
    const labels = buttons.map((b) => b.text());
    expect(labels).toContain('Submit');
    expect(labels).toContain('Reset');

    await wrapper.vm.formApi.setFieldValue('nick', 'changed');
    const reset = buttons.find((b) => b.text() === 'Reset')!;
    await reset.trigger('click');
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(wrapper.vm.formApi.values.nick).toBe('n0');
  });

  it('hides only the Reset button when showResetButton is false', async () => {
    const Host = defineComponent({
      setup(_, { expose }) {
        const [Form, formApi] = useTamanForm({
          fields: [{ component: 'Input', label: 'Email', name: 'email' }],
          initialValues: { email: '' },
          showResetButton: false,
        });
        expose({ formApi });
        return () => h(Form);
      },
    });
    wrapper = mount(Host, {
      global: {
        plugins: [
          pohon,
          createFormBuilder({
            components: defineFieldComponents({ Input: PInput }),
            defaults: {},
          }),
        ],
      },
      attachTo: document.body,
    });
    await nextTick();
    const labels = wrapper.findAll('button').map((button) => button.text());
    expect(labels).toContain('Submit');
    expect(labels).not.toContain('Reset');
  });

  it('scopes the focusout wrapper to fields with asyncValidate only', async () => {
    const wrapper = mountAsyncForm(vi.fn(async () => undefined));
    await nextTick();

    // Exactly one wrapper: the async field's. The plain field keeps its
    // previous unwrapped DOM (no focusout div between PFormField and control).
    expect(wrapper.findAll('[data-async-validate]')).toHaveLength(1);
    const plain = wrapper.find('input[name="plain"]');
    expect(plain.element.closest('[data-async-validate]')).toBeNull();
    const async = wrapper.find('input[name="asyncField"]');
    expect(async.element.closest('[data-async-validate]')).not.toBeNull();
  });

  it('fires blur-mode async validation via focusout on the wrapper', async () => {
    const handler = vi.fn(async () => undefined);
    const wrapper = mountAsyncForm(handler);
    await nextTick();

    const input = wrapper.find('input[name="asyncField"]');
    await input.setValue('hello');
    await input.trigger('focusout');
    await new Promise((resolve) => setTimeout(resolve, 20)); // debounce: 0
    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith('hello', expect.anything());
  });

  it('blocks the native submit path when an async error is on record (F1)', async () => {
    const wrapper = mountForm();
    await nextTick();
    const api = wrapper.vm.formApi;
    await api.setFieldValue('user.email', 'a@b.co');
    await api.setAsyncError('nick', 'already taken');

    await wrapper.find('form').trigger('submit');
    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(wrapper.emitted('submitted')).toBeFalsy();
  });

  it('clears a recorded async error immediately on the next value change, no new blur required (F2)', async () => {
    const handler = vi.fn(async (value: unknown) =>
      value === 'taken' ? 'already taken' : undefined,
    );
    const wrapper = mountAsyncForm(handler);
    await nextTick();
    const api = wrapper.vm.formApi;

    const input = wrapper.find('input[name="asyncField"]');
    await input.setValue('taken');
    await input.trigger('focusout');
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(handler).toHaveBeenCalledTimes(1);
    expect(await api.submitFromNativeEvent()).toBeUndefined(); // blocked

    await input.setValue('fixed'); // value changes only, no new blur
    await nextTick();

    expect(await api.submitFromNativeEvent()).not.toBeUndefined(); // no longer blocked
    expect(handler).toHaveBeenCalledTimes(1); // clearing did not trigger re-validation
  });

  it('typing in a plain (non-async) field does not wipe its displayed sync error', async () => {
    const Host = defineComponent({
      setup(_, { expose }) {
        const [Form, formApi] = useTamanForm({
          fields: [
            {
              component: 'Input',
              label: 'Plain',
              name: 'plain',
              rules: z.string().min(5, 'too short'),
            },
          ],
          initialValues: { plain: '' },
          // Disable PForm's own on-input re-validation so the displayed
          // error can only disappear if OUR code clears it — which is
          // exactly the regression under test (unguarded clear-on-change).
          validateOn: [],
        });
        expose({ formApi });
        return () => h(Form);
      },
    });
    wrapper = mount(Host, {
      global: {
        plugins: [
          pohon,
          createFormBuilder({
            components: defineFieldComponents({ Input: PInput }),
            defaults: {},
          }),
        ],
      },
      attachTo: document.body,
    });
    await nextTick();
    const api = wrapper.vm.formApi;

    await api.validate();
    await nextTick();
    expect(wrapper.text()).toContain('too short');

    await wrapper.find('input[name="plain"]').setValue('abc'); // still invalid
    await new Promise((resolve) => setTimeout(resolve, 20)); // settle

    expect(wrapper.text()).toContain('too short');
  });

  it('live-validates after the first error: clears while typing and reappears if invalid again', async () => {
    const Host = defineComponent({
      setup(_, { expose }) {
        const [Form, formApi] = useTamanForm({
          fields: [
            {
              component: 'Input',
              label: 'Email',
              name: 'email',
              rules: z.string().email('bad email'),
            },
          ],
          initialValues: { email: '' },
        });
        expose({ formApi });
        return () => h(Form);
      },
    });
    wrapper = mount(Host, {
      global: {
        plugins: [
          pohon,
          createFormBuilder({
            components: defineFieldComponents({ Input: PInput }),
            defaults: {},
          }),
        ],
      },
      attachTo: document.body,
    });
    await nextTick();
    const api = wrapper.vm.formApi;

    // Surface the first error programmatically — deliberately NOT via a
    // native blur DOM event, since a submit-button click doesn't reliably
    // blur the focused input in every browser (notably Safari), and this
    // is the exact path the eager-after-first-error latch must not depend on.
    await api.validate();
    await nextTick();
    expect(wrapper.text()).toContain('bad email');

    // Fix it while typing — no blur, no resubmit. The latch should have
    // switched this field to live (eager) validation.
    const input = wrapper.find('input[name="email"]');
    await input.setValue('a@b.co');
    await new Promise((resolve) => setTimeout(resolve, 400)); // validateOnInputDelay
    expect(wrapper.text()).not.toContain('bad email');

    // Break it again while typing — same live feedback in the other
    // direction, still no blur/submit.
    await input.setValue('nope');
    await new Promise((resolve) => setTimeout(resolve, 400));
    expect(wrapper.text()).toContain('bad email');
  });
});

describe('FormRenderer field.slots and function labels', () => {
  it('renders field.slots as named slots on the resolved component (F3)', async () => {
    const SlotDemo = defineComponent({
      name: 'SlotDemo',
      setup: (_, { slots }) => () => h('div', { class: 'slot-demo' }, slots.extra?.({})),
    });
    const Host = defineComponent({
      setup(_, { expose }) {
        const [Form, formApi] = useTamanForm({
          fields: [
            {
              component: 'SlotDemo',
              name: 'demo',
              slots: { extra: () => h('span', { class: 'slot-content' }, 'hi-from-slot') },
            },
          ],
          initialValues: { demo: '' },
        });
        expose({ formApi });
        return () => h(Form);
      },
    });
    const w = mount(Host, {
      global: {
        plugins: [
          pohon,
          createFormBuilder({
            components: defineFieldComponents({ SlotDemo }),
            defaults: {},
          }),
        ],
      },
      attachTo: document.body,
    });
    await nextTick();
    expect(w.find('.slot-content').text()).toBe('hi-from-slot');
    w.unmount();
  });

  it('renders a function label through the #label slot (F4)', async () => {
    const Host = defineComponent({
      setup(_, { expose }) {
        const [Form, formApi] = useTamanForm({
          fields: [
            {
              component: 'Input',
              label: () => h('strong', { class: 'fn-label' }, 'Bold Label'),
              name: 'field1',
            },
          ],
          initialValues: { field1: '' },
        });
        expose({ formApi });
        return () => h(Form);
      },
    });
    const w = mount(Host, {
      global: {
        plugins: [
          pohon,
          createFormBuilder({
            components: defineFieldComponents({ Input: PInput }),
            defaults: {},
          }),
        ],
      },
      attachTo: document.body,
    });
    await nextTick();
    expect(w.find('.fn-label').text()).toBe('Bold Label');
    w.unmount();
  });
});
