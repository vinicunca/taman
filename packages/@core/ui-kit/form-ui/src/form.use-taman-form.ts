import type {
  ExtendedFormApi,
  FormBaseComponentType,
  FormValues,
  TamanFormComponent,
  TamanFormProps,
} from './form.types';

import { useSelector } from '@taman-core/shared/store';
import { defineComponent, h, isReactive, onBeforeUnmount, watch } from 'vue';

import { FormApi } from './form.api';
import TamanUseForm from './taman-use-form.vue';

type UseTamanFormReturn<
  TValues extends FormValues,
  T extends FormBaseComponentType,
  P extends Record<string, any>,
  TSubmitValues extends FormValues = TValues,
> = readonly [
  TamanFormComponent<TValues, T, P, TSubmitValues>,
  ExtendedFormApi<TValues, T, P, TSubmitValues>,
];

export function useTamanForm<
  T extends FormBaseComponentType = FormBaseComponentType,
  P extends Record<string, any> = Record<never, never>,
>(options: TamanFormProps<T, P>): UseTamanFormReturn<FormValues, T, P>;

export function useTamanForm<
  TValues extends FormValues,
  T extends FormBaseComponentType = FormBaseComponentType,
  P extends Record<string, any> = Record<never, never>,
  TSubmitValues extends FormValues = TValues,
>(
  options: TamanFormProps<T, P, TValues, TSubmitValues>,
): UseTamanFormReturn<TValues, T, P, TSubmitValues>;

export function useTamanForm(
  options: TamanFormProps<any, any, any, any>,
): UseTamanFormReturn<any, any, any, any> {
  const IS_REACTIVE = isReactive(options);
  const api = new FormApi<any, any, any, any>(options);
  const extendedApi = api as ExtendedFormApi<any, any, any, any>;
  extendedApi.useStore = (selector: any) => {
    return useSelector(api.store, selector);
  };

  const Form = defineComponent(
    (props: TamanFormProps, { attrs, slots }) => {
      onBeforeUnmount(() => {
        api.unmount();
      });
      api.setState({ ...props, ...attrs });
      return () =>
        h(TamanUseForm, { ...props, ...attrs, formApi: extendedApi }, slots);
    },
    {
      name: 'TamanUseForm',
      inheritAttrs: false,
    },
  );
  // Add reactivity support
  if (IS_REACTIVE) {
    watch(
      () => options.schema,
      () => {
        api.setState({ schema: options.schema });
      },
      { immediate: true },
    );
  }

  return [Form, extendedApi] as unknown as UseTamanFormReturn<
    any,
    any,
    any,
    any
  >;
}
