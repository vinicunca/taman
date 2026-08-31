import type { AnyPromiseFunction } from '@taman/types';
import type { Component } from 'vue';

export interface AppFetchComponentOptionsItem {
  children?: Array<AppFetchComponentOptionsItem>;
  disabled?: boolean;
  label?: string;
  value?: number | string;
  [name: string]: any;
}

export type ApiComponentLabelFn = (item: AppFetchComponentOptionsItem) => string;

export interface AppFetchComponentProps {
  /** Component */
  component: Component;
  /** Whether to convert the value from a number to a string. */
  numberToString?: boolean;
  /** Function to retrieve options data */
  api?: (arg?: any) => Promise<Array<AppFetchComponentOptionsItem> | Record<string, any>>;
  /** Parameters passed to the API */
  params?: Record<string, any>;
  /** The field name in the API response that contains the options array. */
  resultField?: string;
  /** The field name in the options that contains the label. */
  labelField?: string;
  /** A function to customize the label from the option data. */
  labelFn?: ApiComponentLabelFn;
  /** The field name in the options that contains the children. */
  childrenField?: string;
  /** The field name in the options that contains the value. */
  valueField?: string;
  /** The field name in the options that contains the disabled state. */
  disabledField?: string;
  /** The property name on the component that receives the options data. */
  optionsPropName?: string;
  /** Whether to immediately call the API. */
  immediate?: boolean;
  /** Whether to re-request data on every `visibleEvent`. */
  alwaysLoad?: boolean;
  /** A callback function that is called before the API request. */
  beforeFetch?: AnyPromiseFunction<any, any>;
  /** A callback function that is called before the API request to determine if the request is allowed. */
  shouldFetch?: AnyPromiseFunction<any, boolean>;
  /** A callback function that is called after the API request. */
  afterFetch?: AnyPromiseFunction<any, any>;
  /** Directly pass in options data, also used as fallback when the API returns empty data. */
  options?: Array<AppFetchComponentOptionsItem>;
  /** The slot name to display a loading indicator. */
  loadingSlot?: string;
  /** The event name that triggers the API request. */
  visibleEvent?: string;
  /** The v-model property name, defaults to modelValue. Some components may use value. */
  modelPropName?: string;
  /**
   * Auto-select behavior
   * - `first`: automatically select the first option
   * - `last`: automatically select the last option
   * - `one`: automatically select the option when the request result has only one option
   * - function: custom selection logic; the parameter is the result array of the request, and the return value is the selected option
   * - false: do not automatically select (default)
   */
  autoSelect?:
    | 'first'
    | 'last'
    | 'one'
    | ((item: Array<AppFetchComponentOptionsItem>) => AppFetchComponentOptionsItem)
    | false;
}

export type AppFetchComponentSharedProps = Omit<AppFetchComponentProps, 'component'>;
