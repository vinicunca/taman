import { afterEach, describe, expect, it, vi } from 'vitest';
import { createApp, defineComponent, h, nextTick, onMounted, ref } from 'vue';

import AlertOverlay from '../alert-overlay.vue';

vi.mock('../alert.vue', () => ({
  default: defineComponent({
    emits: ['closed', 'opened'],
    setup(_, { emit }) {
      onMounted(() => emit('opened'));
      return () => h('button', { onClick: () => emit('closed', true) });
    },
  }),
}));

describe('alertOverlay', () => {
  it('forwards ordinary Alert listeners while retaining host protocol listeners', async () => {
    const onOpened = vi.fn();
    const app = createApp(
      defineComponent(() => () => h(AlertOverlay, { onOpened })),
    );
    const host = document.createElement('div');
    document.body.append(host);
    app.mount(host);
    await nextTick();

    expect(onOpened).toHaveBeenCalledTimes(1);

    app.unmount();
  });

  it('settles and unmounts the host after Alert finishes closing', async () => {
    const open = ref(true);
    const onClose = vi.fn();
    const onAfterLeave = vi.fn();
    const app = createApp(
      defineComponent(() => () => h(AlertOverlay, {
        'open': open.value,
        'onUpdate:open': (value: boolean) => {
          open.value = value;
        },
        onClose,
        'onAfter:leave': onAfterLeave,
      })),
    );
    const host = document.createElement('div');
    document.body.append(host);
    app.mount(host);

    const button = document.querySelector('button');
    expect(button).toBeInstanceOf(HTMLButtonElement);
    button?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await nextTick();

    expect(onClose).toHaveBeenCalledWith({ isConfirm: true });
    expect(onAfterLeave).toHaveBeenCalledTimes(1);

    app.unmount();
  });
});

afterEach(() => {
  document.body.innerHTML = '';
});
