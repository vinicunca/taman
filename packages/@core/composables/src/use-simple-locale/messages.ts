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
    toggleSidebar: 'Toggle sidebar',
    confirmTitle: 'Please Confirm',
    showPassword: 'Show password',
    hidePassword: 'Hide password',
  },
  'id-ID': {
    cancel: 'Batal',
    collapse: 'Ciutkan',
    confirm: 'Konfirmasi',
    expand: 'Perluas',
    prompt: 'Pemberitahuan',
    reset: 'Atur Ulang',
    submit: 'Kirim',
    toggleSidebar: 'Alihkan sidebar',
    confirmTitle: 'Harap Konfirmasi',
    showPassword: 'Tampilkan password',
    hidePassword: 'Sembunyikan password',
  },
};

export const getMessages = (locale: Locale) => messages[locale];
