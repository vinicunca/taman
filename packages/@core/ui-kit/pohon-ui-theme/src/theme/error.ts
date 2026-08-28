// @unocss-include

import type { PThemeError } from 'pohon-ui';

export const error = {
  slots: {
    root: 'min-h-[calc(100vh-var(--taman-header-height))] flex flex-col items-center justify-center text-center',
    leading: 'mb-4 flex items-center justify-center',
    leadingIcon: 'size-10 shrink-0 color-primary',
    statusCode: 'text-base font-600 color-primary',
    statusMessage: 'mt-2 text-4xl sm:text-5xl font-bold color-text-highlighted text-balance',
    message: 'mt-4 text-lg color-text-muted text-balance',
    links: 'mt-8 flex items-center justify-center gap-6',
  },
} satisfies PThemeError;
