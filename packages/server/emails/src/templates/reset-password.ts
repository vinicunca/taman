import type { EmailLocale } from '../types.ts';
import { emailCopy } from '../copy.ts';
import template from '../generated/reset-password.ts';
import { renderCompiled } from '../render.ts';

export interface ResetPasswordParams {
  name: string;
  resetUrl: string;
}

export function renderResetPassword(params: ResetPasswordParams, locale: EmailLocale) {
  return renderCompiled({
    compiled: template,
    copy: emailCopy[locale].resetPassword,
    vars: params,
    urls: { actionUrl: params.resetUrl },
  });
}
