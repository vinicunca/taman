/**
 * Login page URL path
 */
export const LOGIN_PATH = '/auth/login';

export interface LanguageOption {
  label: string;
  value: 'en-US' | 'id-ID';
  icon: string;
}

/**
 * Supported languages
 */
export const SUPPORTED_LANGUAGES: Array<LanguageOption> = [
  {
    label: 'English',
    value: 'en-US',
    icon: 'cif:gb',
  },
  {
    label: 'Bahasa Indonesia',
    value: 'id-ID',
    icon: 'cif:id',
  },
];
