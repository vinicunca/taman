import type { ClassType, MaybePromise } from '@taman-core/typings';
import type { Component, Ref } from 'vue';

import type { DialogApi } from './dialog.api';

export interface DialogProps {
  /**
   * Animation type
   * @default 'slide'
   */
  animationType?: 'scale' | 'slide';
  /**
   * Whether to mount to the content area
   * @default false
   */
  appendToMain?: boolean;
  /**
   * Whether to show a border
   * @default false
   */
  bordered?: boolean;
  /**
   * Cancel button text
   */
  cancelText?: string;
  /**
   * Whether to center the modal
   * @default false
   */
  centered?: boolean;

  class?: ClassType;

  /**
   * Whether to show the close button in the top-right corner
   * @default true
   */
  closable?: boolean;
  /**
   * Whether clicking the overlay closes the modal
   * @default true
   */
  closeOnClickModal?: boolean;
  /**
   * Whether pressing ESC closes the modal
   * @default true
   */
  closeOnPressEscape?: boolean;
  /**
   * Disable the confirm button
   */
  confirmDisabled?: boolean;
  /**
   * Confirm button loading state
   * @default false
   */
  confirmLoading?: boolean;
  /**
   * Confirm button text
   */
  confirmText?: string;
  contentClass?: ClassType;
  /**
   * Modal description
   */
  description?: string;
  /**
   * Destroy modal on close
   */
  destroyOnClose?: boolean;
  /**
   * Whether the modal is draggable
   * @default false
   */
  draggable?: boolean;
  /**
   * Whether to show the footer
   * @default true
   */
  footer?: boolean;
  footerClass?: ClassType;
  /**
   * Whether the modal is fullscreen
   * @default false
   */
  fullscreen?: boolean;
  /**
   * Whether to show the fullscreen button
   * @default true
   */
  fullscreenButton?: boolean;
  /**
   * Whether to show the header
   * @default true
   */
  header?: boolean;
  headerClass?: ClassType;
  /**
   * Modal loading state
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
   * Whether dragging can exceed the viewport
   * @default false
   */
  overflow?: boolean;
  /**
   * Overlay blur effect
   */
  overlayBlur?: number;
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
   * Submitting (locks modal state)
   */
  submitting?: boolean;
  /**
   * Modal title
   */
  title?: string;
  /**
   * Modal title tooltip
   */
  titleTooltip?: string;
  /**
   * Modal z-index
   */
  zIndex?: number;
}

export interface DialogState extends DialogProps {
  /** Modal open state */
  isOpen?: boolean;
  /**
   * Shared data
   */
  sharedData?: Record<string, any>;
}

export type ExtendedDialogApi = DialogApi & {
  useStore: <T = NoInfer<DialogState>>(
    selector?: (state: NoInfer<DialogState>) => T,
  ) => Readonly<Ref<T>>;
};

export interface DialogApiOptions extends DialogState {
  /**
   * Standalone modal component
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
