// @unocss-include

import type { PThemeHeader } from 'pohon-ui';

export const themeHeader = {
  slots: {
    root: 'bg-background/75 border-border border-b h-$ui-header-height top-0 sticky z-50 backdrop-blur-sm',
    container: 'flex gap-3 h-full items-center justify-between',
    left: 'flex gap-1.5 items-center lg:flex-1',
    center: 'hidden lg:flex',
    right: 'flex gap-1.5 items-center justify-end lg:flex-1',
    title: 'color-text-highlighted text-xl font-700 flex shrink-0 gap-1.5 items-end',
    toggle: 'lg:hidden',
    content: 'lg:hidden',
    overlay: 'lg:hidden',
    header: 'px-4 flex shrink-0 gap-3 h-$ui-header-height items-center justify-between sm:px-6',
    body: 'p-4 overflow-y-auto sm:p-6',
  },
  variants: {
    toggleSide: {
      left: {
        toggle: '-ms-1.5',
      },
      right: {
        toggle: '-me-1.5',
      },
    },
  },
} satisfies PThemeHeader;
