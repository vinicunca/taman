/**
 * Login page URL path
 */
export const LOGIN_PATH = '/auth/login';

/**
 * Onboarding page URL path — where non-admin users without an active
 * organization are sent to create one or accept a pending invitation.
 */
export const ONBOARDING_PATH = '/onboarding';

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
