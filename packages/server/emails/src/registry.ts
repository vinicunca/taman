import { EmailJobError } from './errors.ts';
import { DEFAULT_EMAIL_LOCALE } from './types.ts';
import type { EmailLocale, RenderedEmail } from './types.ts';
import { renderInvitation } from './templates/invitation.ts';
import type { InvitationParams } from './templates/invitation.ts';
import { renderResetPassword } from './templates/reset-password.ts';
import type { ResetPasswordParams } from './templates/reset-password.ts';
import { renderVerifyEmail } from './templates/verify-email.ts';
import type { VerifyEmailParams } from './templates/verify-email.ts';

export interface EmailTemplateParams {
  invitation: InvitationParams;
  'verify-email': VerifyEmailParams;
  'reset-password': ResetPasswordParams;
}

export type EmailTemplateName = keyof EmailTemplateParams;

export type EmailJob = {
  [Name in EmailTemplateName]: {
    template: Name;
    to: string;
    locale: EmailLocale;
    params: EmailTemplateParams[Name];
  }
}[EmailTemplateName];

const renderers: { [Name in EmailTemplateName]: (params: EmailTemplateParams[Name], locale: EmailLocale) => RenderedEmail } = {
  invitation: renderInvitation,
  'verify-email': renderVerifyEmail,
  'reset-password': renderResetPassword,
};

export function renderEmail(job: unknown): RenderedEmail {
  if (typeof job !== 'object' || job === null || Array.isArray(job)) {
    throw new EmailJobError('Email job must be an object');
  }
  const candidate = job as Record<string, unknown>;
  if (typeof candidate.template !== 'string' || !Object.hasOwn(renderers, candidate.template)) {
    throw new EmailJobError(`Unknown email template: ${String(candidate.template)}`);
  }
  if (typeof candidate.params !== 'object' || candidate.params === null || Array.isArray(candidate.params)) {
    throw new EmailJobError('Email params must be an object');
  }
  const locale = candidate.locale === 'id-ID' || candidate.locale === 'en-US' ? candidate.locale : DEFAULT_EMAIL_LOCALE;
  const renderer = renderers[candidate.template as EmailTemplateName] as unknown as (params: object, locale: EmailLocale) => RenderedEmail;
  return renderer(candidate.params, locale);
}
