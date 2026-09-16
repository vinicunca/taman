import type { TamanFileUploadProps, TamanInputCurrencyProps, TamanInputDateProps } from '@taman-core/taman-ui';
import type {
  CheckboxGroupProps,
  CheckboxProps,
  InputMenuProps,
  InputNumberProps,
  InputProps,
} from 'pohon-ui';
import type { Component } from 'vue';
import { TamanFileUpload, TamanInputCurrency, TamanInputDate, TamanInputPassword } from '@taman-core/taman-ui';
import PCheckbox from 'pohon-ui/components/Checkbox.vue';
import PCheckboxGroup from 'pohon-ui/components/CheckboxGroup.vue';
import PInput from 'pohon-ui/components/Input.vue';
import PInputMenu from 'pohon-ui/components/InputMenu.vue';
import PInputNumber from 'pohon-ui/components/InputNumber.vue';

export interface BuiltInFormComponentPropsMap {
  Checkbox: CheckboxProps;
  CheckboxGroup: CheckboxGroupProps;
  FileUpload: TamanFileUploadProps<false> | TamanFileUploadProps<true>;
  Input: InputProps;
  InputDate: TamanInputDateProps<false> | TamanInputDateProps<true>;
  InputNumber: InputNumberProps;
  InputCurrency: TamanInputCurrencyProps;
  InputMenu: InputMenuProps;
  InputPassword: InputProps & { passwordStrength?: boolean };
}

export type BuiltInFormComponentType = keyof BuiltInFormComponentPropsMap;

export const BUILT_IN_COMPONENT_MAP = {
  Checkbox: PCheckbox,
  CheckboxGroup: PCheckboxGroup,
  FileUpload: TamanFileUpload,
  Input: PInput,
  InputDate: TamanInputDate,
  InputNumber: PInputNumber,
  InputCurrency: TamanInputCurrency,
  InputMenu: PInputMenu,
  InputPassword: TamanInputPassword,
} satisfies Record<BuiltInFormComponentType, Component>;
