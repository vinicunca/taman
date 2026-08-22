import type { FormLabelWidthContext, FormRenderProps } from '../form.types';

import { createContext } from '@taman-core/taman-ui';
import { computed } from 'vue';

export const [
  injectRenderFormProps,
  provideFormRenderProps,
] = createContext<
  FormLabelWidthContext & FormRenderProps
>('FormRenderProps');

export function useFormContext() {
  const formRenderProps = injectRenderFormProps();

  const isVertical = computed(() => formRenderProps.layout === 'vertical');

  const componentMap = computed(() => formRenderProps.componentMap);
  const componentBindEventMap = computed(
    () => formRenderProps.componentBindEventMap,
  );

  return {
    componentBindEventMap,
    componentMap,
    isVertical,
  };
}
