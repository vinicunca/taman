import type { InputProps } from 'pohon-ui';

export interface TamanInputCurrencyProps extends Omit<InputProps, 'defaultValue'> {
  defaultValue?: NonNullable<InputProps['defaultValue']>;
  formatOptions?: Intl.NumberFormatOptions;
}
