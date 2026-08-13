import type { DialogApiOptions, DialogState } from './dialog.types';

import { Store } from '@taman-core/shared/store';
import { bindMethods, isFunction } from '@taman-core/shared/utils';

export class DialogApi {
  // Shared data
  public sharedData: Record<'payload', any> = {
    payload: {},
  };

  public store: Store<DialogState>;

  private api: Pick<
    DialogApiOptions,
    | 'onBeforeClose'
    | 'onCancel'
    | 'onClosed'
    | 'onConfirm'
    | 'onOpenChange'
    | 'onOpened'
  >;

  // private prevState!: ModalState;
  private state!: DialogState;

  private openPromise: Promise<unknown> | undefined;

  private openResolver: ((value: unknown) => void) | undefined;

  constructor(options: DialogApiOptions = {}) {
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

    const defaultState: DialogState = {
      bordered: true,
      centered: false,
      class: '',
      closeOnClickModal: true,
      closeOnPressEscape: true,
      confirmDisabled: false,
      confirmLoading: false,
      contentClass: '',
      destroyOnClose: true,
      draggable: false,
      overflow: false,
      footer: true,
      footerClass: '',
      fullscreen: false,
      fullscreenButton: true,
      header: true,
      headerClass: '',
      isOpen: false,
      loading: false,
      modal: true,
      openAutoFocus: false,
      showCancelButton: true,
      showConfirmButton: true,
      title: '',
      animationType: 'slide',
    };

    this.store = new Store<DialogState>({
      ...defaultState,
      ...storeState,
    });

    this.store.subscribe((state) => {
      // Every time the state is updated, the onOpenChange callback function is called
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
   * Close dialog
   * @description When closing the dialog, the onBeforeClose hook function is called. If onBeforeClose returns false, the dialog will not be closed. Otherwise, the pending open() promise resolves with `result`.
   */
  async close(result?: unknown) {
    const allowClose = (await this.api.onBeforeClose?.()) ?? true;
    if (!allowClose) {
      return;
    }
    this.store.setState((prev) => ({
      ...prev,
      isOpen: false,
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
   * Lock dialog state (used for waiting state during submission)
   * @description The locked state will disable the default cancel button, use spinner to cover the dialog content, hide the close button, prevent manual closing of the dialog, and mark the default submit button as loading state
   * @param isLocked Whether to lock
   */
  lock(isLocked = true) {
    return this.setState({ submitting: isLocked });
  }

  /**
   * Cancel operation
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
   * Confirm operation
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
   * Open dialog
   * @description Returns a promise that resolves with the value passed to close(result), or undefined when the dialog is dismissed. Repeated calls while open return the same pending promise.
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
      submitting: false,
    }));
    return this.openPromise as Promise<T | undefined>;
  }

  setData<T>(payload: T) {
    this.sharedData.payload = payload;
    return this;
  }

  setState(
    stateOrFn:
      | ((prev: DialogState) => Partial<DialogState>)
      | Partial<DialogState>,
  ) {
    if (isFunction(stateOrFn)) {
      this.store.setState(stateOrFn);
    } else {
      this.store.setState((prev) => ({ ...prev, ...stateOrFn }));
    }
    return this;
  }

  /**
   * Unlock dialog state
   * @description Unlock the state set by the lock method, which is an alias for lock(false)
   */
  unlock() {
    return this.lock(false);
  }
}
