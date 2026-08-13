import type { VbenButtonProps } from '@vben-core/shadcn-ui';
import type { ClassType, MaybeComputedRef } from '@taman-core/typings';
import type { FieldOptions, FormContext, GenericObject } from 'vee-validate';
import type { Component, HtmlHTMLAttributes, Ref } from 'vue';
import type { ZodTypeAny } from 'zod';

import type { FormApi } from './form-api';

export type FormLayout = 'horizontal' | 'inline' | 'vertical';

export type BaseFormComponentType
  = | 'DefaultButton'
    | 'PrimaryButton'
    | 'VbenCheckbox'
    | 'VbenInput'
    | 'VbenFormFieldArray'
    | 'VbenInputPassword'
    | 'VbenPinInput'
    | 'VbenSelect'
    | (Record<never, never> & string);

type Breakpoints = '2xl:' | '3xl:' | '' | 'lg:' | 'md:' | 'sm:' | 'xl:';

type GridCols = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13;

export type WrapperClassType
  = | `${Breakpoints}grid-cols-${GridCols}`
    | (Record<never, never> & string);

export type FormItemClassType
  = | `${Breakpoints}cols-end-${'auto' | GridCols}`
    | `${Breakpoints}cols-span-${'auto' | 'full' | GridCols}`
    | `${Breakpoints}cols-start-${'auto' | GridCols}`
    | (Record<never, never> & string)
    | WrapperClassType;

export type FormFieldOptions = Partial<
  FieldOptions & {
    validateOnBlur?: boolean;
    validateOnChange?: boolean;
    validateOnInput?: boolean;
    validateOnModelUpdate?: boolean;
  }
>;

export interface FormShape {
  /** Default value */
  default?: any;
  /** Field name */
  fieldName: string;
  /** Whether the field is required */
  required?: boolean;
  rules?: ZodTypeAny;
}

export type MaybeComponentPropKey
  = | 'options'
    | 'placeholder'
    | 'title'
    | keyof HtmlHTMLAttributes
    | (Record<never, never> & string);

export type MaybeComponentProps = { [K in MaybeComponentPropKey]?: any };

export type FormActions = FormContext<GenericObject>;

export type CustomRenderType = (() => Component | string) | string;

// Dynamic render parameters
export type CustomParamsRenderType
  = | ((
    value: Partial<Record<string, any>>,
    actions: FormActions,
  ) => Component | string)
  | string;

export type FormSchemaRuleType
  = | 'required'
    | 'selectRequired'
    | null
    | (Record<never, never> & string)
    | ZodTypeAny;

type FormItemDependenciesCondition<T = boolean | PromiseLike<boolean>> = (
  value: Partial<Record<string, any>>,
  actions: FormActions,
  controller: ExtendedFormApi, // Exposes extendApi access within dependencies
) => T;

type FormItemDependenciesConditionWithRules = (
  value: Partial<Record<string, any>>,
  actions: FormActions,
  controller: ExtendedFormApi, // Exposes extendApi access within dependencies
) => FormSchemaRuleType | PromiseLike<FormSchemaRuleType>;

type FormItemDependenciesConditionWithProps = (
  value: Partial<Record<string, any>>,
  actions: FormActions,
  controller: ExtendedFormApi, // Exposes extendApi access within dependencies
) => MaybeComponentProps | PromiseLike<MaybeComponentProps>;

export interface FormItemDependencies {
  /**
   * Component props
   * @returns Component props
   */
  componentProps?: FormItemDependenciesConditionWithProps;
  /**
   * Whether the field is disabled
   * @returns Whether the field is disabled
   */
  disabled?: boolean | FormItemDependenciesCondition;
  /**
   * Whether to render (removes DOM when false)
   * @returns Whether to render
   */
  if?: boolean | FormItemDependenciesCondition;
  /**
   * Whether the field is required
   * @returns Whether the field is required
   */
  required?: FormItemDependenciesCondition;
  /**
   * Field validation rules
   */
  rules?: FormItemDependenciesConditionWithRules;
  /**
   * Whether to hide via CSS
   * @returns Whether to hide
   */
  show?: boolean | FormItemDependenciesCondition;
  /**
   * Runs on any trigger
   */
  trigger?: FormItemDependenciesCondition<void>;
  /**
   * Fields that trigger dependency evaluation
   */
  triggerFields: Array<string>;
}

type ComponentProps
  = | ((
    value: Partial<Record<string, any>>,
    actions: FormActions,
  ) => MaybeComponentProps)
  | MaybeComponentProps;

export interface FormCommonConfig {
  /**
   * Whether the form section is collapsible
   * @default false
   */
  collapsible?: boolean;
  /**
   * Show a colon after the label
   */
  colon?: boolean;
  /**
   * Props applied to all form items
   */
  componentProps?: ComponentProps;
  /**
   * Control class for all form items
   */
  controlClass?: string;
  /**
   * Collapsed by default
   * @default false
   */
  defaultCollapsed?: boolean;
  /**
   * Disabled state for all form items
   * @default false
   */
  disabled?: boolean;
  /**
   * Disable change event listeners on all form items
   * @default true
   */
  disabledOnChangeListener?: boolean;
  /**
   * Disable input event listeners on all form items
   * @default true
   */
  disabledOnInputListener?: boolean;
  /**
   * Empty-state value for all form items; defaults to undefined (naive-ui uses null)
   */
  emptyStateValue?: null | undefined;
  /**
   * Form field props for all form items
   * @default {}
   */
  formFieldProps?: FormFieldOptions;
  /**
   * Grid layout class for all form items; supports function form
   * @default ""
   */
  formItemClass?: (() => string) | string;
  /**
   * Hide labels on all form items
   * @default false
   */
  hideLabel?: boolean;
  /**
   * Hide required markers
   * @default false
   */
  hideRequiredMark?: boolean;
  /**
   * Label class for all form items
   * @default ""
   */
  labelClass?: string;
  /**
   * Label width for all form items
   */
  labelWidth?: number;
  /**
   * Model prop name for all form items
   * @default "modelValue"
   */
  modelPropName?: string;
  /**
   * Wrapper class for all form items
   */
  wrapperClass?: string;
}

type RenderComponentContentType = (
  value: Partial<Record<string, any>>,
  api: FormActions,
) => Record<string, any>;

type MappedComponentProps<P>
  = | ((
    value: Partial<Record<string, any>>,
    actions: FormActions,
  ) => P & Record<string, any>)
  | (P & Record<string, any>);

/**
 * Formats the current field value in `getValues()` output.
 * - Return `undefined`: keep the field removed; often used with `setValue(key, nextValue)`
 *   to split one field into others, e.g. `startTime` / `endTime`
 * - Return any other value: restore/write the field to that value
 * - `setValue` callback signature: `(key, nextValue) => void`
 */
export type FormValueFormat = (
  value: any,
  setValue: (fieldName: string, value: any) => void,
  values: Record<string, any>,
) => any;

interface FormSchemaBody extends Omit<FormCommonConfig, 'componentProps'> {
  /** Default value */
  defaultValue?: any;
  /** Dependencies */
  dependencies?: FormItemDependencies;
  /** Description */
  description?: CustomRenderType;
  /** Field name */
  fieldName: string;
  /** Help text */
  help?: CustomParamsRenderType;
  /** Whether to hide the form item */
  hide?: boolean;
  /** Form item label */
  label?: CustomRenderType;
  // Custom inner component render
  renderComponentContent?: RenderComponentContentType;
  /** Field validation rules */
  rules?: FormSchemaRuleType;
  /** Suffix */
  suffix?: CustomRenderType;
  /**
   * Format the current field when reading form values.
   * - Non-`undefined` return value is written back to the current fieldName
   * - `undefined` allows writing to one or more target fields via setValue
   */
  valueFormat?: FormValueFormat;
}

type FormSchemaDiscriminated<
  T extends BaseFormComponentType,
  P extends Record<string, any>,
> = {
  [K in Extract<keyof P, T>]: {
    /** Component */
    component: K;
    /** Component props */
    componentProps?: MappedComponentProps<P[K]>;
  } & FormSchemaBody;
}[Extract<keyof P, T>];

type FormSchemaFallback<T extends BaseFormComponentType> = {
  /** Component */
  component: Component | T;
  /** Component props */
  componentProps?: ComponentProps;
} & FormSchemaBody;

export type FormSchema<
  T extends BaseFormComponentType = BaseFormComponentType,
  P extends Record<string, any> = Record<never, never>,
> = FormSchemaDiscriminated<T, P> | FormSchemaFallback<T>;

/**
 * Component props for array editor (VbenFormFieldArray)
 */
export interface VbenFormFieldArrayProps<
  T extends BaseFormComponentType = BaseFormComponentType,
  P extends Record<string, any> = Record<never, never>,
> {
  /** Action list header text */
  actionText?: string;
  /** "Add" button text */
  addButtonText?: string;
  /** Default data generated when adding a new row; if not provided, generate empty object based on the column definition */
  createRow?: () => Record<string, any>;
  disabled?: boolean;
  /** Empty data text */
  emptyText?: string;
  /** Maximum number of rows */
  max?: number;
  /** Minimum number of rows */
  min?: number;
  /** Column definition, each column is a sub-field (reuse FormSchema) */
  schema: Array<FormSchema<T, P>>;
  /** Whether to display the index column */
  showIndex?: boolean;
}

export type HandleSubmitFn = (
  values: Record<string, any>,
) => Promise<void> | void;

export type HandleResetFn = (
  values: Record<string, any>,
) => Promise<void> | void;

export type FieldMappingTime = Array<[
  string,
  [string, string],
  (
    | ((value: any, fieldName: string) => any)
    | [string, string]
    | null
    | string
  )?,
]>;

export type ArrayToStringFields = Array<
  | [Array<string>, string?] // Nested array format with optional separator
  | string // Single field using the default separator
  | Array<string>
>;

export interface FormFieldProps<
  T extends BaseFormComponentType = BaseFormComponentType,
> extends FormSchemaBody {
  /** Component */
  component: Component | T;
  /** Component props */
  componentProps?: ComponentProps;
}

export interface FormRenderProps<
  T extends BaseFormComponentType = BaseFormComponentType,
  P extends Record<string, any> = Record<never, never>,
> {
  /**
   * Array-to-string field mapping; default separator is ","
   */
  arrayToStringFields?: ArrayToStringFields;
  /**
   * Whether the form is collapsed; applies when showCollapseButton=true
   * true: collapsed, false: expanded
   */
  collapsed?: boolean;
  /**
   * Number of rows to keep when collapsed
   * @default 1
   */
  collapsedRows?: number;
  /**
   * Whether to fire resize events
   * @default false
   */
  collapseTriggerResize?: boolean;
  /**
   * Fallback config for all form items; used when a child has no value; child overrides this
   */
  commonConfig?: FormCommonConfig;
  /**
   * Compact mode (removes bottom space reserved for validation messages on each item)
   */
  compact?: boolean;
  /**
   * v-model event binding per component type
   */
  componentBindEventMap?: Partial<Record<BaseFormComponentType, string>>;
  /**
   * Component registry
   */
  componentMap: Record<BaseFormComponentType, Component>;
  /**
   * Map form fields to time range values
   */
  fieldMappingTime?: FieldMappingTime;
  /**
   * Form instance
   */
  form?: FormContext<GenericObject>;
  /**
   * Form item layout
   */
  layout?: FormLayout;
  /**
   * Form schema definition
   */
  schema?: Array<FormSchema<T, P>>;

  /**
   * Show expand/collapse control
   */
  showCollapseButton?: boolean;
  /**
   * Format dates
   */

  /**
   * Form grid wrapper class
   * @default "grid-cols-1"
   */
  wrapperClass?: WrapperClassType;
}

export interface ActionButtonOptions extends VbenButtonProps {
  [key: string]: any;
  content?: MaybeComputedRef<string>;
  show?: boolean;
}

export interface VbenFormProps<
  T extends BaseFormComponentType = BaseFormComponentType,
  P extends Record<string, any> = Record<never, never>,
> extends Omit<
    FormRenderProps<T, P>,
  'componentBindEventMap' | 'componentMap' | 'form'
  > {
  /**
   * Reverse action buttons (submit button first)
   */
  actionButtonsReverse?: boolean;
  /**
   * Action button group layout
   * newLine: new row. rowEnd: inline, right-aligned (default). inline: grid default
   */
  actionLayout?: 'inline' | 'newLine' | 'rowEnd';
  /**
   * Action button group alignment; default right
   */
  actionPosition?: 'center' | 'left' | 'right';
  /**
   * Class for the form action area
   */
  actionWrapperClass?: ClassType;
  /**
   * Array-to-string field mapping; default separator is ","
   */
  arrayToStringFields?: ArrayToStringFields;

  /**
   * Field mapping for time ranges
   */
  fieldMappingTime?: FieldMappingTime;
  /**
   * Callback when collapsed/expanded state changes
   */
  handleCollapsedChange?: (collapsed: boolean) => void;
  /**
   * Form reset callback
   */
  handleReset?: HandleResetFn;
  /**
   * Form submit callback
   */
  handleSubmit?: HandleSubmitFn;
  /**
   * Form values change callback
   */
  handleValuesChange?: (
    values: Record<string, any>,
    fieldsChanged: Array<string>,
  ) => void;
  /**
   * Reset button options
   */
  resetButtonOptions?: ActionButtonOptions;

  /**
   * Scroll to the first invalid field on validation failure
   * @default false
   */
  scrollToFirstError?: boolean;

  /**
   * Show default action buttons
   * @default true
   */
  showDefaultActions?: boolean;

  /**
   * Submit button options
   */
  submitButtonOptions?: ActionButtonOptions;

  /**
   * Submit the form when field values change
   * @default false
   */
  submitOnChange?: boolean;

  /**
   * Submit the form on Enter key
   * @default false
   */
  submitOnEnter?: boolean;
}

export type ExtendedFormApi = FormApi & {
  useStore: <T = NoInfer<VbenFormProps>>(
    selector?: (state: NoInfer<VbenFormProps>) => T,
  ) => Readonly<Ref<T>>;
};

export interface VbenFormAdapterOptions<
  T extends BaseFormComponentType = BaseFormComponentType,
> {
  config?: {
    baseModelPropName?: string;
    disabledOnChangeListener?: boolean;
    disabledOnInputListener?: boolean;
    emptyStateValue?: null | undefined;
    modelPropNameMap?: Partial<Record<T, string>>;
  };
  defineRules?: {
    required?: (
      value: any,
      params: any,
      ctx: Record<string, any>,
    ) => boolean | string;
    selectRequired?: (
      value: any,
      params: any,
      ctx: Record<string, any>,
    ) => boolean | string;
  };
}
