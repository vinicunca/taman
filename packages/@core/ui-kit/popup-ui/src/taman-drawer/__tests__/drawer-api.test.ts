import type { TamanDrawerState } from '../drawer.types';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { TamanDrawerApi } from '../drawer.api';

vi.mock('@taman-core/shared/store', () => {
  return {
    isFunction: (fn: any) => typeof fn === 'function',
    Store: class {
      get state() {
        return this._state;
      }

      private _state: TamanDrawerState;
      private subscribers: Array<(state: TamanDrawerState) => void> = [];

      constructor(initialState: TamanDrawerState) {
        this._state = initialState;
      }

      setState(fn: (prev: TamanDrawerState) => TamanDrawerState) {
        this._state = fn(this._state);
        this.subscribers.forEach((sub) => {
          sub(this._state);
        });
      }

      subscribe(fn: (state: TamanDrawerState) => void) {
        this.subscribers.push(fn);
        return { unsubscribe: () => {} };
      }
    },
  };
});

describe('tamanDrawerApi', () => {
  let drawerApi: TamanDrawerApi;
  let drawerState: TamanDrawerState;

  beforeEach(() => {
    drawerApi = new TamanDrawerApi();
    drawerState = drawerApi.store.state;
  });

  it('should initialize with default state', () => {
    expect(drawerState.isOpen).toBe(false);
    expect(drawerState.cancelText).toBeUndefined();
    expect(drawerState.confirmText).toBeUndefined();
  });

  it('should open the drawer', () => {
    drawerApi.open();
    expect(drawerApi.store.state.isOpen).toBe(true);
  });

  it('should close the drawer if onBeforeClose allows it', () => {
    drawerApi.close();
    expect(drawerApi.store.state.isOpen).toBe(false);
  });

  it('should not close the drawer if onBeforeClose returns false', () => {
    const onBeforeClose = vi.fn(() => false);
    const drawerApiWithHook = new TamanDrawerApi({ onBeforeClose });
    drawerApiWithHook.open();
    drawerApiWithHook.close();
    expect(drawerApiWithHook.store.state.isOpen).toBe(true);
    expect(onBeforeClose).toHaveBeenCalled();
  });

  it('should trigger onCancel and keep drawer open if onCancel is provided', () => {
    const onCancel = vi.fn();
    const drawerApiWithHook = new TamanDrawerApi({ onCancel });
    drawerApiWithHook.open();
    drawerApiWithHook.onCancel();
    expect(onCancel).toHaveBeenCalled();
    expect(drawerApiWithHook.store.state.isOpen).toBe(true);
  });

  it('should update shared data correctly', () => {
    const testData = { key: 'value' };
    drawerApi.setData(testData);
    expect(drawerApi.getData()).toEqual(testData);
  });

  it('should set state correctly using an object', () => {
    drawerApi.setState({ title: 'New Title' });
    expect(drawerApi.store.state.title).toBe('New Title');
  });

  it('should set state correctly using a function', () => {
    drawerApi.setState((prev) => ({ ...prev, confirmText: 'Yes' }));
    expect(drawerApi.store.state.confirmText).toBe('Yes');
  });

  it('should call onOpenChange when state changes', () => {
    const onOpenChange = vi.fn();
    const drawerApiWithHook = new TamanDrawerApi({ onOpenChange });
    drawerApiWithHook.open();
    expect(onOpenChange).toHaveBeenCalledWith(true);
  });

  it('should call onClosed callback when provided', () => {
    const onClosed = vi.fn();
    const drawerApiWithHook = new TamanDrawerApi({ onClosed });
    drawerApiWithHook.onClosed();
    expect(onClosed).toHaveBeenCalled();
  });

  it('should call onOpened callback when provided', () => {
    const onOpened = vi.fn();
    const drawerApiWithHook = new TamanDrawerApi({ onOpened });
    drawerApiWithHook.open();
    drawerApiWithHook.onOpened();
    expect(onOpened).toHaveBeenCalled();
  });

  it('resolves the open promise with the value passed to close', async () => {
    const promise = drawerApi.open();
    await drawerApi.close({ saved: true });
    await expect(promise).resolves.toEqual({ saved: true });
  });

  it('resolves the open promise with undefined on a plain dismissal', async () => {
    const promise = drawerApi.open();
    await drawerApi.close();
    await expect(promise).resolves.toBeUndefined();
  });

  it('keeps the open promise pending when onBeforeClose vetoes', async () => {
    const apiWithVeto = new TamanDrawerApi({ onBeforeClose: () => false });
    const resolved = vi.fn();
    const promise = apiWithVeto.open();
    void promise.then(resolved);
    await apiWithVeto.close('nope');
    await Promise.resolve();
    expect(apiWithVeto.store.state.isOpen).toBe(true);
    expect(resolved).not.toHaveBeenCalled();
  });

  it('returns the same pending promise for repeated open calls', () => {
    const first = drawerApi.open();
    const second = drawerApi.open();
    expect(second).toBe(first);
  });

  it('creates a fresh promise after a completed close', async () => {
    const first = drawerApi.open();
    await drawerApi.close();
    const second = drawerApi.open();
    expect(second).not.toBe(first);
  });
});
