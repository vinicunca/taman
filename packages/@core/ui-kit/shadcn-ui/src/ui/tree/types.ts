import type { Arrayable } from '@vueuse/core';
import type { FlattenedItem } from 'reka-ui';

import type { Recordable } from '@taman-core/typings';

export interface TreeProps {
  /** Allow clearing the current selection in single-select mode */
  allowClear?: boolean;
  /** When not in associated selection, auto-select parent nodes */
  autoCheckParent?: boolean;
  /** Show border */
  bordered?: boolean;
  /** Disable parent-child associated selection */
  checkStrictly?: boolean;
  /** Children field name */
  childrenField?: string;
  /** Keys expanded by default */
  defaultExpandedKeys?: Array<number | string>;
  /** Default expanded level (takes precedence over defaultExpandedKeys) */
  defaultExpandedLevel?: number;
  /** Default value */
  defaultValue?: Arrayable<number | string>;
  /** Disabled */
  disabled?: boolean;
  /** Disabled field name */
  disabledField?: string;
  /** Custom node class name */
  getNodeClass?: (item: FlattenedItem<Recordable<any>>) => string;
  iconField?: string;
  /** Label field name */
  labelField?: string;
  /** Multi-select */
  multiple?: boolean;
  /** Label when selecting all */
  selectAllLabel?: string;
  /** Show icon from iconField */
  showIcon?: boolean;
  /** Enable expand/collapse animation */
  transition?: boolean;
  /** Tree data */
  treeData: Recordable<any>[];
  /** Value field name */
  valueField?: string;
}

export function treePropsDefaults() {
  return {
    allowClear: false,
    autoCheckParent: true,
    bordered: false,
    checkStrictly: false,
    defaultExpandedKeys: () => [],
    defaultExpandedLevel: 0,
    disabled: false,
    disabledField: 'disabled',
    iconField: 'icon',
    labelField: 'label',
    multiple: false,
    showIcon: true,
    transition: true,
    valueField: 'value',
    childrenField: 'children',
  };
}
