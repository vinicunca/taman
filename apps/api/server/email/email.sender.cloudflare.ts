import type { EmailSender, SendEmailBinding } from './email.types.ts';

/** Cloudflare Email Service through the Worker's `send_email` binding. */
export function createCloudflareEmailSender(binding: SendEmailBinding): EmailSender {
  return {
    async send(email) {
      await binding.send({
        to: email.to,
        // Cloudflare's address object requires a name; send a bare address without one.
        from: email.from.name ? { email: email.from.email, name: email.from.name } : email.from.email,
        subject: email.subject,
        html: email.html,
        text: email.text,
      });
    },
  };
}
