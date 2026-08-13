import type { Ref } from 'vue';
import type {
  FieldComponentRegistry,
  FormBuilderState,
  FormValues,
  TamanFormOptions,
} from './types';
import { useSelector } from '@taman-core/shared/store';
import { defineComponent, h, onBeforeUnmount } from 'vue';

import FormRenderer from './components/form-renderer.vue';
import { FormApi } from './form-api';
import { applySearchPreset } from './presets/search';

export type ExtendedFormApi<TValues extends FormValues = FormValues> = FormApi<TValues> & {
  useStore: <T = FormBuilderState>(
    selector?: (state: FormBuilderState) => T,
  ) => Readonly<Ref<T>>;
};

/**
 * `TValues` comes first so callers can name the values shape
 * (`useTamanForm<TalentFormValues>({ ... })`) and still have the component
 * registry inferred from `options.fields`.
 */
export function useTamanForm<
  TValues extends FormValues = FormValues,
  R extends FieldComponentRegistry = FieldComponentRegistry,
>(
  options: TamanFormOptions<R, TValues>,
) {
  const api = new FormApi<TValues>(
    applySearchPreset(options as unknown as TamanFormOptions) as TamanFormOptions<
      FieldComponentRegistry,
      TValues
    >,
  );

  const extendedApi = api as ExtendedFormApi<TValues>;

  extendedApi.useStore = (selector) =>
    useSelector(api.store, (selector ?? ((state: FormBuilderState) => state)) as any);

  const Form = defineComponent(
    (props: Record<string, any>, { attrs, slots }) => {
      onBeforeUnmount(() => {
        api.unmount();
      });

      return () =>
        h(FormRenderer, { ...props, ...attrs, formApi: extendedApi }, slots);
    },

    {
      inheritAttrs: false,
      name: 'TamanUseForm',
    },
  );

  return [Form, extendedApi] as const;
}

/**
 * Binds a field registry once so call sites only name their values type:
 *
 * ```ts
 * export const useAppForm = defineTamanForm<FormFieldComponents>();
 * const [Form, api] = useAppForm<TalentFormValues>({ fields });
 * ```
 *
 * Needed because TypeScript has no partial type-argument inference — naming
 * `TValues` on `useTamanForm` alone would drop `R` back to its default, and
 * `component` names would stop being checked against the registry.
 */
export function defineTamanForm<R extends FieldComponentRegistry>() {
  return <TValues extends FormValues = FormValues>(
    options: TamanFormOptions<R, TValues>,
  ) => useTamanForm<TValues, R>(options);
}
