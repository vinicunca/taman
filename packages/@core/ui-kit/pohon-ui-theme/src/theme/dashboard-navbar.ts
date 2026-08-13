// @unocss-include

import type { PThemeDashboardNavbar } from 'pohon-ui';

export const dashboardNavbar = {
  slots: {
    root: 'h-$ui-header-height shrink-0 flex items-center justify-between border-b border-border px-4 sm:px-6 gap-1.5',
    left: 'flex items-center gap-1.5 min-w-0',
    icon: 'shrink-0 size-5 self-center me-1.5',
    title: 'flex items-center gap-1.5 font-semibold color-text-highlighted truncate',
    center: 'hidden lg:flex',
    right: 'flex items-center shrink-0 gap-1.5',
    toggle: '',
  },
  variants: {
    toggleSide: {
      left: {
        toggle: '',
      },
      right: {
        toggle: '',
      },
    },
  },
} satisfies PThemeDashboardNavbar;
