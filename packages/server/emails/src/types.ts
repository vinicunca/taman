export const EMAIL_LOCALES = ['en-US', 'id-ID'] as const;

export type EmailLocale = (typeof EMAIL_LOCALES)[number];

export const DEFAULT_EMAIL_LOCALE: EmailLocale = 'en-US';

export interface CompiledTemplate {
  readonly slots: readonly string[];
  readonly html: string;
  readonly text: string;
}

export interface RenderedEmail {
  subject: string;
  html: string;
  text: string;
}
