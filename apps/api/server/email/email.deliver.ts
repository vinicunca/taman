import type { EmailJob } from '@taman/emails';
import type { DeliverEmail, EmailAddress, EmailSender } from './email.types.ts';
import { EmailJobError, renderEmail } from '@taman/emails';

export function createEmailDeliverer(options: { sender: EmailSender; from: EmailAddress }): DeliverEmail {
  return async (job: EmailJob) => {
    if (!options.from.email.trim()) {
      throw new Error('NITRO_EMAIL_FROM is required to deliver email');
    }
    if (!job || typeof job.to !== 'string' || !/^[^\s@]+@[^\s@][^\s.@]*\.[^\s@]+$/.test(job.to)) {
      throw new EmailJobError('Email recipient is invalid');
    }
    const rendered = renderEmail(job);
    await options.sender.send({ to: job.to, from: options.from, ...rendered });
  };
}
