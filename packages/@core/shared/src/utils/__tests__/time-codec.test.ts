import { Time } from '@internationalized/date';
import { describe, expect, it } from 'vitest';

import {
  decodeTimeValues,
  encodeTimeValues,
  isTimeValue,
} from '../time-codec';

describe('time value codec', () => {
  it('round-trips Time values as ISO time strings', () => {
    const time = new Time(12, 30, 15);
    const encoded = encodeTimeValues({ time });

    expect(encoded).toEqual({ time: '12:30:15' });
    expect(decodeTimeValues(encoded)).toEqual({ time });
  });

  it('handles ranges and nested Time values without mutation', () => {
    const values = Object.freeze({
      nested: { reminder: new Time(8, 15) },
      period: {
        end: new Time(17, 30),
        start: new Time(9),
      },
    });

    expect(isTimeValue(values.period)).toBe(false);
    expect(encodeTimeValues(values)).toEqual({
      nested: { reminder: '08:15:00' },
      period: {
        end: '17:30:00',
        start: '09:00:00',
      },
    });
    expect(decodeTimeValues(encodeTimeValues(values))).toEqual(values);
    expect(values.period.start).toBeInstanceOf(Time);
  });

  it('leaves unrelated strings unchanged', () => {
    const values = { label: 'lunch', timestamp: '2026-09-16T12:30:00Z' };

    expect(encodeTimeValues(values)).toEqual(values);
    expect(decodeTimeValues(values)).toEqual(values);
  });
});
