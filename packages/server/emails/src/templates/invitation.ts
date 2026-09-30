import type { EmailLocale } from '../types.ts';
import { emailCopy } from '../copy.ts';
import { formatEmailDate } from '../format.ts';
import template from '../generated/invitation.ts';
import { renderCompiled } from '../render.ts';

export interface InvitationParams {
  inviterName: string;
  inviterEmail: string;
  organizationName: string;
  role: string;
  inviteUrl: string;
  expiresAt: string;
}

export function renderInvitation(params: InvitationParams, locale: EmailLocale) {
  return renderCompiled({
    compiled: template,
    copy: emailCopy[locale].invitation,
    vars: { ...params, expiresAt: formatEmailDate(params.expiresAt, locale) },
    urls: { actionUrl: params.inviteUrl },
  });
}
