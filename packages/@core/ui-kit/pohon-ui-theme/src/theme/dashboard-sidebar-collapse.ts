// @unocss-include

import type { PThemeDashboardSidebarCollapse } from 'pohon-ui';

export const dashboardSidebarCollapse = {
  base: 'hidden lg:flex',
  variants: {
    side: {
      left: '',
      right: '',
    },
  },
} satisfies PThemeDashboardSidebarCollapse;
