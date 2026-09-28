import type { FormRenderProps } from '../form.types';

import { computed } from 'vue';
import { createContext } from '../..';

export const [
  injectRenderFormProps,
  provideFormRenderProps,
] = createContext<FormRenderProps>('FormRenderProps');

export function useFormContext() {
  const formRenderProps = injectRenderFormProps();

  const componentMap = computed(() => formRenderProps.componentMap);

  return {
    componentMap,
  };
}
