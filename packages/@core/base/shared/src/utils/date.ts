import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone.js';
import utc from 'dayjs/plugin/utc.js';

dayjs.extend(utc);
dayjs.extend(timezone);

type FormatDate = Date | dayjs.Dayjs | number | string;

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

export function formatDate(time?: FormatDate, format: Format = 'YYYY-MM-DD') {
  if (time === undefined || time === null || time === '') {
    return '';
  }
  try {
    const date = dayjs.isDayjs(time) ? time : dayjs(time);
    if (!date.isValid()) {
      throw new Error('Invalid date');
    }
    return date.tz().format(format);
  } catch (error) {
    console.error(`Error formatting date: ${error}`);
    return String(time ?? '');
  }
}

export function formatDateTime(time?: FormatDate) {
  return formatDate(time, 'YYYY-MM-DD HH:mm:ss');
}

export function isDayjsObject(value: any): value is dayjs.Dayjs {
  return dayjs.isDayjs(value);
}

/**
 * Gets the current system timezone.
 * @returns The current timezone.
 */
export function getSystemTimezone() {
  return dayjs.tz.guess();
}

/**
 * Custom configured timezone.
 */
let currentTimezone = getSystemTimezone();

/**
 * Sets the default timezone.
 * @param timezone
 */
export function setCurrentTimezone(timezone?: string) {
  currentTimezone = timezone || getSystemTimezone();
  dayjs.tz.setDefault(currentTimezone);
}

/**
 * Gets the configured timezone.
 * @returns The configured timezone.
 */
export function getCurrentTimezone() {
  return currentTimezone;
}
