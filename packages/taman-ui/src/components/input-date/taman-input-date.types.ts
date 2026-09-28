import type { CalendarDate, CalendarDateTime, ZonedDateTime } from '@internationalized/date';
import type { CalendarProps, InputDateProps } from 'pohon-ui';

export type DateValue = CalendarDate | CalendarDateTime | ZonedDateTime;

export interface DateRange {
  start: DateValue | undefined;
  end: DateValue | undefined;
}

export type InputDateModelValue<R> = (R extends true ? DateRange : DateValue) | undefined;

export interface TamanInputDateProps<R extends boolean = false> extends InputDateProps<R> {
  type?: CalendarProps['type'];
}
