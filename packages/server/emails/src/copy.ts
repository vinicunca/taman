import type { EmailLocale } from './types.ts';
import enUS from './locales/en-US.json';
import idID from './locales/id-ID.json';

export interface EmailCopyEntry {
  subject: string;
  [key: string]: string;
}

export type EmailCopy = Record<'invitation' | 'verifyEmail' | 'resetPassword', EmailCopyEntry>;

export const emailCopy: Record<EmailLocale, EmailCopy> = { 'en-US': enUS, 'id-ID': idID };
