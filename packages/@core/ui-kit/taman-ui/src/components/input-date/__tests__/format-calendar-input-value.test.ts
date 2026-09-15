import { CalendarDate } from '@internationalized/date';
import { describe, expect, it } from 'vitest';

import { formatCalendarInputValue } from '../format-calendar-input-value';

const february = new CalendarDate(2022, 2, 1);
const april = new CalendarDate(2022, 4, 1);

function formatYear(date: Date) {
  return String(date.getFullYear());
}

function formatMonth(date: Date) {
  return date.toLocaleString('en-US', { month: 'long' });
}

describe('formatCalendarInputValue', () => {
  it('formats a single date value', () => {
    expect(formatCalendarInputValue(february, formatYear)).toBe('2022');
  });

  it('formats a complete date range', () => {
    expect(
      formatCalendarInputValue(
        { end: april, start: february },
        formatMonth,
      ),
    ).toBe('February – April');
  });

  it('formats a partial range from the selected side', () => {
    expect(
      formatCalendarInputValue(
        { end: undefined, start: february },
        formatYear,
      ),
    ).toBe('2022');
  });

  it('returns undefined for an empty range', () => {
    expect(
      formatCalendarInputValue(
        { end: undefined, start: undefined },
        formatYear,
      ),
    ).toBeUndefined();
  });
});
