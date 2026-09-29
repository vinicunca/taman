import { consola } from 'consola';
import type { EmailSender, OutgoingEmail } from './email.types.ts';

export function createConsoleEmailSender(log: (...args: unknown[]) => void = consola.log): EmailSender {
  return {
    async send(email: OutgoingEmail) {
      log('[EMAIL]', `to=${email.to}`, `subject: ${email.subject}`, `\n${email.text}`);
    },
  };
}
