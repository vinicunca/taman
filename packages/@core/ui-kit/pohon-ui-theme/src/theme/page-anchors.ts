// @unocss-include

import type { PThemePageAnchors } from 'pohon-ui';

export const pageAnchors = {
  slots: {
    root: '',
    list: '',
    item: 'relative',
    link: 'group text-sm flex items-center gap-1.5 py-1 focus-visible:outline-primary',
    linkLeading: 'rounded-md p-1 inline-flex ring-inset ring',
    linkLeadingIcon: 'size-4 shrink-0',
    linkLabel: 'truncate',
    linkLabelExternalIcon: 'size-3 absolute top-0 color-text-dimmed',
  },
  variants: {
    active: {
      true: {
        link: 'color-primary font-semibold',
        linkLeading: 'bg-primary ring-primary color-text-inverted',
      },
      false: {
        link: 'color-text-muted hover:color-text font-medium transition-colors',
        linkLeading: 'bg-background-elevated/50 ring-ring-accented color-text-dimmed group-hover:bg-primary group-hover:ring-primary group-hover:color-text-inverted transition',
      },
    },
  },
} satisfies PThemePageAnchors;
