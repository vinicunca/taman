import {
  CalendarDate,
  CalendarDateTime,
  parseDate,
} from '@internationalized/date';
import { describe, expect, it } from 'vitest';

import {
  decodeCalendarDateValues,
  encodeCalendarDateValues,
  isDateValue,
} from '../calendar-date-codec';

describe('calendar date value codec', () => {
  it('encodes CalendarDate values to ISO calendar date strings', () => {
    const date = new CalendarDate(2022, 2, 3);

    expect(
      encodeCalendarDateValues({
        date,
        name: 'Ada',
      }),
    ).toEqual({
      date: '2022-02-03',
      name: 'Ada',
    });
  });

  it('decodes ISO calendar date strings back to CalendarDate', () => {
    const decoded = decodeCalendarDateValues({
      date: '2022-02-03',
      name: 'Ada',
    });

    expect(decoded.date).toEqual(parseDate('2022-02-03'));
    expect(decoded.name).toBe('Ada');
  });

  it('does not treat a { start, end } range as a DateValue', () => {
    const range = {
      end: new CalendarDate(2026, 9, 20),
      start: new CalendarDate(2026, 9, 15),
    };

    expect(isDateValue(range)).toBe(false);
    expect(isDateValue(range.start)).toBe(true);
    expect(encodeCalendarDateValues({ period: range })).toEqual({
      period: {
        end: '2026-09-20',
        start: '2026-09-15',
      },
    });
  });

  it('round-trips date ranges and nested values without mutating inputs', () => {
    const values = Object.freeze({
      nested: { created: new CalendarDate(2026, 9, 15) },
      period: {
        end: new CalendarDate(2026, 9, 20),
        start: new CalendarDate(2026, 9, 15),
      },
    });

    const encoded = encodeCalendarDateValues(values);

    expect(encoded).toEqual({
      nested: { created: '2026-09-15' },
      period: {
        end: '2026-09-20',
        start: '2026-09-15',
      },
    });
    expect(values.nested.created).toBeInstanceOf(CalendarDate);
    expect(decodeCalendarDateValues(encoded)).toEqual(values);
  });

  it('encodes CalendarDateTime with its ISO string', () => {
    const dateTime = new CalendarDateTime(2022, 2, 3, 14, 30);

    expect(encodeCalendarDateValues({ deadline: dateTime })).toEqual({
      deadline: dateTime.toString(),
    });
  });

  it('leaves unrelated strings unchanged', () => {
    const values = { sku: 'ABC-123', year: '2022' };

    expect(encodeCalendarDateValues(values)).toEqual(values);
    expect(decodeCalendarDateValues(values)).toEqual(values);
  });
});
