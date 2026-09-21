import type { FormRenderProps } from '../form.types';

import { createContext } from '@taman-core/taman-ui';
import { computed } from 'vue';

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
