import type { PThemeScrollArea } from 'pohon-ui';

// @unocss-include
export const themeScrollArea = {
  slots: {
    root: 'outline-primary/25 relative focus-visible:outline-3',
    viewport: 'flex relative',
    item: '',
  },
  variants: {
    orientation: {
      vertical: {
        root: 'overflow-x-hidden overflow-y-auto',
        viewport: 'flex-col',
        item: '',
      },
      horizontal: {
        root: 'overflow-x-auto overflow-y-hidden',
        viewport: 'flex-row',
        item: '',
      },
    },
    externalScroll: {
      true: {
        root: 'overflow-visible',
      },
    },
  },
} satisfies PThemeScrollArea;
