import type { Recordable } from '@taman-core/typings';
import type { Component, VNode, VNodeArrayChildren } from 'vue';

import { createContext } from '@taman-core/taman-ui';

export type IconType = 'error' | 'info' | 'question' | 'success' | 'warning';

export interface AlertBeforeCloseScope {
  isConfirm: boolean;
}

export interface AlertProps {
  /** Callback before close; return false to abort closing */
  beforeClose?: (
    scope: AlertBeforeCloseScope,
  ) => boolean | Promise<boolean | undefined> | undefined;
  /** Whether to show a border */
  bordered?: boolean;
  /**
   * Button alignment
   * @default 'end'
   */
  buttonAlign?: 'center' | 'end' | 'start';
  /** Cancel button text */
  cancelText?: string;
  /** Whether to center the alert */
  centered?: boolean;
  /** Confirm button text */
  confirmText?: string;
  /** Extra styles for the alert container */
  containerClass?: string;
  /** Alert content */
  content?: Component | string;
  /** Extra styles for the alert content */
  contentClass?: string;
  /** Show a loading overlay on the content while beforeClose runs */
  contentMasking?: boolean;
  /** Whether pressing Esc closes the alert */
  escapeKeyClose?: boolean;
  /** Footer content (in the same container as the buttons) */
  footer?: Component | string;
  /** Alert icon (shown before the title) */
  icon?: Component | IconType;
  /**
   * Overlay blur effect
   */
  overlayBlur?: number;
  /** Whether to show the cancel button */
  showCancel?: boolean;
  /** Alert title */
  title?: string;
}

/** Prompt props */
export type AlertPromptProps<T = any> = {
  /** Callback before close; return false to abort closing */
  beforeClose?: (scope: {
    isConfirm: boolean;
    value: T | undefined;
  }) => boolean | Promise<boolean | undefined> | undefined;
  /** Component used to accept user input */
  component?: Component;
  /** Props for the input component */
  componentProps?: Recordable<any>;
  /** Slots for the input component */
  componentSlots?:
    | (() => any)
    | Recordable<unknown>
    | VNode
    | VNodeArrayChildren;
  /** Default value */
  defaultValue?: T;
  /** Value prop name for the input component */
  modelPropName?: string;
} & Omit<AlertProps, 'beforeClose'>;

/**
 * Alert context
 */
export interface AlertContext {
  /** Trigger cancel */
  doCancel: () => void;
  /** Trigger confirm */
  doConfirm: () => void;
}

export const [
  injectAlertContext,
  provideAlertContext,
] = createContext<AlertContext>('TamanAlertContext');

export function useAlertContext() {
  const context = injectAlertContext();

  if (!context) {
    throw new Error('useAlertContext must be used within an AlertProvider');
  }

  return context;
}
