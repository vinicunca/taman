// @vitest-environment node
// cspell:ignore preheader mengundang bergabung dengan Anda Oktober Atur ulang kata sandi Taman
import type { EmailJob } from './registry.ts';
import type { EmailLocale } from './types.ts';
import { describe, expect, it } from 'vitest';
import { emailCopy } from './copy.ts';
import { EmailJobError } from './errors.ts';
import { formatEmailDate } from './format.ts';
import invitationCompiled from './generated/invitation.ts';
import resetPasswordCompiled from './generated/reset-password.ts';
import verifyEmailCompiled from './generated/verify-email.ts';
import { renderEmail } from './registry.ts';
import { EMAIL_LOCALES } from './types.ts';

const contracts = [
  { copyKey: 'invitation', compiled: invitationCompiled, urls: ['actionUrl'] },
  { copyKey: 'verifyEmail', compiled: verifyEmailCompiled, urls: ['actionUrl'] },
  { copyKey: 'resetPassword', compiled: resetPasswordCompiled, urls: ['actionUrl'] },
] as const;

describe.each(EMAIL_LOCALES)('%s copy', (locale) => {
  it.each(contracts)('fills exactly the slots of $copyKey', ({ copyKey, compiled, urls }) => {
    const { subject, ...slotCopy } = emailCopy[locale][copyKey];

    expect(subject).toBeTruthy();
    expect([...Object.keys(slotCopy), ...urls].sort()).toEqual([...compiled.slots]);
  });
});

describe('formatEmailDate', () => {
  it('formats in the recipient locale and says UTC', () => {
    expect(formatEmailDate('2026-10-01T10:00:00.000Z', 'en-US')).toContain('October');
    expect(formatEmailDate('2026-10-01T10:00:00.000Z', 'id-ID')).toContain('Oktober');
    expect(formatEmailDate('2026-10-01T10:00:00.000Z', 'en-US')).toContain('UTC');
  });

  it('throws EmailJobError for an invalid date', () => {
    expect(() => formatEmailDate('not a date', 'en-US')).toThrow(EmailJobError);
  });
});

describe('renderEmail', () => {
  const invitation = {
    template: 'invitation',
    to: 'new@user.test',
    locale: 'en-US',
    params: {
      inviterName: 'Ana <script>alert(1)</script>',
      inviterEmail: 'ana@org.test',
      organizationName: 'Acme & Co',
      role: 'admin',
      inviteUrl: 'https://app.test/auth/accept-invitation/inv_1',
      expiresAt: '2026-10-01T10:00:00.000Z',
    },
  } satisfies EmailJob;

  it('renders the invitation in English with escaped user input', () => {
    const email = renderEmail(invitation);

    expect(email.subject).toBe('Ana <script>alert(1)</script> invited you to join Acme & Co');
    expect(email.html).toContain('Ana &lt;script&gt;alert(1)&lt;/script&gt;');
    expect(email.html).not.toContain('<script>alert(1)');
    expect(email.html).toContain('Acme &amp; Co');
    expect(email.html).toContain('href="https://app.test/auth/accept-invitation/inv_1"');
    expect(email.html).not.toMatch(/\{\{/);
    expect(email.text).toContain('https://app.test/auth/accept-invitation/inv_1');
    expect(email.text).toContain('October');
    expect(email.text).not.toMatch(/\{\{/);
  });

  it('renders user-controlled names containing slot, param and $ tokens literally', () => {
    const email = renderEmail({
      ...invitation,
      params: { ...invitation.params, organizationName: '{{actionUrl}} {inviterName} $&' },
    });

    expect(email.subject).toBe('Ana <script>alert(1)</script> invited you to join {{actionUrl}} {inviterName} $&');
    expect(email.html).toContain('{{actionUrl}} {inviterName} $&amp;');
    expect(email.text).toContain('{{actionUrl}} {inviterName} $&');
  });

  it('renders Indonesian copy for id-ID', () => {
    const email = renderEmail({ ...invitation, locale: 'id-ID' });

    expect(email.subject).toBe('Ana <script>alert(1)</script> mengundang Anda bergabung dengan Acme & Co');
    expect(email.text).toContain('Oktober');
  });

  it('falls back to en-US for an unsupported locale', () => {
    expect(renderEmail({ ...invitation, locale: 'fr-FR' as EmailLocale }).subject)
      .toBe('Ana <script>alert(1)</script> invited you to join Acme & Co');
  });

  it('renders verify-email and reset-password with the Better Auth link', () => {
    const verify = renderEmail({
      template: 'verify-email',
      to: 'a@b.test',
      locale: 'en-US',
      params: { name: 'Ana', verifyUrl: 'https://api.test/api/auth/verify-email?token=t1&callbackURL=%2F' },
    });

    expect(verify.subject).toBe('Verify your Taman email address');
    expect(verify.html).toContain('href="https://api.test/api/auth/verify-email?token=t1&amp;callbackURL=%2F"');
    expect(verify.text).toContain('https://api.test/api/auth/verify-email?token=t1&callbackURL=%2F');

    const reset = renderEmail({
      template: 'reset-password',
      to: 'a@b.test',
      locale: 'id-ID',
      params: { name: 'Ana', resetUrl: 'https://api.test/api/auth/reset-password/t2?callbackURL=https%3A%2F%2Fapp.test%2Freset' },
    });

    expect(reset.subject).toBe('Atur ulang kata sandi Taman Anda');
    expect(reset.text).toContain('https://api.test/api/auth/reset-password/t2?callbackURL=https%3A%2F%2Fapp.test%2Freset');
  });

  it('rejects a non-http link', () => {
    expect(() => renderEmail({
      template: 'verify-email',
      to: 'a@b.test',
      locale: 'en-US',
      params: { name: 'Ana', verifyUrl: 'javascript:alert(1)' },
    })).toThrow(EmailJobError);
  });

  it('throws EmailJobError for an unknown template name, including prototype keys', () => {
    for (const template of ['welcome', 'toString', 'constructor', '__proto__']) {
      expect(() => renderEmail({ ...invitation, template } as unknown as EmailJob)).toThrow(EmailJobError);
    }
  });

  it('throws EmailJobError for missing or malformed params and jobs', () => {
    expect(() => renderEmail({ ...invitation, params: {} } as unknown as EmailJob)).toThrow(EmailJobError);
    expect(() => renderEmail({ ...invitation, params: null } as unknown as EmailJob)).toThrow(EmailJobError);
    expect(() => renderEmail(null as unknown as EmailJob)).toThrow(EmailJobError);
  });
});
