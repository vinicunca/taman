// @unocss-include

import type { PThemeDashboardSearch } from 'pohon-ui';

export const dashboardSearch = {
  slots: {
    modal: '',
    input: '',
  },
  variants: {
    fullscreen: {
      false: {
        modal: 'sm:max-w-3xl h-full sm:h-[28rem]',
      },
    },
    size: {
      xs: {},
      sm: {},
      md: {},
      lg: {},
      xl: {},
    },
  },
} satisfies PThemeDashboardSearch;
