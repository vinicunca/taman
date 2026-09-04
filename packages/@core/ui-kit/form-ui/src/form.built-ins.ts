import type { TamanFileUploadProps } from '@taman-core/taman-ui';
import type {
  CalendarProps,
  CheckboxGroupProps,
  CheckboxProps,
  InputDateProps,
  InputMenuProps,
  InputProps,
} from 'pohon-ui';
import type { Component } from 'vue';
import { TamanFileUpload, TamanInputDate, TamanInputPassword } from '@taman-core/taman-ui';
import PCheckbox from 'pohon-ui/components/Checkbox.vue';
import PCheckboxGroup from 'pohon-ui/components/CheckboxGroup.vue';
import PInput from 'pohon-ui/components/Input.vue';
import PInputMenu from 'pohon-ui/components/InputMenu.vue';

export interface BuiltInFormComponentPropsMap {
  Checkbox: CheckboxProps;
  CheckboxGroup: CheckboxGroupProps;
  FileUpload: TamanFileUploadProps<false> | TamanFileUploadProps<true>;
  Input: InputProps;
  InputDate: (InputDateProps<false> | InputDateProps<true>) & {
    type: CalendarProps['type'];
  };
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
  InputMenu: PInputMenu,
  InputPassword: TamanInputPassword,
} satisfies Record<BuiltInFormComponentType, Component>;
