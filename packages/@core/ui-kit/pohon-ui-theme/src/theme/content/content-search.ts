// @unocss-include
import type { PThemeContentSearch } from 'pohon-ui';

export const contentSearch = {
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
} satisfies PThemeContentSearch;
