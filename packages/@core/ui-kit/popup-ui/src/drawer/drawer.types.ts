import type { MaybePromise } from '@taman-core/typings';
import type { Component, HTMLAttributes, Ref } from 'vue';

import type { DrawerApi } from './drawer.api';

export type DrawerPlacement = 'bottom' | 'left' | 'right' | 'top';

export type CloseIconPlacement = 'left' | 'right';

export interface DrawerProps {
  /**
   * Whether to mount to the content area
   * @default false
   */
  appendToMain?: boolean;
  /**
   * Cancel button text
   */
  cancelText?: string;
  class?: HTMLAttributes['class'];
  /**
   * Whether to show the close button
   * @default true
   */
  closable?: boolean;
  /**
   * The position of the close button
   */
  closeIconPlacement?: CloseIconPlacement;
  /**
   * Whether to close the drawer when clicking the modal mask
   * @default true
   */
  closeOnClickModal?: boolean;
  /**
   * Whether to close the drawer when pressing the ESC key
   * @default true
   */
  closeOnPressEscape?: boolean;
  /**
   * Confirm button loading
   * @default false
   */
  confirmLoading?: boolean;
  /**
   * Confirm button text
   */
  confirmText?: string;
  contentClass?: string;
  /**
   * Drawer description
   */
  description?: string;
  /**
   * Whether to destroy the drawer when it is closed
   */
  destroyOnClose?: boolean;
  /**
   * Whether to show the footer
   * @default true
   */
  footer?: boolean;
  /**
   * Drawer footer style
   */
  footerClass?: HTMLAttributes['class'];
  /**
   * Whether to show the header
   * @default true
   */
  header?: boolean;
  /**
   * Drawer header style
   */
  headerClass?: HTMLAttributes['class'];
  /**
   * Drawer loading state
   * @default false
   */
  loading?: boolean;
  /**
   * Whether to show the modal mask
   * @default true
   */
  modal?: boolean;

  /**
   * Whether to auto focus
   */
  openAutoFocus?: boolean;
  /**
   * Modal mask blur effect
   */
  overlayBlur?: number;
  /**
   * Drawer position
   * @default right
   */
  placement?: DrawerPlacement;

  /**
   * Whether to show the cancel button
   * @default true
   */
  showCancelButton?: boolean;
  /**
   * Whether to show the confirm button
   * @default true
   */
  showConfirmButton?: boolean;
  /**
   * Submitting (locking drawer state)
   */
  submitting?: boolean;
  /**
   * Drawer title
   */
  title?: string;
  /**
   * Drawer title tooltip
   */
  titleTooltip?: string;
  /**
   * Drawer z-index
   */
  zIndex?: number;
}

export interface DrawerState extends DrawerProps {
  /** Drawer open state */
  isOpen?: boolean;
}

export type ExtendedDrawerApi<TData = unknown> = DrawerApi<TData> & {
  useStore: <T = NoInfer<DrawerState>>(
    selector?: (state: NoInfer<DrawerState>) => T,
  ) => Readonly<Ref<T>>;
};

type DrawerComponentInstance<TComponent extends Component>
  = TComponent extends abstract new (...args: Array<any>) => infer TInstance
    ? TInstance
    : never;

export type InferDrawerData<TComponent extends Component> = [
  DrawerComponentInstance<TComponent>,
] extends [never]
  ? unknown
  : DrawerComponentInstance<TComponent> extends {
    drawerApi: ExtendedDrawerApi<infer TData>;
  }
    ? TData
    : unknown;

export interface DrawerApiOptions<
  TConnectedComponent extends Component = Component,
> extends DrawerState {
  /**
   * Independent drawer component
   */
  connectedComponent?: TConnectedComponent;
  /**
   * Callback before closing, returning false can prevent closing
   * @returns
   */
  onBeforeClose?: () => MaybePromise<boolean | undefined>;
  /**
   * Callback when the cancel button is clicked
   */
  onCancel?: () => void;
  /**
   * Callback after the drawer close animation is complete
   * @returns
   */
  onClosed?: () => void;
  /**
   * Callback when the confirm button is clicked
   */
  onConfirm?: () => void;
  /**
   * Callback when the drawer state changes
   * @param isOpen
   * @returns
   */
  onOpenChange?: (isOpen: boolean) => void;
  /**
   * Callback after the drawer open animation is complete
   * @returns
   */
  onOpened?: () => void;
}
