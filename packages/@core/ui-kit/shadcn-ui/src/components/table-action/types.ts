import type { ButtonVariants } from '../../ui';

import { VbenIcon } from '../icon';

/** Permission code(s); checked via injected hasPermission */
export type TableActionAuth = string | string[];

/** Action button tooltip */
export interface TableActionTooltip {
  content: string;
  side?: 'bottom' | 'left' | 'right' | 'top';
}

/** Popconfirm configuration */
export interface TableActionPopConfirm {
  /** Cancel button label */
  cancelText?: string;
  /** Confirm callback; falls back to action.onClick when omitted */
  confirm?: () => void;
  /** Confirm button label */
  okText?: string;
  /** Prompt title */
  title?: string;
}

export interface ActionItem {
  /** Permission code(s); filtered via injected hasPermission */
  auth?: TableActionAuth;
  /** Custom class name */
  class?: any;
  /** Dangerous action (red text) */
  danger?: boolean;
  /** Whether disabled */
  disabled?: boolean;
  /** Icon component */
  icon?: typeof VbenIcon.icon;
  /** Visibility: boolean or function returning boolean */
  ifShow?: (() => boolean) | boolean;
  /** Unique id; click handler can use this to distinguish actions */
  key?: number | string;
  /** Loading state */
  loading?: boolean;
  /** Click handler */
  onClick?: () => void;
  /** Popconfirm */
  popConfirm?: TableActionPopConfirm;
  /** Size */
  size?: ButtonVariants['size'];
  /** Label text */
  text?: string;
  /** Tooltip: string or config object */
  tooltip?: string | TableActionTooltip;
  /** Button style variant */
  variant?: ButtonVariants['variant'];
}

export interface TableActionProps {
  /** Primary action buttons */
  actions?: ActionItem[];
  /** Alignment */
  align?: 'center' | 'end' | 'start';
  /** Custom class name */
  class?: any;
  /** Whether to show dividers between buttons */
  divider?: boolean;
  /** Actions in the "More" dropdown */
  dropdownActions?: ActionItem[];
  /**
   * Permission check; returns false to hide actions with matching auth.
   * Core component has no business deps; inject from consumer (e.g. useAccess().hasAccessByCodes).
   */
  hasPermission?: (auth?: TableActionAuth) => boolean;
  /** "More" button label (shown to the right of the icon when provided) */
  moreText?: string;
}
