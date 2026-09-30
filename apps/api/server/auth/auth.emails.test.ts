// @vitest-environment node
import { renderEmail } from '@taman/emails';
import { describe, expect, it } from 'vitest';
import {
  buildAppUrl,
  emailLocale,
  invitationEmailJob,
  resetPasswordEmailJob,
  verifyEmailJob,
} from './auth.emails.ts';

const invitationData = {
  id: 'inv/1',
  email: 'new@user.test',
  role: 'admin,member',
  organization: { name: 'Acme' },
  invitation: { expiresAt: new Date('2026-10-01T10:00:00.000Z') },
  inviter: { user: { name: 'Ana', email: 'ana@org.test' } },
};

describe('buildAppUrl', () => {
  it.each([
    ['https://app.test', 'auth/x', 'https://app.test/auth/x'],
    ['https://app.test/', '/auth/x', 'https://app.test/auth/x'],
    ['https://app.test/admin', 'auth/x', 'https://app.test/admin/auth/x'],
    ['https://app.test/admin/', '/auth/x', 'https://app.test/admin/auth/x'],
  ])('%s + %s → %s', (base, path, expected) => {
    expect(buildAppUrl(base, path)).toBe(expected);
  });

  it('fails loudly when NITRO_APP_URL is empty', () => {
    expect(() => buildAppUrl('', 'auth/x')).toThrow(/NITRO_APP_URL/);
  });
});

describe('emailLocale', () => {
  it('uses the request Accept-Language', () => {
    const request = new Request('https://api.test', { headers: { 'accept-language': 'id-ID,id;q=0.9' } });

    expect(emailLocale(request)).toBe('id-ID');
  });

  it('defaults to en-US without a request', () => {
    expect(emailLocale()).toBe('en-US');
  });
});

describe('invitationEmailJob', () => {
  it('maps Better Auth invitation data to an invitation job', () => {
    expect(invitationEmailJob(invitationData, { appUrl: 'https://app.test/admin', locale: 'en-US' })).toEqual({
      template: 'invitation',
      to: 'new@user.test',
      locale: 'en-US',
      params: {
        inviterName: 'Ana',
        inviterEmail: 'ana@org.test',
        organizationName: 'Acme',
        role: 'admin, member',
        inviteUrl: 'https://app.test/admin/auth/accept-invitation/inv%2F1',
        expiresAt: '2026-10-01T10:00:00.000Z',
      },
    });
  });

  it('produces a job the package renders with the accept link', () => {
    const email = renderEmail(invitationEmailJob(invitationData, { appUrl: 'https://app.test', locale: 'en-US' }));

    expect(email.html).toContain('href="https://app.test/auth/accept-invitation/inv%2F1"');
  });
});

describe('verifyEmailJob / resetPasswordEmailJob', () => {
  const data = { user: { email: 'ana@user.test', name: 'Ana' }, url: 'https://api.test/api/auth/verify-email?token=t1' };

  it('passes the Better Auth link through', () => {
    expect(verifyEmailJob(data, 'id-ID')).toEqual({
      template: 'verify-email',
      to: 'ana@user.test',
      locale: 'id-ID',
      params: { name: 'Ana', verifyUrl: 'https://api.test/api/auth/verify-email?token=t1' },
    });
    expect(resetPasswordEmailJob(data, 'en-US')).toEqual({
      template: 'reset-password',
      to: 'ana@user.test',
      locale: 'en-US',
      params: { name: 'Ana', resetUrl: 'https://api.test/api/auth/verify-email?token=t1' },
    });
  });
});
