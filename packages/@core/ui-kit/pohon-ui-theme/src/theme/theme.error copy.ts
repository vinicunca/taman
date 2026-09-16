// @unocss-include
import type { PThemeError } from 'pohon-ui';

export const themeError = {
  slots: {
    root: 'text-center flex flex-col min-h-[calc(100vh-var(--ui-header-height))] items-center justify-center',
    leading: 'mb-4 flex items-center justify-center',
    leadingIcon: 'color-primary shrink-0 size-10',
    statusCode: 'color-primary text-base font-600',
    statusMessage: 'color-text-highlighted text-4xl font-700 mt-2 text-balance sm:text-5xl',
    message: 'color-text-muted text-lg mt-4 text-balance',
    links: 'mt-8 flex gap-6 items-center justify-center',
  },
} satisfies PThemeError;
