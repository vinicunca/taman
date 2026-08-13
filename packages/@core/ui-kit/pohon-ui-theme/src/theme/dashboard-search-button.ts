// @unocss-include

import type { PThemeDashboardSearchButton } from 'pohon-ui';

export const dashboardSearchButton = {
  slots: {
    base: '',
    label: '',
    trailing: 'hidden lg:flex items-center gap-0.5 ms-auto',
  },
  variants: {
    collapsed: {
      true: {
        label: 'hidden',
        trailing: 'lg:hidden',
      },
    },
  },
} satisfies PThemeDashboardSearchButton;
