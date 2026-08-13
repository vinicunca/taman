import type { ClassType, MaybePromise } from '@taman-core/typings';
import type { Component, Ref } from 'vue';

import type { DrawerApi } from './drawer-api';

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
  class?: ClassType;
  /**
   * Whether to show the close button
   * @default true
   */
  closable?: boolean;
  /**
   * Close button placement
   */
  closeIconPlacement?: CloseIconPlacement;
  /**
   * Whether clicking the overlay closes the drawer
   * @default true
   */
  closeOnClickModal?: boolean;
  /**
   * Whether pressing ESC closes the drawer
   * @default true
   */
  closeOnPressEscape?: boolean;
  /**
   * Confirm button loading state
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
   * Destroy drawer on close
   */
  destroyOnClose?: boolean;
  /**
   * Whether to show the footer
   * @default true
   */
  footer?: boolean;
  /**
   * Footer class/styles
   */
  footerClass?: ClassType;
  /**
   * Whether to show the header
   * @default true
   */
  header?: boolean;
  /**
   * Header class/styles
   */
  headerClass?: ClassType;
  /**
   * Drawer loading state
   * @default false
   */
  loading?: boolean;
  /**
   * Whether to show the overlay
   * @default true
   */
  modal?: boolean;

  /**
   * Whether to auto-focus on open
   */
  openAutoFocus?: boolean;
  /**
   * Overlay blur effect
   */
  overlayBlur?: number;
  /**
   * Drawer placement
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
   * Submitting (locks drawer state)
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
  /**
   * Shared data
   */
  sharedData?: Record<string, any>;
}

export type ExtendedDrawerApi = DrawerApi & {
  useStore: <T = NoInfer<DrawerState>>(
    selector?: (state: NoInfer<DrawerState>) => T,
  ) => Readonly<Ref<T>>;
};

export interface DrawerApiOptions extends DrawerState {
  /**
   * Standalone drawer component
   */
  connectedComponent?: Component;
  /**
   * Callback before close; return false to prevent closing
   * @returns
   */
  onBeforeClose?: () => MaybePromise<boolean | undefined>;
  /**
   * Callback when cancel button is clicked
   */
  onCancel?: () => void;
  /**
   * Callback after close animation completes
   * @returns
   */
  onClosed?: () => void;
  /**
   * Callback when confirm button is clicked
   */
  onConfirm?: () => void;
  /**
   * Callback when open state changes
   * @param isOpen
   * @returns
   */
  onOpenChange?: (isOpen: boolean) => void;
  /**
   * Callback after open animation completes
   * @returns
   */
  onOpened?: () => void;
}
