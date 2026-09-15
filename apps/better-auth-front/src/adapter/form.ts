import type {
  FormCodec,
  TamanFormProps as FormProps,
  TamanFormSchema as FormSchema,
  FormValues,
} from '@taman/app-ui';
import type { ComponentPropsMap, ComponentType } from './components';
import { calendarDateCodec, isEmptyFormValue, setupTamanForm, useTamanForm as useForm } from '@taman/app-ui';
import { $t } from '#/locales';

export async function initTamanForm() {
  setupTamanForm<ComponentType>({
    rules: {
      required: (value, _params, ctx) => {
        if (isEmptyFormValue(value)) {
          return $t('ui.formRules.required', [ctx.label]);
        }

        return true;
      },
      selectRequired: (value, _params, ctx) => {
        if (isEmptyFormValue(value)) {
          return $t('ui.formRules.selectRequired', [ctx.label]);
        }

        return true;
      },
    },
  });
}

export function useTamanForm<
  TFormValues extends FormValues = FormValues,
  TSubmitValues extends FormValues = TFormValues,
>(
  options: FormProps<
    ComponentType,
    ComponentPropsMap,
    TFormValues,
    TSubmitValues
  >,
) {
  return useForm<TFormValues, ComponentType, ComponentPropsMap, TSubmitValues>({
    ...options,
    codec: options.codec ?? (calendarDateCodec as FormCodec<TFormValues, TSubmitValues>),
  });
}

export type TamanFormSchema<TValues extends FormValues = FormValues>
  = FormSchema<ComponentType, ComponentPropsMap, TValues>;
export type TamanFormProps<
  TFormValues extends FormValues = FormValues,
  TSubmitValues extends FormValues = TFormValues,
> = FormProps<ComponentType, ComponentPropsMap, TFormValues, TSubmitValues>;

export { z } from '@taman-core/form-ui';
