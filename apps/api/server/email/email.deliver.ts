import type { DeliverEmail, EmailAddress, EmailSender } from './email.types.ts';
import type { EmailJob } from '@taman/emails';
import { EmailJobError, renderEmail } from '@taman/emails';

/**
 * Minimal `local@domain.tld` check: one `@`, no whitespace, a non-empty
 * local part and a dotted domain without empty labels. Split-based, so it
 * runs in linear time on any queue body.
 */
export function isEmailAddress(value: unknown): value is string {
  if (typeof value !== 'string' || value === '' || /\s/.test(value)) {
    return false;
  }

  const parts = value.split('@');
  if (parts.length !== 2) {
    return false;
  }

  const [local = '', domain = ''] = parts;
  const labels = domain.split('.');

  return local !== '' && labels.length >= 2 && labels.every((label) => label !== '');
}

/**
 * Renders one job and hands it to the sender. A missing from-address is a
 * plain `Error` (config can be fixed, so the queue retries). A job that can
 * never render or has no valid recipient is an `EmailJobError`.
 */
export function createEmailDeliverer(options: { sender: EmailSender; from: EmailAddress }): DeliverEmail {
  return async (job: EmailJob) => {
    if (!options.from.email.trim()) {
      throw new Error('NITRO_EMAIL_FROM is required to deliver email');
    }
    const to: unknown = (job as { to?: unknown } | null)?.to;
    if (!isEmailAddress(to)) {
      throw new EmailJobError('Email recipient is invalid');
    }
    const rendered = renderEmail(job);
    await options.sender.send({ to, from: options.from, ...rendered });
  };
}
