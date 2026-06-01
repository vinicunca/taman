export type Locale = 'en-US' | 'id-ID';

export const messages: Record<Locale, Record<string, string>> = {
  'en-US': {
    cancel: 'Cancel',
    collapse: 'Collapse',
    confirm: 'Confirm',
    expand: 'Expand',
    prompt: 'Prompt',
    reset: 'Reset',
    submit: 'Submit',
  },
  'id-ID': {
    cancel: 'batal',
    collapse: 'rapatkan',
    confirm: 'konfirmasi',
    expand: 'perluas',
    prompt: 'petunjuk',
    reset: 'ulang',
    submit: 'kirim',
  },
};

export const getMessages = (locale: Locale) => messages[locale];
