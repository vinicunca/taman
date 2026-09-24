import { getLocalTimeZone, now } from '@internationalized/date';

/**
 * Formats the current local time.
 * Supports the YYYY, MM, DD, HH, mm and ss tokens.
 * @param format
 */
function formatNow(format: string) {
  const zoned = now(getLocalTimeZone());

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

export { formatNow };
