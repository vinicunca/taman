import type { AppContext, VNode } from 'vue';

import { globalShareState } from '@taman-core/shared/global-state';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createApp } from 'vue';

import { clearAllAlerts, tamanAlert } from '../alert-builder';

const { captured } = vi.hoisted(() => ({
  captured: { vnode: undefined as undefined | VNode },
}));

vi.mock('vue', async (importOriginal) => {
  const vue = await importOriginal<typeof import('vue')>();
  return {
    ...vue,
    // Capture the vnode without mounting — mounting would pull pohon Link's
    // useRoute() and needs a full router-installed app context.
    render: (vnode: null | VNode) => {
      if (vnode) {
        captured.vnode = vnode;
      }
    },
  };
});

vi.mock('@taman-core/composables', () => ({
  useSimpleLocale: () => ({
    $t: { value: (key: string) => key },
  }),
}));

afterEach(() => {
  clearAllAlerts();
  captured.vnode = undefined;
  document.body.innerHTML = '';
});

describe('tamanAlert builder', () => {
  it('assigns the shared app context onto the imperative alert vnode', () => {
    const app = createApp({ render: () => null });
    const appContext = app._context as AppContext;
    globalShareState.setAppContext(appContext);

    void tamanAlert({ content: 'Hello', title: 'Title' });

    expect(captured.vnode?.appContext).toBe(appContext);
  });
});
