import {
  CalendarDate,
  CalendarDateTime,
  parseAbsolute,
  toCalendarDate,
} from '@internationalized/date';
import { describe, expect, it } from 'vitest';

import {
  decodeCalendarDateValues,
  encodeCalendarDateValues,
  isDateValue,
} from '../calendar-date-codec';

const februaryThird = new CalendarDate(2022, 2, 3);
const utcIso = '2022-02-03T00:00:00.000Z';

describe('calendar date value codec', () => {
  it('encodes CalendarDate values to UTC ISO strings', () => {
    expect(
      encodeCalendarDateValues({
        date: februaryThird,
        name: 'Ada',
      }),
    ).toEqual({
      date: utcIso,
      name: 'Ada',
    });
  });

  it('decodes UTC ISO strings back to CalendarDate', () => {
    const decoded = decodeCalendarDateValues({
      date: utcIso,
      name: 'Ada',
    });

    expect(decoded.date).toEqual(februaryThird);
    expect(decoded.name).toBe('Ada');
  });

  it('interprets CalendarDate midnight in a given time zone', () => {
    const encoded = encodeCalendarDateValues(
      { date: februaryThird },
      'Asia/Jakarta',
    );

    expect(encoded).toEqual({
      date: '2022-02-02T17:00:00.000Z',
    });
    expect(
      decodeCalendarDateValues(encoded, 'Asia/Jakarta').date,
    ).toEqual(februaryThird);
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
        end: '2026-09-20T00:00:00.000Z',
        start: '2026-09-15T00:00:00.000Z',
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
      nested: { created: '2026-09-15T00:00:00.000Z' },
      period: {
        end: '2026-09-20T00:00:00.000Z',
        start: '2026-09-15T00:00:00.000Z',
      },
    });
    expect(values.nested.created).toBeInstanceOf(CalendarDate);
    expect(decodeCalendarDateValues(encoded)).toEqual(values);
  });

  it('encodes CalendarDateTime as a UTC ISO instant', () => {
    const dateTime = new CalendarDateTime(2022, 2, 3, 14, 30);

    expect(encodeCalendarDateValues({ deadline: dateTime })).toEqual({
      deadline: dateTime.toDate('UTC').toISOString(),
    });
  });

  it('leaves unrelated and date-only strings unchanged', () => {
    const values = { sku: 'ABC-123', year: '2022', calendar: '2022-02-03' };

    expect(encodeCalendarDateValues(values)).toEqual(values);
    expect(decodeCalendarDateValues(values)).toEqual(values);
  });

  it('parses ISO instants with parseAbsolute', () => {
    const decoded = decodeCalendarDateValues({ date: utcIso });

    expect(decoded.date).toEqual(
      toCalendarDate(parseAbsolute(utcIso, 'UTC')),
    );
  });
});
