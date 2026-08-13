import type { Component } from 'vue';

import type { AnyPromiseFunction } from '@taman/types';

export type ApiComponentOptionsItem = {
  [name: string]: any;
  children?: ApiComponentOptionsItem[];
  disabled?: boolean;
  label?: string;
  value?: number | string;
};

export type ApiComponentLabelFn = (item: ApiComponentOptionsItem) => string;

export interface ApiComponentProps {
  /** Component */
  component: Component;
  /** Whether to convert numeric values to strings */
  numberToString?: boolean;
  /** Function that fetches options data */
  api?: (arg?: any) => Promise<ApiComponentOptionsItem[] | Record<string, any>>;
  /** Parameters passed to the API */
  params?: Record<string, any>;
  /** Field name used to extract the options array from the API response */
  resultField?: string;
  /** Label field name */
  labelField?: string;
  /** Customize label from option data */
  labelFn?: ApiComponentLabelFn;
  /** Children field name; for components that need hierarchical data */
  childrenField?: string;
  /** Value field name */
  valueField?: string;
  /** Disabled field name */
  disabledField?: string;
  /** Prop name on the component that receives options data */
  optionsPropName?: string;
  /** Whether to call the API immediately */
  immediate?: boolean;
  /** Refetch data on every `visibleEvent` */
  alwaysLoad?: boolean;
  /** Callback before the API request */
  beforeFetch?: AnyPromiseFunction<any, any>;
  /** Callback to decide whether the API request is allowed */
  shouldFetch?: AnyPromiseFunction<any, boolean>;
  /** Callback after the API request */
  afterFetch?: AnyPromiseFunction<any, any>;
  /** Options passed directly; also used as fallback when the API returns empty data */
  options?: ApiComponentOptionsItem[];
  /** Slot name used to show a loading indicator */
  loadingSlot?: string;
  /** Event name that triggers the API request */
  visibleEvent?: string;
  /** v-model prop name; defaults to modelValue. Some components use value */
  modelPropName?: string;
  /**
   * Auto-select behavior
   * - `first`: select the first option
   * - `last`: select the last option
   * - `one`: when the API returns a single option, select it
   * - function: custom logic; receives the result array and returns the selected option
   * - false: do not auto-select (default)
   */
  autoSelect?:
    | 'first'
    | 'last'
    | 'one'
    | ((item: ApiComponentOptionsItem[]) => ApiComponentOptionsItem)
    | false;
}

export type ApiComponentSharedProps = Omit<ApiComponentProps, 'component'>;
