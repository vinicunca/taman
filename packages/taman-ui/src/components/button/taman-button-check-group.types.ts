import type { FieldGroupProps } from 'pohon-ui';
import type { Component } from 'vue';

export type TamanButtonCheckGroupValue = boolean | number | string;

export type TamanButtonCheckGroupModel
  = | Array<TamanButtonCheckGroupValue>
    | TamanButtonCheckGroupValue
    | undefined;

export interface TamanButtonCheckGroupOption {
  [key: string]: any;
  label: (() => Component | string) | string;
  value: TamanButtonCheckGroupValue;
}

export interface TamanButtonCheckGroupProps {
  /** Allow clearing the selection in single mode by clicking the checked option */
  allowClear?: boolean;
  /**
   * Called before the value changes; resolve `false` to cancel.
   * `isChecked` is whether the clicked option is about to become checked.
   */
  beforeChange?: (
    value: TamanButtonCheckGroupValue,
    isChecked: boolean,
  ) => boolean | PromiseLike<boolean | undefined> | undefined;
  disabled?: boolean;
  /** Max selections in multiple mode; 0 means no limit */
  maxCount?: number;
  multiple?: boolean;
  options?: Array<TamanButtonCheckGroupOption>;
  showIcon?: boolean;
  size?: FieldGroupProps['size'];
}
