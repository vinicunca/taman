import type { VNode } from 'vue';

export interface IconPickerProps {
  pageSize?: number;
  /** Icon collection prefix */
  prefix?: string;
  /** Auto-fetch icon set from API when prefix is set */
  autoFetchApi?: boolean;
  /**
   * Icon list
   */
  icons?: string[];
  /** Input component */
  inputComponent?: VNode;
  /** Slot name where the preview icon is rendered */
  iconSlot?: string;
  /** v-model prop name on the input component */
  modelValueProp?: string;
  /** Icon class */
  iconClass?: string;
  type?: 'icon' | 'input';
}
