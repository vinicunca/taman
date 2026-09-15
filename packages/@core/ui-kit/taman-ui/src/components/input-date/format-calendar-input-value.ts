import type { DateValue } from '@internationalized/date';
import { isDateValue } from '@taman-core/shared/utils';
import { toDate } from 'akar/date';

export interface CalendarDateRange {
  end: DateValue | undefined;
  start: DateValue | undefined;
}

function isDateRange(value: unknown): value is CalendarDateRange {
  if (value == null || typeof value !== 'object' || isDateValue(value)) {
    return false;
  }

  return 'start' in value || 'end' in value;
}

export function formatCalendarInputValue(
  value: unknown,
  formatDate: (date: Date) => string,
): string | undefined {
  if (isDateValue(value)) {
    return formatDate(toDate(value));
  }

  if (!isDateRange(value)) {
    return undefined;
  }

  const start = isDateValue(value.start)
    ? formatDate(toDate(value.start))
    : undefined;
  const end = isDateValue(value.end)
    ? formatDate(toDate(value.end))
    : undefined;

  if (start && end) {
    return `${start} – ${end}`;
  }

  return start ?? end;
}
