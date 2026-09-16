import { CalendarDate, getLocalTimeZone, ZonedDateTime } from '@internationalized/date';
import { describe, expect, it } from 'vitest';

import {
  formatCalendarInputValue,
  isCalendarInputComplete,
} from '../format-calendar-input-value';

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

  it('formats a ZonedDateTime with its own timezone', () => {
    const zoned = new ZonedDateTime(2022, 2, 1, getLocalTimeZone(), 0);

    expect(formatCalendarInputValue(zoned, formatYear)).toBe('2022');
  });
});

describe('isCalendarInputComplete', () => {
  it('is complete for a single date value', () => {
    expect(isCalendarInputComplete(february)).toBe(true);
  });

  it('is incomplete for a range that only has a start', () => {
    expect(
      isCalendarInputComplete({ end: undefined, start: february }),
    ).toBe(false);
  });

  it('is complete when both range ends are selected', () => {
    expect(
      isCalendarInputComplete({ end: april, start: february }),
    ).toBe(true);
  });

  it('is incomplete when the value is empty', () => {
    expect(isCalendarInputComplete(undefined)).toBe(false);
    expect(
      isCalendarInputComplete({ end: undefined, start: undefined }),
    ).toBe(false);
  });
});
