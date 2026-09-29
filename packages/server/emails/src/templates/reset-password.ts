import template from '../generated/reset-password.ts';
import { emailCopy } from '../copy.ts';
import { renderCompiled } from '../render.ts';
import type { EmailLocale } from '../types.ts';

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
