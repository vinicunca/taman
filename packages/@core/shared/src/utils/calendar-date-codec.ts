import type { DateValue } from '@internationalized/date';
import {
  CalendarDate,
  CalendarDateTime,
  parseAbsolute,
  toCalendarDate,
  ZonedDateTime,
} from '@internationalized/date';
import { isPlainObject, isString } from '@vinicunca/perkakas';

export type { DateValue };
export { CalendarDate };

export interface CalendarDateCodecOptions {
  timeZone?: string;
}

const DEFAULT_TIME_ZONE = 'UTC';

export function isDateValue(value: unknown): value is DateValue {
  return (
    value instanceof CalendarDate
    || value instanceof CalendarDateTime
    || value instanceof ZonedDateTime
  );
}

function toUtcIsoString(value: DateValue, timeZone: string): string {
  if (value instanceof ZonedDateTime) {
    return value.toDate().toISOString();
  }

  return value.toDate(timeZone).toISOString();
}

function parseUtcIsoString(
  value: string,
  timeZone: string,
): DateValue | undefined {
  try {
    return toCalendarDate(parseAbsolute(value, timeZone));
  } catch {
    return undefined;
  }
}

function transformCalendarDateValue(
  value: unknown,
  phase: 'decode' | 'encode',
  timeZone: string,
): unknown {
  if (value == null) {
    return value;
  }

  if (phase === 'encode' && isDateValue(value)) {
    return toUtcIsoString(value, timeZone);
  }

  if (phase === 'decode' && isString(value)) {
    return parseUtcIsoString(value, timeZone) ?? value;
  }

  if (Array.isArray(value)) {
    return value.map((item) =>
      transformCalendarDateValue(item, phase, timeZone),
    );
  }

  if (isPlainObject(value)) {
    const next: Record<string, unknown> = {};
    for (const [key, item] of Object.entries(value)) {
      next[key] = transformCalendarDateValue(item, phase, timeZone);
    }
    return next;
  }

  return value;
}

export function encodeCalendarDateValues<T>(
  values: T,
  timeZone: string = DEFAULT_TIME_ZONE,
): T {
  return transformCalendarDateValue(values, 'encode', timeZone) as T;
}

export function decodeCalendarDateValues<T>(
  values: T,
  timeZone: string = DEFAULT_TIME_ZONE,
): T {
  return transformCalendarDateValue(values, 'decode', timeZone) as T;
}

export function createCalendarDateCodec(
  options: CalendarDateCodecOptions = {},
) {
  const timeZone = options.timeZone ?? DEFAULT_TIME_ZONE;

  return {
    decode: <T>(values: T) => decodeCalendarDateValues(values, timeZone),
    encode: <T>(values: T) => encodeCalendarDateValues(values, timeZone),
  };
}
