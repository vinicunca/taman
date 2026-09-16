import type { TamanFileUploadProps, TamanInputCurrencyProps, TamanInputDateProps } from '@taman-core/taman-ui';
import type {
  CheckboxGroupProps,
  CheckboxProps,
  InputMenuProps,
  InputNumberProps,
  InputProps,
  InputRatingProps,
  InputTagsProps,
  InputTimeProps,
  PinInputProps,
  RadioGroupProps,
  SelectMenuProps,
  SelectProps,
  SliderProps,
  SwitchProps,
  TextareaProps,
} from 'pohon-ui';
import type { Component } from 'vue';
import { TamanFileUpload, TamanInputCurrency, TamanInputDate, TamanInputPassword } from '@taman-core/taman-ui';
import PCheckbox from 'pohon-ui/components/Checkbox.vue';
import PCheckboxGroup from 'pohon-ui/components/CheckboxGroup.vue';
import PInput from 'pohon-ui/components/Input.vue';
import PInputMenu from 'pohon-ui/components/InputMenu.vue';
import PInputNumber from 'pohon-ui/components/InputNumber.vue';
import PInputRating from 'pohon-ui/components/InputRating.vue';
import PInputTags from 'pohon-ui/components/InputTags.vue';
import PInputTime from 'pohon-ui/components/InputTime.vue';
import PPinInput from 'pohon-ui/components/PinInput.vue';
import PRadioGroup from 'pohon-ui/components/RadioGroup.vue';
import PSelect from 'pohon-ui/components/Select.vue';
import PSelectMenu from 'pohon-ui/components/SelectMenu.vue';
import PSlider from 'pohon-ui/components/Slider.vue';
import PSwitch from 'pohon-ui/components/Switch.vue';
import PTextarea from 'pohon-ui/components/Textarea.vue';

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
  InputRating: InputRatingProps;
  InputTags: InputTagsProps;
  InputTime: InputTimeProps;
  PinInput: PinInputProps;
  RadioGroup: RadioGroupProps;
  Select: SelectProps;
  SelectMenu: SelectMenuProps;
  Slider: SliderProps;
  Switch: SwitchProps;
  Textarea: TextareaProps;
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
  InputRating: PInputRating,
  InputTags: PInputTags,
  InputTime: PInputTime,
  PinInput: PPinInput,
  RadioGroup: PRadioGroup,
  Select: PSelect,
  SelectMenu: PSelectMenu,
  Slider: PSlider,
  Switch: PSwitch,
  Textarea: PTextarea,
} satisfies Record<BuiltInFormComponentType, Component>;
