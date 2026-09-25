import type { ZonedDateTime } from '@internationalized/date';
import {
  getLocalTimeZone,
  now,
  parseAbsolute,
  today,
} from '@internationalized/date';

type FormatDate = Date | number | string;

type Format
  = | 'HH'
    | 'HH:mm'
    | 'HH:mm:ss'
    | 'YYYY'
    | 'YYYY-MM'
    | 'YYYY-MM-DD'
    | 'YYYY-MM-DD HH'
    | 'YYYY-MM-DD HH:mm'
    | 'YYYY-MM-DD HH:mm:ss'
    | (string & {});

export interface TimezoneOption {
  label: string;
  offset: number;
  value: string;
}

export function formatDate(time?: FormatDate | null, format: Format = 'YYYY-MM-DD') {
  if (time === undefined || time === null || time === '') {
    return '';
  }

  try {
    const date = time instanceof Date ? time : new Date(time);
    if (Number.isNaN(date.getTime())) {
      throw new TypeError('Invalid date');
    }

    const zoned = parseAbsolute(date.toISOString(), getCurrentTimezone());
    return applyFormat(zoned, format);
  } catch (error) {
    console.error(`Error formatting date: ${error}`);
    return String(time ?? '');
  }
}

export function formatDateTime(time?: FormatDate | null) {
  return formatDate(time, 'YYYY-MM-DD HH:mm:ss');
}

/**
 * Gets the current system timezone.
 * @returns The current timezone.
 * @see https://react-aria.adobe.com/internationalized/date/ZonedDateTime#getlocaltimezone
 */
export function getSystemTimezone() {
  return getLocalTimeZone();
}

/**
 * Custom configured timezone.
 */
let currentTimezone = getSystemTimezone();

/**
 * Sets the default timezone used by date formatters.
 * @param timezone
 */
export function setCurrentTimezone(timezone?: string) {
  currentTimezone = timezone || getSystemTimezone();
}

/**
 * Gets the configured timezone.
 * @returns The configured timezone.
 */
export function getCurrentTimezone() {
  return currentTimezone;
}

let timezoneOptionsCacheKey: string | undefined;
let timezoneOptionsCache: Array<TimezoneOption> | undefined;

/**
 * Lists IANA timezones with localized offset labels.
 * Cached per locale and local calendar date (offsets change with DST).
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/supportedValuesOf
 */
export function getTimezoneOptions(locale = 'en-US'): Array<TimezoneOption> {
  const cacheKey = `${locale}:${today(getLocalTimeZone()).toString()}`;
  if (timezoneOptionsCache && timezoneOptionsCacheKey === cacheKey) {
    return timezoneOptionsCache;
  }

  timezoneOptionsCache = Intl.supportedValuesOf('timeZone')
    .map((timeZone) => {
      const offsetName
        = new Intl.DateTimeFormat(locale, {
          timeZone,
          timeZoneName: 'shortOffset',
        })
          .formatToParts(new Date())
          .find((part) => part.type === 'timeZoneName')
          ?.value ?? '';

      return {
        label: `${timeZone} (${offsetName})`,
        offset: now(timeZone).offset,
        value: timeZone,
      };
    })
    .sort((a, b) => a.offset - b.offset || a.value.localeCompare(b.value));

  timezoneOptionsCacheKey = cacheKey;
  return timezoneOptionsCache;
}

function applyFormat(zoned: ZonedDateTime, format: string) {
  return format
    .replaceAll('YYYY', pad(zoned.year, 4))
    .replaceAll('MM', pad(zoned.month))
    .replaceAll('DD', pad(zoned.day))
    .replaceAll('HH', pad(zoned.hour))
    .replaceAll('mm', pad(zoned.minute))
    .replaceAll('ss', pad(zoned.second));
}

function pad(value: number, length = 2) {
  return String(value).padStart(length, '0');
}
