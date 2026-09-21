import type { MaybeComputedRef } from '@taman-core/typings';
import type { ButtonProps } from 'pohon-ui';
import type { Component, HTMLAttributes, HtmlHTMLAttributes, Ref } from 'vue';
import type { ZodType } from 'zod';
import type { FormApi } from './form.api';
import type { BuiltInFormComponentType } from './form.built-ins';

export type FormValues = Record<string, any>;

export type FormValuePatch<T> = T extends
  | ((...args: Array<any>) => unknown)
  | Date
  | ReadonlyArray<unknown>
  ? T
  : T extends object
    ? { [K in keyof T]?: FormValuePatch<T[K]> }
    : T;

export interface FormCodec<
  TFormValues extends FormValues = FormValues,
  TSubmitValues extends FormValues = TFormValues,
> {
  /** Convert the submitted value to the form component value. */
  decode: (values: Readonly<TSubmitValues>) => TFormValues;
  /** Convert the form component value to the submitted value. */
  encode: (values: Readonly<TFormValues>) => TSubmitValues;
}

export type FormFieldName<TValues extends FormValues = FormValues>
  = | Extract<keyof TValues, string>
    | (Record<never, never> & string);

export type FormFieldValue<
  TValues extends FormValues,
  TFieldName extends string,
> = TFieldName extends keyof TValues ? TValues[TFieldName] : unknown;

export type { BuiltInFormComponentPropsMap, BuiltInFormComponentType } from './form.built-ins';

export type FormBaseComponentType
  = | BuiltInFormComponentType
    | (Record<never, never> & string);

type Breakpoints = '2xl:' | '3xl:' | '' | 'lg:' | 'md:' | 'sm:' | 'xl:';

type GridCols = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13;

type WrapperClassType
  = | `${Breakpoints}grid-cols-${GridCols}`
    | (Record<never, never> & string);

export type FormItemClassType
  = | `${Breakpoints}cols-end-${'auto' | GridCols}`
    | `${Breakpoints}cols-span-${'auto' | 'full' | GridCols}`
    | `${Breakpoints}cols-start-${'auto' | GridCols}`
    | (Record<never, never> & string)
    | WrapperClassType;

export interface FormFieldOptions {
  asyncDebounceMs?: number;
  validateOn?: ReadonlyArray<FormValidationTrigger>;
}

export type FormValidationTrigger = 'blur' | 'change';

export interface FormShape {
  /** Default value */
  default?: any;
  /** Field name */
  fieldName: string;
  /** Whether required */
  required?: boolean;
  rules?: ZodType;
}

export interface FormRuntimeField<TValue = unknown> {
  handleBlur: () => void;
  handleChange: (value: TValue) => void;
  state: {
    meta: {
      errors: Array<unknown>;
      isDirty: boolean;
      isTouched: boolean;
      isValid: boolean;
      isValidating: boolean;
    };
    value: TValue;
  };
}

export interface FormComponentField<
  TValue = unknown,
  TFieldName extends string = string,
> {
  'modelValue': TValue;
  'name': TFieldName;
  'onBlur': () => void;
  'onChange': (value: TValue) => void;
  'onInput': (value: TValue) => void;
  'onUpdate:modelValue': (value: TValue) => void;
}

export type MaybeComponentPropKey
  = | 'options'
    | 'placeholder'
    | 'title'
    | keyof HtmlHTMLAttributes
    | (Record<never, never> & string);

export type MaybeComponentProps = { [K in MaybeComponentPropKey]?: any };

export interface FormMeta {
  dirty: boolean;
  submitting: boolean;
  valid: boolean;
  validating: boolean;
}

export interface FormRuntimeState<TValues extends FormValues = FormValues> {
  errors: Record<string, string>;
  meta: FormMeta;
  values: TValues;
}

export interface FormValidationResult {
  errors: Record<string, string>;
  valid: boolean;
}

export interface FormValueSnapshot<
  TFormValues extends FormValues = FormValues,
  TSubmitValues extends FormValues = TFormValues,
> {
  rawValues: Readonly<TFormValues>;
  values: TSubmitValues;
}

export interface FormResetState<TValues extends FormValues = FormValues> {
  values?: Partial<TValues>;
}

export interface FormResetOptions {
  force?: boolean;
  keepDefaultValues?: boolean;
}

export interface FormActions<TValues extends FormValues = FormValues> {
  clearValidation: (
    fieldNames?: FormFieldName<TValues> | Array<FormFieldName<TValues>>,
  ) => void;
  readonly errors: Record<string, string>;
  readonly fieldComponent: Component;
  getFieldError: (fieldName: string) => string | undefined;
  getFieldValue: <TFieldName extends FormFieldName<TValues>>(
    fieldName: TFieldName,
  ) => FormFieldValue<TValues, TFieldName>;
  handleSubmit: (
    callback?: (values: TValues) => Promise<void> | void,
  ) => (event?: Event) => Promise<void>;
  isFieldValid: (fieldName: string) => boolean;
  readonly meta: FormMeta;
  pushFieldValue: (fieldName: string, value: any) => void;
  removeFieldValue: (fieldName: string, index: number) => Promise<void>;
  reset: (
    state?: FormResetState<TValues>,
    options?: FormResetOptions,
  ) => Promise<void>;
  setFieldError: (fieldName: string, error?: string) => void;
  setFieldValue: <TFieldName extends FormFieldName<TValues>>(
    fieldName: TFieldName,
    value: FormFieldValue<TValues, NoInfer<TFieldName>>,
    shouldValidate?: boolean,
  ) => Promise<void>;
  setValues: (
    values: Partial<TValues>,
    shouldValidate?: boolean,
  ) => Promise<void>;
  submit: () => Promise<void>;
  useFieldError: (fieldName: string) => Readonly<Ref<string | undefined>>;
  useFieldValidating: (fieldName: string) => Readonly<Ref<boolean>>;
  useFieldValue: <TFieldName extends FormFieldName<TValues>>(
    fieldName: TFieldName,
  ) => Readonly<Ref<FormFieldValue<TValues, TFieldName>>>;
  useFieldValues: <TFieldName extends FormFieldName<TValues>>(
    fieldNames: ReadonlyArray<TFieldName>,
  ) => Readonly<Ref<Array<FormFieldValue<TValues, TFieldName>>>>;
  useSelector: <T>(
    selector: (state: FormRuntimeState<TValues>) => T,
  ) => Readonly<Ref<T>>;
  useValues: () => Readonly<Ref<TValues>>;
  validate: () => Promise<FormValidationResult>;
  validateField: (fieldName: string) => Promise<FormValidationResult>;
  readonly values: TValues;
}

type ReservedFormSlotName
  = | 'default'
    | 'expand-after'
    | 'expand-before'
    | 'reset-before'
    | 'submit-before';

type FormKnownFieldName<TValues extends FormValues>
  = string extends Extract<keyof TValues, string>
    ? never
    : Exclude<Extract<keyof TValues, string>, ReservedFormSlotName>;

export interface TamanFormActionSlotProps<
  TValues extends FormValues = FormValues,
  T extends FormBaseComponentType = FormBaseComponentType,
  P extends Record<string, any> = Record<never, never>,
  TSubmitValues extends FormValues = TValues,
> {
  formApi: ExtendedFormApi<TValues, T, P, TSubmitValues>;
  values: TValues;
}

export interface TamanFormDefaultSlotProps<
  TValues extends FormValues = FormValues,
  T extends FormBaseComponentType = FormBaseComponentType,
  P extends Record<string, any> = Record<never, never>,
  TSubmitValues extends FormValues = TValues,
> extends TamanFormActionSlotProps<TValues, T, P, TSubmitValues> {
  shapes: Array<FormShape>;
}

export interface TamanFormFieldSlotProps<
  TValues extends FormValues = FormValues,
  TFieldName extends FormFieldName<TValues> = FormFieldName<TValues>,
  T extends FormBaseComponentType = FormBaseComponentType,
  P extends Record<string, any> = Record<never, never>,
  TSubmitValues extends FormValues = TValues,
> extends TamanFormActionSlotProps<TValues, T, P, TSubmitValues> {
  componentField: FormComponentField<
    FormFieldValue<TValues, TFieldName>,
    TFieldName
  >;
  componentProps: TamanFormResolvedComponentProps<
    FormFieldValue<TValues, TFieldName>,
    TFieldName
  >;
  disabled: boolean;
  error: string | undefined;
  field: FormRuntimeField<FormFieldValue<TValues, TFieldName>>;
  isInValid: boolean;
  /**
   * The issue list from the field's last validation, kept in sync with
   * `error` (cleared whenever `error` clears). For zod (`ZodType`) rules
   * this is the full `safeParseAsync` issue list; for a string-rule
   * validator it is a single derived entry with `path: []`. A direct
   * `formApi.setFieldError(name, 'msg')` call sets `error` while leaving
   * this empty, since it bypasses the field's own validator and there is no
   * issue list to derive it from.
   */
  issues: Array<{ message: string; path: Array<PropertyKey> }>;
  modelValue: FormFieldValue<TValues, TFieldName>;
  name: TFieldName;
}

export type TamanFormResolvedComponentProps<
  TValue = unknown,
  TFieldName extends string = string,
> = MaybeComponentProps & {
  'disabled': boolean;
  'modelValue'?: TValue;
  'name': TFieldName;
  'onUpdate:modelValue'?: (value: TValue) => void;
};

type TamanFormFieldSlots<
  TValues extends FormValues,
  T extends FormBaseComponentType,
  P extends Record<string, any>,
  TSubmitValues extends FormValues,
>
  = string extends Extract<keyof TValues, string>
    ? Record<
      string,
        | ((
          props: TamanFormFieldSlotProps<
            TValues,
            FormFieldName<TValues>,
            T,
            P,
            TSubmitValues
          >,
        ) => any)
        | undefined
    >
    : {
        [TFieldName in FormKnownFieldName<TValues>]?: (
          props: TamanFormFieldSlotProps<
            TValues,
            TFieldName,
            T,
            P,
            TSubmitValues
          >,
        ) => any;
      };

export type TamanFormSlots<
  TValues extends FormValues = FormValues,
  T extends FormBaseComponentType = FormBaseComponentType,
  P extends Record<string, any> = Record<never, never>,
  TSubmitValues extends FormValues = TValues,
> = TamanFormFieldSlots<TValues, T, P, TSubmitValues> & {
  'default'?: (
    props: TamanFormDefaultSlotProps<TValues, T, P, TSubmitValues>,
  ) => any;
  'expand-after'?: (
    props: TamanFormActionSlotProps<TValues, T, P, TSubmitValues>,
  ) => any;
  'expand-before'?: (
    props: TamanFormActionSlotProps<TValues, T, P, TSubmitValues>,
  ) => any;
  'reset-before'?: (
    props: TamanFormActionSlotProps<TValues, T, P, TSubmitValues>,
  ) => any;
  'submit-before'?: (
    props: TamanFormActionSlotProps<TValues, T, P, TSubmitValues>,
  ) => any;
};

export type TamanFormComponent<
  TValues extends FormValues = FormValues,
  T extends FormBaseComponentType = FormBaseComponentType,
  P extends Record<string, any> = Record<never, never>,
  TSubmitValues extends FormValues = TValues,
> = new () => {
  $props: TamanFormProps<T, P, TValues, TSubmitValues>;
  $slots: TamanFormSlots<TValues, T, P, TSubmitValues>;
};

export interface FormSchemaContext<TValues extends FormValues = FormValues> {
  /** Array field name, e.g., contacts */
  arrayField?: string;
  /** The actual field name, e.g., contacts[0].name */
  fieldName?: string;
  /** Original schema field name, e.g., name */
  originalFieldName?: string;
  /** Full form value */
  rootValues?: TValues;
  /** Current row data */
  row?: Record<string, any>;
  /** Current row index */
  rowIndex?: number;
  /** Current row path, e.g., contacts[0] */
  rowPath?: string;
}

export type FormCustomRenderType = (() => Component | string) | string;

// Dynamic rendering parameters
type CustomParamsRenderType<TValues extends FormValues = FormValues>
  = | ((ctx: FormSchemaContext<TValues>) => Component | string)
    | string;

export type FormSchemaRuleType
  = | 'required'
    | 'selectRequired'
    | null
    | (Record<never, never> & string)
    | ZodType;

interface FormItemDependenciesBase {
  /**
   * Trigger fields
   */
  triggerFields: Array<string>;
}

export interface FormDependenciesResolveContext<
  TValues extends FormValues = FormValues,
> {
  actions: FormActions<TValues>;
  controller: ExtendedFormApi<TValues>;
  schema: FormSchemaContext<TValues>;
  values: Readonly<TValues>;
}

export interface FormDependenciesResolvedState {
  componentProps?: MaybeComponentProps;
  disabled?: boolean;
  help?: FormCustomRenderType;
  if?: boolean;
  renderComponentContent?: Record<string, any>;
  required?: boolean;
  rules?: FormSchemaRuleType;
  show?: boolean;
}

export interface FormItemDependenciesResolve<
  TValues extends FormValues = FormValues,
> extends FormItemDependenciesBase {
  resolve: (
    context: FormDependenciesResolveContext<TValues>,
  ) =>
    | FormDependenciesResolvedState
    | PromiseLike<FormDependenciesResolvedState | undefined>
    | undefined;
}

export type FormItemDependencies<TValues extends FormValues = FormValues> = FormItemDependenciesResolve<TValues>;

type ComponentProps<TValues extends FormValues = FormValues>
  = | ((ctx: FormSchemaContext<TValues>) => MaybeComponentProps)
    | MaybeComponentProps;

export interface FormCommonConfig<TValues extends FormValues = FormValues> {
  /**
   * Whether to be collapsible
   *
   * Effectively static-schema-only: it is read once when the field control
   * mounts. Flipping it at runtime remounts the control (per
   * `form-render-field-collapsible.vue`'s `v-if`), which loses focus, IME
   * composition state, and any open dropdown/popover the control was
   * showing.
   * @default false
   */
  collapsible?: boolean;
  /**
   * All form item props
   */
  componentProps?: ComponentProps<TValues>;
  /**
   * All form item component styles
   */
  controlClass?: string;
  /**
   * Default collapsible
   * @default false
   */
  defaultCollapsed?: boolean;
  /**
   * All form item disabled state
   * @default false
   */
  disabled?: boolean;
  /**
   * All form item component styles
   * @default {}
   */
  formFieldProps?: FormFieldOptions;
  /**
   * All form item grid layout, support function form
   * @default ""
   */
  formItemClass?: (() => string) | string;
  /**
   * Hide all form item label
   * @default false
   */
  hideLabel?: boolean;
  /**
   * Suppress the field-level validation message.
   * Use when a composite component renders its own messages per sub-control.
   * @default false
   */
  hideMessage?: boolean;
  /**
   * Whether to hide the required mark
   * @default false
   */
  hideRequiredMark?: boolean;
  /**
   * All form item label styles
   * @default ""
   */
  labelClass?: string;
  /**
   * All form item model property name
   * @default "modelValue"
   */
  modelPropName?: string;
  /**
   * All form item wrapper styles
   */
  wrapperClass?: string;
}

type RenderComponentContentType<TValues extends FormValues = FormValues> = (
  ctx: FormSchemaContext<TValues>,
) => Record<string, any>;

type MappedComponentProps<P, TValues extends FormValues = FormValues>
  = | ((ctx: FormSchemaContext<TValues>) => P & Record<string, any>)
    | (P & Record<string, any>);

interface FormSchemaBody<TValues extends FormValues = FormValues> extends Omit<
  FormCommonConfig<TValues>,
  'componentProps'
> {
  /**
   * Hide this entry while the form is collapsed.
   * The collapse toggle appears only when at least one top-level entry sets it.
   * Distinct from the form-level `collapsed` state, which asks whether the form
   * is collapsed right now.
   *
   * The toggle only renders inside the default `<FormActions>` (gated by
   * `showDefaultActions`, and by `taman-use-form.vue` falling back to it only
   * when no custom `default` slot is supplied). Marking an entry `collapsed`
   * while those defaults are off leaves it permanently hidden with no way to
   * expand it — provide your own expand control (bound to the form's
   * `collapsed` state) in that case.
   * @default false
   */
  collapsed?: boolean;
  /** Default value */
  defaultValue?: any;
  /** Dependencies */
  dependencies?: FormItemDependencies<TValues>;
  /** Description */
  description?: FormCustomRenderType;
  /** Field name */
  fieldName: string;
  /** Help information */
  help?: CustomParamsRenderType<TValues>;
  /** Whether to hide the form item */
  hide?: boolean;
  /** Form item */
  label?: FormCustomRenderType;
  // Custom component internal rendering
  renderComponentContent?: RenderComponentContentType<TValues>;
  /** Field rules */
  rules?: FormSchemaRuleType;
  /** Suffix */
  suffix?: FormCustomRenderType;
}

type FormSchemaDiscriminated<
  T extends FormBaseComponentType,
  P extends Record<string, any>,
  TValues extends FormValues,
> = {
  [K in Extract<keyof P, T>]: {
    /** Component */
    component: K;
    /** Component props */
    componentProps?: MappedComponentProps<P[K], TValues>;
  } & FormSchemaBody<TValues>;
}[Extract<keyof P, T>];

type FormSchemaFallback<
  T extends FormBaseComponentType,
  P extends Record<string, any>,
  TValues extends FormValues,
> = {
  component:
    | Component
    | (string extends keyof P ? T : Exclude<T, keyof P>);
  componentProps?: ComponentProps<TValues>;
} & FormSchemaBody<TValues>;

type FormArraySchema<
  T extends FormBaseComponentType,
  P extends Record<string, any>,
  TValues extends FormValues,
> = {
  /** Built-in array editor props */
  arrayProps?: Omit<
    TamanFormFieldArrayProps<T, P, TValues>,
    'disabled' | 'globalCommonConfig' | 'name' | 'schema'
  >;
  /** Array field definition */
  children: Array<FormFieldSchema<T, P, TValues>>;
  /** Compatible with explicitly specifying the built-in array editor */
  component?:
    | Component
    | (string extends keyof P ? T : Exclude<T, keyof P>);
  /** Compatible with passing array editor parameters through componentProps */
  componentProps?: ComponentProps<TValues>;
  /** Array field type */
  type: 'array';
} & FormSchemaBody<TValues>;

/**
 * Form grouping, used to organize multiple fields into a collapsible section.
 * The grouping itself is not a field; it does not participate in value retrieval or validation.
 */
export interface FormGroupSchema<
  T extends FormBaseComponentType = FormBaseComponentType,
  P extends Record<string, any> = Record<never, never>,
  TValues extends FormValues = FormValues,
> {
  /** Fields defined within the group */
  children: Array<FormFieldSchema<T, P, TValues>>;
  /**
   * Hide this entry while the form is collapsed.
   * The collapse toggle appears only when at least one top-level entry sets it.
   * Distinct from the form-level `collapsed` state, which asks whether the form
   * is collapsed right now.
   *
   * The toggle only renders inside the default `<FormActions>` (gated by
   * `showDefaultActions`, and by `taman-use-form.vue` falling back to it only
   * when no custom `default` slot is supplied). Marking an entry `collapsed`
   * while those defaults are off leaves it permanently hidden with no way to
   * expand it — provide your own expand control (bound to the form's
   * `collapsed` state) in that case.
   * @default false
   */
  collapsed?: boolean;
  /**
   * Whether to allow collapsing
   * @default true
   */
  collapsible?: boolean;
  /** Groups are not fields, so specifying a component is prohibited */
  component?: never;
  /**
   * Whether to default collapse
   * @default false
   */
  defaultCollapsed?: boolean;
  /** Additional content on the right side of the title */
  extra?: FormCustomRenderType;
  /** Groups are not fields, so specifying a field name is prohibited */
  fieldName?: never;
  /** Styles for the group container in the form grid, defaulting to occupying one full row */
  formItemClass?: FormItemClassType;
  /** Whether to hide the group */
  hide?: boolean;
  /** Group identifier, used for stable keys during rendering, defaulting to index */
  name?: string;
  /** Group title */
  title?: FormCustomRenderType;
  /** Group type */
  type: 'group';
  /** Grid layout within the group, defaulting to inheriting the wrapperClass of the form */
  wrapperClass?: WrapperClassType;
}

/**
 * Single form field schema (normal field / array field)
 */
export type FormFieldSchema<
  T extends FormBaseComponentType = FormBaseComponentType,
  P extends Record<string, any> = Record<never, never>,
  TValues extends FormValues = FormValues,
>
  = | FormArraySchema<T, P, TValues>
    | FormSchemaDiscriminated<T, P, TValues>
    | FormSchemaFallback<T, P, TValues>;

/**
 * Form schema item: field or group, distinguished by `type`.
 */
export type FormSchema<
  T extends FormBaseComponentType = FormBaseComponentType,
  P extends Record<string, any> = Record<never, never>,
  TValues extends FormValues = FormValues,
> = FormFieldSchema<T, P, TValues> | FormGroupSchema<T, P, TValues>;

/**
 * Component props for the array editor (TamanFormFieldArray)
 */
export interface TamanFormFieldArrayProps<
  T extends FormBaseComponentType = FormBaseComponentType,
  P extends Record<string, any> = Record<never, never>,
  TValues extends FormValues = FormValues,
> {
  /** Action list header text */
  actionText?: string;
  /** "Add" button text */
  addButtonText?: string;
  /** Subfield common configuration */
  commonConfig?: FormCommonConfig<TValues>;
  /** Default data generated when a new row is added; if not specified, an empty object is generated according to the fieldName defined in the column */
  createRow?: () => Record<string, any>;
  disabled?: boolean;
  /** Empty data text */
  emptyText?: string;
  /** Subfield global common configuration */
  globalCommonConfig?: FormCommonConfig<TValues>;
  /** Maximum number of rows */
  max?: number;
  /** Minimum number of rows */
  min?: number;
  /** Array field path, passed through the outer FormField */
  name?: string;
  /** Column definition, each column is a subfield (reuse FormFieldSchema) */
  schema?: Array<FormFieldSchema<T, P, TValues>>;
  /** Whether to display the index column */
  showIndex?: boolean;
}

export type FormHandleSubmitFn<
  TFormValues extends FormValues = FormValues,
  TSubmitValues extends FormValues = TFormValues,
> = (
  values: NoInfer<TSubmitValues>,
  rawValues: Readonly<TFormValues>,
) => Promise<void> | void;

export type FormHandleResetFn<TSubmitValues extends FormValues = FormValues> = (
  values: TSubmitValues,
) => Promise<void> | void;

export interface FormFieldProps<
  T extends FormBaseComponentType = FormBaseComponentType,
  TValues extends FormValues = FormValues,
> extends FormSchemaBody<TValues> {
  /** Component */
  component: Component | T;
  /** Component props */
  componentProps?: ComponentProps<TValues>;
}

export interface FormRenderProps<
  T extends FormBaseComponentType = FormBaseComponentType,
  P extends Record<string, any> = Record<never, never>,
  TValues extends FormValues = FormValues,
> {
  /**
   * Whether the form is currently collapsed.
   * true: collapsed false: expanded
   */
  collapsed?: boolean;
  /**
   * Whether to trigger resize event
   * @default false
   */
  collapseTriggerResize?: boolean;
  /**
   * Form item common fallback configuration, used when the subproject is not configured, the subproject configuration has higher priority than this configuration
   */
  commonConfig?: FormCommonConfig<TValues>;
  /**
   * Compact mode (remove the space reserved for validation information at the bottom of each form item)
   */
  compact?: boolean;
  /**
   * Component collection
   */
  componentMap: Record<FormBaseComponentType, Component>;
  /**
   * Disable the whole form: every field plus the submit and reset buttons.
   * Distinct from `commonConfig.disabled`, which only disables fields.
   * @default false
   */
  disabled?: boolean;
  /**
   * Form instance
   */
  form?: FormActions<TValues>;
  /**
   * Form Definition
   */
  schema?: Array<FormSchema<T, P, TValues>>;
  /**
   * Form grid layout
   * @default "grid-cols-1"
   */
  wrapperClass?: WrapperClassType;
}

interface ActionButtonOptions extends ButtonProps {
  content?: MaybeComputedRef<string>;
  show?: boolean;
}

export interface TamanFormProps<
  T extends FormBaseComponentType = FormBaseComponentType,
  P extends Record<string, any> = Record<never, never>,
  TValues extends FormValues = FormValues,
  TSubmitValues extends FormValues = TValues,
> extends Omit<
    FormRenderProps<T, P, TValues>,
  'componentMap' | 'form'
  > {
  /**
   * Whether to reverse the operation buttons (submit button before)
   */
  actionButtonsReverse?: boolean;
  /**
   * Operation button group style
   * newLine: Display on a new line. rowEnd: Display inline, right aligned (default). inline: Use grid default style
   */
  actionLayout?: 'inline' | 'newLine' | 'rowEnd';
  /**
   * Operation button group display position, default is right aligned
   */
  actionPosition?: 'center' | 'left' | 'right';
  /**
   * Form action area class
   */
  actionWrapperClass?: HTMLAttributes['class'];
  /**
   * Time to debounce when submitOnChange changes | default is 300ms
   */
  changeDebouncedTime?: number;
  /** Bidirectional codec between form component values and submitted values. */
  codec?: FormCodec<TValues, TSubmitValues>;
  /**
   * Form collapse expand state change callback
   */
  handleCollapsedChange?: (collapsed: boolean) => void;
  /**
   * Form reset callback
   */
  handleReset?: FormHandleResetFn<NoInfer<TSubmitValues>>;
  /**
   * Form submit callback
   */
  handleSubmit?: FormHandleSubmitFn<TValues, TSubmitValues>;
  /**
   * Form value change callback
   */
  handleValuesChange?: (
    values: Readonly<TValues>,
    fieldsChanged: Array<string>,
    getFormattedValues: () => TSubmitValues,
  ) => void;

  /**
   * Reset button parameters
   */
  resetButtonOptions?: ActionButtonOptions;

  /**
   * Whether to automatically scroll to the first error field when validation fails
   * @default false
   */
  scrollToFirstError?: boolean;

  /**
   * Whether to display default action buttons
   * @default true
   */
  showDefaultActions?: boolean;

  /**
   * Submit button parameters
   */
  submitButtonOptions?: ActionButtonOptions;

  /**
   * Whether to submit the form when the field value changes
   * @default false
   */
  submitOnChange?: boolean;

  /**
   * Whether to submit the form when Enter is pressed
   * @default false
   */
  submitOnEnter?: boolean;
}

export type ExtendedFormApi<
  TValues extends FormValues = FormValues,
  T extends FormBaseComponentType = FormBaseComponentType,
  P extends Record<string, any> = Record<never, never>,
  TSubmitValues extends FormValues = TValues,
> = FormApi<TValues, T, P, TSubmitValues> & {
  useStore: <TResult = NoInfer<TamanFormProps<T, P, TValues, TSubmitValues>>>(
    selector?: (
      state: NoInfer<TamanFormProps<T, P, TValues, TSubmitValues>>,
    ) => TResult,
  ) => Readonly<Ref<TResult>>;
};

export interface TamanFormAdapterOptions {
  rules?: Partial<Record<string, FormRuleValidator>>;
}

export interface FormRuleContext {
  field: {
    label?: string;
    name: string;
  };
  label?: string;
  name: string;
}

export type FormRuleValidator = (
  value: any,
  params: any,
  context: FormRuleContext,
) => boolean | Promise<boolean | string> | string;
