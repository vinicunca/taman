import type { App } from 'vue';

import { afterEach, describe, expect, it } from 'vitest';
import { createApp, defineComponent, h, nextTick, ref } from 'vue';

import TamanRenderContent from '../render-content.vue';

let activeApp: App | undefined;

function mount(render: () => any) {
  const host = document.createElement('div');
  document.body.append(host);
  activeApp = createApp({ render });
  activeApp.mount(host);
  return host;
}

afterEach(() => {
  activeApp?.unmount();
  activeApp = undefined;
  document.body.innerHTML = '';
});

describe('tamanRenderContent', () => {
  it('renders nothing for empty content', () => {
    const host = mount(() => h('div', [
      h(TamanRenderContent, { content: '' }),
    ]));
    expect(host.textContent).toBe('');
  });

  it('renders a string as text, not as a component name', () => {
    const host = mount(() => h(TamanRenderContent, { content: 'Hello' }));
    expect(host.innerHTML).toBe('Hello');
  });

  it('splits a string into paragraphs when renderBr is set', () => {
    const host = mount(() =>
      h(TamanRenderContent, { content: 'one\ntwo', renderBr: true }),
    );
    expect(host.innerHTML).toBe('<p>one</p><p>two</p>');
  });

  it('renders a render function and re-renders when its reactive deps change', async () => {
    const label = ref('first');
    const host = mount(() =>
      h(TamanRenderContent, {
        content: () => h('span', label.value),
      }),
    );
    expect(host.innerHTML).toBe('<span>first</span>');

    label.value = 'second';
    await nextTick();
    expect(host.innerHTML).toBe('<span>second</span>');
  });

  it('forwards attrs to a component without leaking a `props` attribute', () => {
    const Child = defineComponent({
      inheritAttrs: false,
      setup(_, { attrs }) {
        return () => h('span', {
          'data-attrs': Object.keys(attrs).sort().join(','),
        });
      },
    });

    const host = mount(() =>
      h(TamanRenderContent, { content: Child, title: 'tip' }),
    );
    expect(host.querySelector('span')?.dataset.attrs).toBe('title');
  });

  it('renders the same VNode in more than one place', () => {
    const shared = h('b', 'shared');
    const host = mount(() =>
      h('div', [
        h(TamanRenderContent, { content: shared }),
        h(TamanRenderContent, { content: shared }),
      ]),
    );
    expect(host.querySelectorAll('b')).toHaveLength(2);
  });
});
