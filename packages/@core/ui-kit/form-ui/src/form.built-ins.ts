import type { TamanFileUploadProps } from '@taman-core/taman-ui';
import type {
  CalendarProps,
  CheckboxGroupProps,
  CheckboxProps,
  InputDateProps,
  InputProps,
} from 'pohon-ui';
import type { Component } from 'vue';
import { TamanFileUpload, TamanInputDate, TamanInputPassword } from '@taman-core/taman-ui';
import PCheckbox from 'pohon-ui/components/Checkbox.vue';
import PCheckboxGroup from 'pohon-ui/components/CheckboxGroup.vue';
import PInput from 'pohon-ui/components/Input.vue';

export interface BuiltInFormComponentPropsMap {
  Checkbox: CheckboxProps;
  CheckboxGroup: CheckboxGroupProps;
  FileUpload: TamanFileUploadProps<false> | TamanFileUploadProps<true>;
  Input: InputProps;
  InputDate: (InputDateProps<false> | InputDateProps<true>) & {
    type: CalendarProps['type'];
  };
  InputPassword: InputProps & { passwordStrength?: boolean };
}

export type BuiltInFormComponentType = keyof BuiltInFormComponentPropsMap;

export const BUILT_IN_COMPONENT_MAP = {
  Checkbox: PCheckbox,
  CheckboxGroup: PCheckboxGroup,
  FileUpload: TamanFileUpload,
  Input: PInput,
  InputDate: TamanInputDate,
  InputPassword: TamanInputPassword,
} satisfies Record<BuiltInFormComponentType, Component>;
