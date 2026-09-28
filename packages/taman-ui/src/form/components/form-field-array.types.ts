import type { FormCommonConfig, FormFieldSchema } from '../form.types';

export interface TamanFormFieldArrayProps {
  /** Action list header text */
  actionText?: string;
  /** "Add" button text */
  addButtonText?: string;
  /** Sub-field common configuration */
  commonConfig?: FormCommonConfig;
  /**
   * Default data generated when a new row is added; if not specified, generate an empty object according to the fieldName of the schema
   */
  createRow?: () => Record<string, any>;
  disabled?: boolean;
  /** Empty data text */
  emptyText?: string;
  /** Sub-field global common configuration */
  globalCommonConfig?: FormCommonConfig;
  /** Maximum number of rows */
  max?: number;
  /** Minimum number of rows */
  min?: number;
  /** Field path, passed through componentField by the outer FormField */
  name?: string;
  /**
   * Column definition, each column is a sub-field (reuse FormFieldSchema)
   */
  schema?: Array<FormFieldSchema>;
  /** Whether to display the index column */
  showIndex?: boolean;
}
