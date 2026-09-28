import { parseTime, Time } from '@internationalized/date';
import { isPlainObject, isString } from '@vinicunca/perkakas';

export function isTimeValue(value: unknown): value is Time {
  return value instanceof Time;
}

function parseIsoTime(value: string): Time | undefined {
  try {
    return parseTime(value);
  } catch {
    return undefined;
  }
}

function transformTimeValue(
  value: unknown,
  phase: 'decode' | 'encode',
): unknown {
  if (value == null) {
    return value;
  }

  if (phase === 'encode' && isTimeValue(value)) {
    return value.toString();
  }

  if (phase === 'decode' && isString(value)) {
    return parseIsoTime(value) ?? value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => transformTimeValue(item, phase));
  }

  if (isPlainObject(value)) {
    const next: Record<string, unknown> = {};
    for (const [key, item] of Object.entries(value)) {
      next[key] = transformTimeValue(item, phase);
    }
    return next;
  }

  return value;
}

export function encodeTimeValues<T>(values: T): T {
  return transformTimeValue(values, 'encode') as T;
}

export function decodeTimeValues<T>(values: T): T {
  return transformTimeValue(values, 'decode') as T;
}

export function createTimeCodec() {
  return {
    decode: <T>(values: T) => decodeTimeValues(values),
    encode: <T>(values: T) => encodeTimeValues(values),
  };
}
