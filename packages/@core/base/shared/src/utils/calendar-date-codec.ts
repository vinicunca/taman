import type { DateValue } from '@internationalized/date';
import {
  CalendarDate,
  CalendarDateTime,
  parseDate,
  parseDateTime,
  parseZonedDateTime,
  ZonedDateTime,
} from '@internationalized/date';
import { isPlainObject, isString } from '@vinicunca/perkakas';

export function isDateValue(value: unknown): value is DateValue {
  return (
    value instanceof CalendarDate
    || value instanceof CalendarDateTime
    || value instanceof ZonedDateTime
  );
}

function parseIsoDateValue(value: string): DateValue | undefined {
  try {
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return parseDate(value);
    }

    if (value.includes('[')) {
      return parseZonedDateTime(value);
    }

    if (/^\d{4}-\d{2}-\d{2}T/.test(value)) {
      return parseDateTime(value);
    }
  } catch {
    return undefined;
  }

  return undefined;
}

function transformCalendarDateValue(
  value: unknown,
  phase: 'decode' | 'encode',
): unknown {
  if (value == null) {
    return value;
  }

  if (phase === 'encode' && isDateValue(value)) {
    return value.toString();
  }

  if (phase === 'decode' && isString(value)) {
    return parseIsoDateValue(value) ?? value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => transformCalendarDateValue(item, phase));
  }

  if (isPlainObject(value)) {
    const next: Record<string, unknown> = {};
    for (const [key, item] of Object.entries(value)) {
      next[key] = transformCalendarDateValue(item, phase);
    }
    return next;
  }

  return value;
}

export function encodeCalendarDateValues<T>(values: T): T {
  return transformCalendarDateValue(values, 'encode') as T;
}

export function decodeCalendarDateValues<T>(values: T): T {
  return transformCalendarDateValue(values, 'decode') as T;
}
