import type { TamanDrawerApiOptions, TamanDrawerState } from './drawer.types';

import { Store } from '@taman-core/shared/store';
import { bindMethods, isFunction } from '@taman-core/shared/utils';

export class TamanDrawerApi {
  // Shared data
  public sharedData: Record<'payload', any> = {
    payload: {},
  };

  public store: Store<TamanDrawerState>;

  private api: Pick<
    TamanDrawerApiOptions,
    | 'onBeforeClose'
    | 'onCancel'
    | 'onClosed'
    | 'onConfirm'
    | 'onOpenChange'
    | 'onOpened'
  >;

  private openPromise: Promise<unknown> | undefined;

  private openResolver: ((value: unknown) => void) | undefined;

  private state!: TamanDrawerState;

  constructor(options: TamanDrawerApiOptions = {}) {
    const {
      connectedComponent: _,
      onBeforeClose,
      onCancel,
      onClosed,
      onConfirm,
      onOpenChange,
      onOpened,
      ...storeState
    } = options;

    const defaultState: TamanDrawerState = {
      class: '',
      closable: true,
      closeIconPlacement: 'right',
      closeOnClickModal: true,
      closeOnPressEscape: true,
      confirmLoading: false,
      contentClass: '',
      footer: true,
      header: true,
      isOpen: false,
      loading: false,
      modal: true,
      openAutoFocus: false,
      placement: 'right',
      showCancelButton: true,
      showConfirmButton: true,
      submitting: false,
      title: '',
    };

    this.store = new Store<TamanDrawerState>({
      ...defaultState,
      ...storeState,
    });

    this.store.subscribe((state) => {
      const prevIsOpen = this.state?.isOpen;
      this.state = state;
      if (state?.isOpen !== prevIsOpen) {
        this.api.onOpenChange?.(!!state?.isOpen);
      }
    });

    this.state = this.store.state;

    this.api = {
      onBeforeClose,
      onCancel,
      onClosed,
      onConfirm,
      onOpenChange,
      onOpened,
    };
    bindMethods(this);
  }

  /**
   * Close the drawer
   * @description Calls onBeforeClose before closing; if onBeforeClose returns false, the drawer stays open. Otherwise resolves the pending open() promise with `result`.
   */
  async close(result?: unknown) {
    const allowClose = (await this.api.onBeforeClose?.()) ?? true;
    if (!allowClose) {
      return;
    }
    this.store.setState((prev) => ({
      ...prev,
      isOpen: false,
      submitting: false,
    }));
    const resolve = this.openResolver;
    this.openPromise = undefined;
    this.openResolver = undefined;
    resolve?.(result);
  }

  getData<T extends object = Record<string, any>>() {
    return (this.sharedData?.payload ?? {}) as T;
  }

  /**
   * Lock drawer state (for waiting during submission)
   * @description Disables the default cancel button, covers drawer content with a spinner, hides the close button, prevents manual close, and marks the default confirm button as loading
   * @param isLocked Whether to lock
   */
  lock(isLocked: boolean = true) {
    return this.setState({ submitting: isLocked });
  }

  /**
   * Cancel action
   */
  onCancel() {
    if (this.api.onCancel) {
      this.api.onCancel?.();
    } else {
      this.close();
    }
  }

  /**
   * Callback after close animation completes
   */
  onClosed() {
    if (!this.state.isOpen) {
      this.api.onClosed?.();
    }
  }

  /**
   * Confirm action
   */
  onConfirm() {
    this.api.onConfirm?.();
  }

  /**
   * Callback after open animation completes
   */
  onOpened() {
    if (this.state.isOpen) {
      this.api.onOpened?.();
    }
  }

  /**
   * Open drawer
   * @description Returns a promise that resolves with the value passed to close(result), or undefined when the drawer is dismissed. Repeated calls while open return the same pending promise.
   */
  open<T = unknown>(): Promise<T | undefined> {
    if (!this.openPromise) {
      this.openPromise = new Promise<unknown>((resolve) => {
        this.openResolver = resolve;
      });
    }
    this.store.setState((prev) => ({
      ...prev,
      isOpen: true,
    }));
    return this.openPromise as Promise<T | undefined>;
  }

  setData<T>(payload: T) {
    this.sharedData.payload = payload;
    return this;
  }

  setState(
    stateOrFn:
      | ((prev: TamanDrawerState) => Partial<TamanDrawerState>)
      | Partial<TamanDrawerState>,
  ) {
    if (isFunction(stateOrFn)) {
      this.store.setState(stateOrFn);
    } else {
      this.store.setState((prev) => ({ ...prev, ...stateOrFn }));
    }
    return this;
  }

  /**
   * Unlock the drawer
   * @description Clears the lock set by lock(); alias for lock(false)
   */
  unlock() {
    return this.lock(false);
  }
}
