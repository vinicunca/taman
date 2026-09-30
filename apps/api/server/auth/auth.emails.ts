import type { EmailJob, EmailLocale } from '@taman/emails';
import { matchEmailLocale } from '@taman/emails';

export function buildAppUrl(base: string, path: string): string {
  if (!base.trim()) {
    throw new Error('NITRO_APP_URL is required to build invitation links');
  }
  const url = new URL(base);
  const basePath = url.pathname.replace(/\/+$/, '');
  const childPath = path.replace(/^\/+/, '');
  url.pathname = `${basePath}/${childPath}`.replace(/\/{2,}/g, '/');
  url.search = '';
  url.hash = '';
  return url.toString().replace(/\/$/, '');
}

export function emailLocale(request?: Request | null): EmailLocale {
  return matchEmailLocale(request?.headers.get('accept-language'));
}

interface InvitationEmailData {
  id: string;
  email: string;
  role: string;
  organization: { name: string };
  inviter: { user: { name: string; email: string } };
  invitation: { expiresAt: Date | string };
}

export function invitationEmailJob(data: InvitationEmailData, options: { appUrl: string; locale: EmailLocale }): EmailJob {
  return {
    template: 'invitation',
    to: data.email,
    locale: options.locale,
    params: {
      inviterName: data.inviter.user.name,
      inviterEmail: data.inviter.user.email,
      organizationName: data.organization.name,
      role: data.role.split(',').map((role) => role.trim()).filter(Boolean).join(', '),
      inviteUrl: buildAppUrl(options.appUrl, `auth/accept-invitation/${encodeURIComponent(data.id)}`),
      expiresAt: new Date(data.invitation.expiresAt).toISOString(),
    },
  };
}

interface AuthLinkEmailData {
  user: { email: string; name: string };
  url: string;
}

export function verifyEmailJob(data: AuthLinkEmailData, locale: EmailLocale): EmailJob {
  return { template: 'verify-email', to: data.user.email, locale, params: { name: data.user.name, verifyUrl: data.url } };
}

export function resetPasswordEmailJob(data: AuthLinkEmailData, locale: EmailLocale): EmailJob {
  return { template: 'reset-password', to: data.user.email, locale, params: { name: data.user.name, resetUrl: data.url } };
}
