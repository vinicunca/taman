import type { DeliverEmail } from './email.types.ts';
import type { EmailJob } from '@taman/emails';
import { EmailJobError } from '@taman/emails';
import { logDeliveryError } from './email.log.ts';

export const EMAIL_QUEUE_NAME = 'taman-email';

export interface EmailQueueMessage {
  body: unknown;
  ack: () => void;
  retry: () => void;
}

export interface EmailQueueBatch {
  queue: string;
  messages: Array<EmailQueueMessage>;
}

export async function consumeEmailBatch(batch: EmailQueueBatch, deliver: DeliverEmail, onError = logDeliveryError): Promise<void> {
  for (const message of batch.messages) {
    try {
      if (typeof message.body !== 'object' || message.body === null) {
        throw new EmailJobError('Email queue message must contain an object');
      }
      const job = message.body as EmailJob;
      // One message at a time: keeps provider rate limits predictable and ack/retry per message.
      // eslint-disable-next-line no-await-in-loop
      await deliver(job);
      message.ack();
    } catch (error) {
      const body = message.body as Partial<EmailJob> | null;
      onError(typeof body?.template === 'string' ? body.template : 'unknown', typeof body?.to === 'string' ? body.to : '', error);
      if (error instanceof EmailJobError) {
        message.ack();
      } else {
        message.retry();
      }
    }
  }
}
