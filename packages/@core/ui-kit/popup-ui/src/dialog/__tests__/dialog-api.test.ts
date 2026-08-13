import type { DialogState } from '../dialog.types';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { DialogApi } from '../dialog.api';

vi.mock('@taman-core/shared/store', () => {
  return {
    isFunction: (fn: any) => typeof fn === 'function',
    Store: class {
      get state() {
        return this._state;
      }

      private _state: DialogState;
      private subscribers: Array<(state: DialogState) => void> = [];

      constructor(initialState: DialogState) {
        this._state = initialState;
      }

      setState(fn: (prev: DialogState) => DialogState) {
        this._state = fn(this._state);
        this.subscribers.forEach((sub) => {
          sub(this._state);
        });
      }

      subscribe(fn: (state: DialogState) => void) {
        this.subscribers.push(fn);
        return { unsubscribe: () => {} };
      }
    },
  };
});

describe('dialogApi', () => {
  let dialogApi: DialogApi;
  // Use dialogState instead of state
  let dialogState: DialogState;

  beforeEach(() => {
    dialogApi = new DialogApi();
    // Get state from dialogApi
    dialogState = dialogApi.store.state;
  });

  it('should initialize with default state', () => {
    expect(dialogState.isOpen).toBe(false);
    expect(dialogState.cancelText).toBeUndefined();
    expect(dialogState.confirmText).toBeUndefined();
  });

  it('should open the modal', () => {
    dialogApi.open();
    expect(dialogApi.store.state.isOpen).toBe(true);
  });

  it('should close the modal if onBeforeClose allows it', () => {
    dialogApi.close();
    expect(dialogApi.store.state.isOpen).toBe(false);
  });

  it('should not close the modal if onBeforeClose returns false', () => {
    const onBeforeClose = vi.fn(() => false);
    const dialogApiWithHook = new DialogApi({ onBeforeClose });
    dialogApiWithHook.open();
    dialogApiWithHook.close();
    expect(dialogApiWithHook.store.state.isOpen).toBe(true);
    expect(onBeforeClose).toHaveBeenCalled();
  });

  it('should trigger onCancel and close the modal if no onCancel hook is provided', () => {
    const onCancel = vi.fn();
    const dialogApiWithHook = new DialogApi({ onCancel });
    dialogApiWithHook.open();
    dialogApiWithHook.onCancel();
    expect(onCancel).toHaveBeenCalled();
    expect(dialogApiWithHook.store.state.isOpen).toBe(true);
  });

  it('should update shared data correctly', () => {
    const testData = { key: 'value' };
    dialogApi.setData(testData);
    expect(dialogApi.getData()).toEqual(testData);
  });

  it('should set state correctly using an object', () => {
    dialogApi.setState({ title: 'New Title' });
    expect(dialogApi.store.state.title).toBe('New Title');
  });

  it('should set state correctly using a function', () => {
    dialogApi.setState((prev) => ({ ...prev, confirmText: 'Yes' }));
    expect(dialogApi.store.state.confirmText).toBe('Yes');
  });

  it('should call onOpenChange when state changes', () => {
    const onOpenChange = vi.fn();
    const dialogApiWithHook = new DialogApi({ onOpenChange });
    dialogApiWithHook.open();
    expect(onOpenChange).toHaveBeenCalledWith(true);
  });

  it('should call onClosed callback when provided', () => {
    const onClosed = vi.fn();
    const dialogApiWithHook = new DialogApi({ onClosed });
    dialogApiWithHook.onClosed();
    expect(onClosed).toHaveBeenCalled();
  });

  it('should call onOpened callback when provided', () => {
    const onOpened = vi.fn();
    const dialogApiWithHook = new DialogApi({ onOpened });
    dialogApiWithHook.open();
    dialogApiWithHook.onOpened();
    expect(onOpened).toHaveBeenCalled();
  });

  it('resolves the open promise with the value passed to close', async () => {
    const promise = dialogApi.open();
    await dialogApi.close({ saved: true });
    await expect(promise).resolves.toEqual({ saved: true });
  });

  it('resolves the open promise with undefined on a plain dismissal', async () => {
    const promise = dialogApi.open();
    await dialogApi.close();
    await expect(promise).resolves.toBeUndefined();
  });

  it('keeps the open promise pending when onBeforeClose vetoes', async () => {
    const apiWithVeto = new DialogApi({ onBeforeClose: () => false });
    const resolved = vi.fn();
    const promise = apiWithVeto.open();
    // eslint-disable-next-line sonar/void-use
    void promise.then(resolved);
    await apiWithVeto.close('nope');
    await Promise.resolve();
    expect(apiWithVeto.store.state.isOpen).toBe(true);
    expect(resolved).not.toHaveBeenCalled();
  });

  it('returns the same pending promise for repeated open calls', () => {
    const first = dialogApi.open();
    const second = dialogApi.open();
    expect(second).toBe(first);
  });

  it('creates a fresh promise after a completed close', async () => {
    const first = dialogApi.open();
    await dialogApi.close();
    const second = dialogApi.open();
    expect(second).not.toBe(first);
  });
});
