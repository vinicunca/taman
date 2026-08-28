// @unocss-include

import type { PThemePageLinks } from 'pohon-ui';

export const pageLinks = {
  slots: {
    root: 'flex flex-col gap-3',
    title: 'text-sm font-600 flex items-center gap-1.5',
    list: 'flex flex-col gap-2',
    item: 'relative',
    link: 'group text-sm flex items-center gap-1.5 focus-visible:outline-primary',
    linkLeadingIcon: 'size-5 shrink-0',
    linkLabel: 'truncate',
    linkLabelExternalIcon: 'size-3 absolute top-0 color-text-dimmed',
  },
  variants: {
    active: {
      true: {
        link: 'color-primary font-medium',
      },
      false: {
        link: 'color-text-muted hover:color-text transition-colors',
      },
    },
  },
} satisfies PThemePageLinks;
