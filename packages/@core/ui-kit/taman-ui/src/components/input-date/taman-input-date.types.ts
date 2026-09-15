import type { CalendarProps, InputDateProps } from 'pohon-ui';

export interface TamanInputDateProps<R extends boolean = false> extends InputDateProps<R> {
  type?: CalendarProps['type'];
}
