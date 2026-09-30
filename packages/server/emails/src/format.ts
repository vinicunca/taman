import type { EmailLocale } from './types.ts';
import { EmailJobError } from './errors.ts';

/**
 * Long date and time in UTC, e.g. "October 1, 2026 at 10:00 AM UTC".
 * The recipient's timezone is unknown, so the zone is always stated.
 * An invalid date is an `EmailJobError`: a queued job with a bad
 * `expiresAt` can never render, so it must not be retried.
 */
export function formatEmailDate(iso: string, locale: EmailLocale): string {
  const date = new Date(iso);

  if (Number.isNaN(date.getTime())) {
    throw new EmailJobError(`Invalid email date: ${String(iso)}`);
  }

  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'UTC',
    timeZoneName: 'short',
  }).format(date);
}
