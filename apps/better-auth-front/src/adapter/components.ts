import type { AppFetchComponentSharedProps, TamanFileUploadProps } from '@taman/app-ui';
import type { CheckboxGroupProps, CheckboxProps, InputProps } from 'pohon-ui';
import type { Component } from 'vue';
import { AppFetchComponent, globalShareState } from '@taman/app-ui';
import PSelect from 'pohon-ui/components/Select.vue';
import { defineComponent, h, ref } from 'vue';
import { $t } from '#/locales';

/**
 * Maps to {@link ComponentType} for schema `component` + `componentProps` typing.
 */
export interface ComponentPropsMap {
  Checkbox: CheckboxProps;
  CheckboxGroup: CheckboxGroupProps;
  FileUpload: TamanFileUploadProps<false> | TamanFileUploadProps<true>;
  Input: InputProps;
  SelectFetch: AppFetchComponentSharedProps;
}

export type LegacyComponentType
  = | 'ApiCascader'
    | 'ApiSelect'
    | 'ApiTreeSelect'
    | 'AutoComplete'
    | 'Cascader'
    | 'CollapsibleParams'
    | 'DatePicker'
    | 'DefaultButton'
    | 'Divider'
    | 'IconPicker'
    | 'InputNumber'
    | 'InputPassword'
    | 'Mentions'
    | 'PrimaryButton'
    | 'Radio'
    | 'RadioGroup'
    | 'RangePicker'
    | 'Rate'
    | 'RichEditor'
    | 'Select'
    | 'Space'
    | 'Switch'
    | 'Textarea'
    | 'TimePicker'
    | 'TreeSelect'
    | 'Upload'
    | 'VbenInput'
    | 'VbenInputPassword'
    | 'VbenPinInput';

export type ComponentType = keyof ComponentPropsMap | LegacyComponentType;

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
    SelectFetch: withDefaultPlaceholder({
      component: AppFetchComponent,
      type: 'select',
      componentProps: {
        component: PSelect,
        optionsPropName: 'items',
        visibleEvent: 'onUpdate:open',
      },
    }),
  };

  // Register components to the global shared state
  globalShareState.setComponents(components);
}
