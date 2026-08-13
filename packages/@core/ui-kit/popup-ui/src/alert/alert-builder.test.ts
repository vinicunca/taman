import { globalShareState } from '@taman-core/shared/global-state';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createApp, getCurrentInstance } from 'vue';

const captured = vi.hoisted(() => ({
  appContext: undefined as any,
  emit: undefined as ((event: string, ...args: Array<any>) => void) | undefined,
  props: undefined as any,
}));

vi.mock('./alert.vue', () => ({
  default: {
    name: 'AlertStub',
    props: ['content', 'showCancel', 'title', 'icon', 'beforeClose'],
    emits: ['closed', 'opened', 'confirm'],
    setup(props: any, { emit }: any) {
      captured.emit = emit;
      captured.props = props;
      captured.appContext = getCurrentInstance()?.appContext;
      return () => null;
    },
  },
}));

const { clearAllAlerts, tamanAlert, tamanConfirm, tamanPrompt } = await import(
  './alert-builder',
);

describe('alert-builder', () => {
  beforeEach(() => {
    captured.emit = undefined;
    captured.props = undefined;
    captured.appContext = undefined;
    clearAllAlerts();
  });

  it('resolves true when confirmed — never rejects', async () => {
    const promise = tamanAlert({ content: 'hi' });
    captured.emit!('closed', true);
    await expect(promise).resolves.toBe(true);
  });

  it('resolves false when dismissed/cancelled — never rejects', async () => {
    const promise = tamanAlert({ content: 'hi' });
    captured.emit!('closed', false);
    await expect(promise).resolves.toBe(false);
  });

  it('tamanConfirm defaults showCancel to true', () => {
    void tamanConfirm({ content: 'sure?' });
    expect(captured.props.showCancel).toBe(true);
    captured.emit!('closed', true);
  });

  it('tamanConfirm lets the caller override showCancel', () => {
    void tamanConfirm({ content: 'sure?', showCancel: false });
    expect(captured.props.showCancel).toBe(false);
    captured.emit!('closed', true);
  });

  it('tamanPrompt resolves the entered value on confirm', async () => {
    const promise = tamanPrompt<string>({
      content: 'what?',
      defaultValue: 'cheese',
    });
    captured.emit!('closed', true);
    await expect(promise).resolves.toBe('cheese');
  });

  it('tamanPrompt resolves undefined on cancel, not the typed value', async () => {
    const promise = tamanPrompt<string>({
      content: 'what?',
      defaultValue: 'cheese',
    });
    captured.emit!('closed', false);
    await expect(promise).resolves.toBeUndefined();
  });

  it('assigns the shared app context to the rendered vnode when available', () => {
    // A real app's context — the fix assigns it onto a live vnode that Vue
    // actually mounts, so a hand-rolled fake object isn't enough here.
    const hostApp = createApp({ render: () => null });
    const realAppContext = hostApp._context;
    globalShareState.setAppContext(realAppContext);
    tamanAlert({ content: 'hi' });
    expect(captured.appContext).toBe(realAppContext);
    captured.emit!('closed', true);
  });
});
