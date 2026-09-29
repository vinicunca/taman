import template from '../generated/verify-email.ts';
import { emailCopy } from '../copy.ts';
import { renderCompiled } from '../render.ts';
import type { EmailLocale } from '../types.ts';

export interface VerifyEmailParams {
  name: string;
  verifyUrl: string;
}

export function renderVerifyEmail(params: VerifyEmailParams, locale: EmailLocale) {
  return renderCompiled({
    compiled: template,
    copy: emailCopy[locale].verifyEmail,
    vars: params,
    urls: { actionUrl: params.verifyUrl },
  });
}
