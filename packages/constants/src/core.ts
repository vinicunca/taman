export const LOGIN_PATH = '/auth/login';

export interface LanguageOption {
  label: string;
  value: 'en-US' | 'id-ID';
}

/**
 * Supported languages
 */
export const SUPPORT_LANGUAGES: Array<LanguageOption> = [
  {
    label: 'Indonesian',
    value: 'id-ID',
  },
  {
    label: 'English',
    value: 'en-US',
  },
];
