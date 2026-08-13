// @unocss-include

import type { PThemeDashboardSidebarToggle } from 'pohon-ui';

export const dashboardSidebarToggle = {
  base: 'lg:hidden',
  variants: {
    side: {
      left: '',
      right: '',
    },
  },
} satisfies PThemeDashboardSidebarToggle;
