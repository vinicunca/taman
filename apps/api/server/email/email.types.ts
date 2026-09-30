import type { EmailJob } from '@taman/emails';

export interface EmailAddress {
  email: string;
  name?: string;
}

export interface OutgoingEmail {
  to: string;
  from: EmailAddress;
  subject: string;
  html: string;
  text: string;
}

export interface EmailSender {
  send: (email: OutgoingEmail) => Promise<void>;
}

export interface EmailDispatcher {
  dispatch: (job: EmailJob) => Promise<void>;
}

export type DeliverEmail = (job: EmailJob) => Promise<void>;

export interface SendEmailBinding {
  send: (message: {
    to: string;
    from: string | EmailAddress;
    subject: string;
    html?: string;
    text?: string;
  }) => Promise<unknown>;
}

export interface EmailQueueBinding {
  send: (message: EmailJob) => Promise<void>;
}

export interface EmailEnv {
  EMAIL?: SendEmailBinding;
  EMAIL_QUEUE?: EmailQueueBinding;
}

export interface EmailServiceConfig {
  emailFrom: string;
  emailFromName?: string;
}
