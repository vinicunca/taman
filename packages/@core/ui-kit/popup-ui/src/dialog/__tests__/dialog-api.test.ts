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
  let dialogState: DialogState;

  beforeEach(() => {
    dialogApi = new DialogApi();
    dialogState = dialogApi.store.state;
  });

  it('should initialize with default state', () => {
    expect(dialogState.isOpen).toBe(false);
    expect(dialogState.cancelText).toBeUndefined();
    expect(dialogState.confirmText).toBeUndefined();
  });

  it('should open the dialog', () => {
    dialogApi.open();
    expect(dialogApi.store.state.isOpen).toBe(true);
  });

  it('should close the dialog if onBeforeClose allows it', () => {
    dialogApi.close();
    expect(dialogApi.store.state.isOpen).toBe(false);
  });

  it('should not close the dialog if onBeforeClose returns false', () => {
    const onBeforeClose = vi.fn(() => false);
    const dialogApiWithHook = new DialogApi({ onBeforeClose });
    dialogApiWithHook.open();
    dialogApiWithHook.close();
    expect(dialogApiWithHook.store.state.isOpen).toBe(true);
    expect(onBeforeClose).toHaveBeenCalled();
  });

  it('should trigger onCancel and close the dialog if no onCancel hook is provided', () => {
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

  it('should return undefined before shared data is set', () => {
    expect(dialogApi.getData()).toBeUndefined();
  });

  it('should preserve null shared data', () => {
    const nullableDialogApi = new DialogApi<null | Record<string, unknown>>();
    nullableDialogApi.setData(null);
    expect(nullableDialogApi.getData()).toBeNull();
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
});
