import type { DrawerApiOptions, DrawerState } from './drawer.types';

import { Store } from '@taman-core/shared/store';
import { bindMethods, isFunction } from '@taman-core/shared/utils';

export class DrawerApi<TData = unknown> {
  // Shared data
  public sharedData: Record<'payload', TData | undefined> = {
    payload: undefined,
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
   * Close drawer
   * @description When closing the drawer, the onBeforeClose hook function is called, and if onBeforeClose returns false, the drawer will not be closed
   */
  async close() {
    const allowClose = (await this.api.onBeforeClose?.()) ?? true;
    if (allowClose) {
      this.store.setState((prev) => ({
        ...prev,
        isOpen: false,
        submitting: false,
      }));
    }
  }

  getData(): TData | undefined {
    return this.sharedData.payload;
  }

  /**
   * Lock drawer state (used for waiting state during submission)
   * @description The locked state will disable the default cancel button, use spinner to cover the drawer content, hide the close button, prevent manual closing of the drawer, and mark the default submit button as loading state
   */
  lock(isLocked: boolean = true) {
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
   * Callback after the drawer close animation is complete
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
   * Callback after the drawer open animation is complete
   */
  onOpened() {
    if (this.state.isOpen) {
      this.api.onOpened?.();
    }
  }

  open() {
    this.store.setState((prev) => ({ ...prev, isOpen: true }));
  }

  setData(payload: TData) {
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
   * Unlock the drawer state
   * @description Unlock the state set by the lock method, is an alias for lock(false)
   */
  unlock() {
    return this.lock(false);
  }
}
