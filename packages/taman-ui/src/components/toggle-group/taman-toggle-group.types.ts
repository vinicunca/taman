import type { ToggleGroupItem, ToggleGroupProps } from 'pohon-ui';

export type TamanToggleGroupValue = boolean | number | string;

export type TamanToggleGroupModel
  = | Array<TamanToggleGroupValue>
    | TamanToggleGroupValue
    | undefined;

export interface TamanToggleGroupItem extends ToggleGroupItem {
  /**
   * A unique value for the item. Defaults to the index.
   */
  value?: TamanToggleGroupValue;
}

/**
 * Every `PToggleGroup` prop except the value ones: the selection is
 * `v-model`, and this component decides each change itself.
 */
export interface TamanToggleGroupProps
  extends Omit<ToggleGroupProps<TamanToggleGroupItem>, 'defaultValue' | 'modelValue'> {
  /** Allow clearing the selection in single mode by clicking the checked item */
  allowClear?: boolean;
  /**
   * Called before the value changes; resolve `false` to cancel.
   * `isChecked` is whether the clicked item is about to become checked.
   */
  beforeChange?: (
    value: TamanToggleGroupValue,
    isChecked: boolean,
  ) => boolean | PromiseLike<boolean | undefined> | undefined;
  /** Max selections in multiple mode; 0 means no limit */
  maxCount?: number;
  /**
   * Show a check icon on items that set no `leadingIcon` of their own.
   * @defaultValue true
   */
  showIcon?: boolean;
}
