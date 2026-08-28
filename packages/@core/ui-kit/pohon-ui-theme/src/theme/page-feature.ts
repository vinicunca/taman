// @unocss-include

import type { PThemePageFeature } from 'pohon-ui';

export const pageFeature = {
  slots: {
    root: 'relative rounded-sm',
    wrapper: '',
    leading: 'inline-flex items-center justify-center',
    leadingIcon: 'size-5 shrink-0 color-primary',
    title: 'text-base text-pretty font-600 color-text-highlighted',
    description: 'text-[15px] text-pretty color-text-muted',
  },
  variants: {
    orientation: {
      horizontal: {
        root: 'flex items-start gap-2.5',
        leading: 'p-0.5',
      },
      vertical: {
        leading: 'mb-2.5',
      },
    },
    to: {
      true: {
        root: 'has-focus-visible:ring-2 has-focus-visible:ring-primary transition',
      },
    },
    title: {
      true: {
        description: 'mt-1',
      },
    },
  },
} satisfies PThemePageFeature;
