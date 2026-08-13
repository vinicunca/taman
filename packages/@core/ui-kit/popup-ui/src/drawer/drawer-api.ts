import type { DrawerApiOptions, DrawerState } from './drawer';

import { Store } from '@taman-core/shared/store';
import { bindMethods, isFunction } from '@taman-core/shared/utils';

export class DrawerApi {
  // Shared data
  public sharedData: Record<'payload', any> = {
    payload: {},
  };
  public store: Store<DrawerState>;

  private api: Pick<
    DrawerApiOptions,
    | 'onBeforeClose'
    | 'onCancel'
    | 'onClosed'
    | 'onConfirm'
    | 'onOpenChange'
    | 'onOpened'
  >;

  // private prevState!: DrawerState;
  private state!: DrawerState;

  constructor(options: DrawerApiOptions = {}) {
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

    const defaultState: DrawerState = {
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

    this.store = new Store<DrawerState>({
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
   * @description Calls onBeforeClose before closing; if onBeforeClose returns false, the drawer stays open
   */
  async close() {
    // Use onBeforeClose to decide whether closing is allowed
    // If onBeforeClose returns false, do not close the drawer
    const allowClose = (await this.api.onBeforeClose?.()) ?? true;
    if (allowClose) {
      this.store.setState((prev) => ({
        ...prev,
        isOpen: false,
        submitting: false,
      }));
    }
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

  open() {
    this.store.setState((prev) => ({ ...prev, isOpen: true }));
  }

  setData<T>(payload: T) {
    this.sharedData.payload = payload;
    return this;
  }

  setState(
    stateOrFn:
      | ((prev: DrawerState) => Partial<DrawerState>)
      | Partial<DrawerState>,
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
