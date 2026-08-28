// @unocss-include

import type { PThemeFooterColumns } from 'pohon-ui';

export const footerColumns = {
  slots: {
    root: 'xl:grid xl:grid-cols-3 xl:gap-8',
    left: 'mb-10 xl:mb-0',
    center: 'flex flex-col lg:grid grid-flow-col auto-cols-fr gap-8 xl:col-span-2',
    right: 'mt-10 xl:mt-0',
    label: 'text-sm font-600',
    list: 'mt-6 space-y-4',
    item: 'relative',
    link: 'group text-sm flex items-center gap-1.5 focus-visible:outline-primary',
    linkLeadingIcon: 'size-5 shrink-0',
    linkLabel: 'truncate',
    linkLabelExternalIcon: 'size-3 absolute top-0 color-text-dimmed inline-block',
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
} satisfies PThemeFooterColumns;
