// @unocss-include
import type { PThemeError } from 'pohon-ui';

export const themeError = {
  slots: {
    root: 'text-center flex flex-col min-h-[calc(100vh-var(--taman-header-height))] items-center justify-center',
    leading: 'mb-4 flex items-center justify-center',
    leadingIcon: 'color-primary shrink-0 size-10',
    statusCode: 'text-base color-primary font-600',
    statusMessage: 'text-4xl color-text-highlighted font-700 mt-2 text-balance sm:text-5xl',
    message: 'text-lg color-text-muted mt-4 text-balance',
    links: 'mt-8 flex gap-6 items-center justify-center',
  },
} satisfies PThemeError;
