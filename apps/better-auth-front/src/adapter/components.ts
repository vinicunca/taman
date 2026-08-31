import type { FormBaseComponentType } from '@taman-core/form-ui';
import type { InputProps } from 'pohon-ui';
import type { Component } from 'vue';
import { AppFetchComponent, globalShareState } from '@taman/app-ui';
import PSelect from 'pohon-ui/components/Select.vue';
import { defineComponent, h, ref } from 'vue';
import { $t } from '#/locales';

/**
 * Maps to {@link ComponentType} for schema `component` + `componentProps` typing.
 */
export interface ComponentPropsMap {
  Input: InputProps;
}

export type ComponentType
  = | 'Input'
    | FormBaseComponentType;

function withDefaultPlaceholder(
  { component, type, componentProps }:
  {
    component: Component;
    type: 'input' | 'select';
    componentProps?: Record<string, any>;
  },
) {
  return defineComponent({
    name: component.name,
    inheritAttrs: false,
    setup: (props: any, { attrs, expose, slots }) => {
      const placeholder
        = props?.placeholder
          || attrs?.placeholder
          || $t(`ui.placeholder.${type}`);
      // Methods exposed by the pass-through component
      const innerRef = ref();

      expose(
        new Proxy(
          {},
          {
            get: (_target, key) => innerRef.value?.[key],
            has: (_target, key) => key in (innerRef.value || {}),
          },
        ),
      );

      return () =>
        h(
          component,
          { ...componentProps, placeholder, ...props, ...attrs, ref: innerRef },
          slots,
        );
    },
  });
}

export async function initComponentAdapter() {
  const components: Partial<Record<ComponentType, Component>> = {
    ApiSelect: withDefaultPlaceholder({
      component: AppFetchComponent,
      type: 'select',
      componentProps: {
        component: PSelect,
        loadingSlot: 'suffixIcon',
        modelPropName: 'value',
        visibleEvent: 'onOpenChange',
      },
    }),
  };

  // Register components to the global shared state
  globalShareState.setComponents(components);
}
