// @unocss-include

import type { PThemeFooter } from 'pohon-ui';

export const themeFooter = {
  slots: {
    root: '',
    top: 'py-8 lg:py-12',
    bottom: 'py-8 lg:py-12',
    container: 'py-8 lg:(py-4 flex gap-x-3 items-center justify-between)',
    left: 'mt-3 flex gap-x-1.5 items-center justify-center lg:(mt-0 flex-1 justify-start order-1)',
    center: 'mt-3 flex items-center justify-center lg:(mt-0 order-2)',
    right: 'flex gap-x-1.5 items-center justify-center lg:(flex-1 justify-end order-3)',
  },
} satisfies PThemeFooter;

export const themeFooterColumns = {
  slots: {
    root: 'xl:gap-8 xl:grid xl:grid-cols-3',
    left: 'mb-10 xl:mb-0',
    center: 'flex flex-col gap-8 auto-cols-fr grid-flow-col lg:grid xl:col-span-2',
    right: 'mt-10 xl:mt-0',
    label: 'text-sm font-600',
    list: 'mt-6 space-y-4',
    item: 'relative',
    link: 'group outline-primary/25 text-sm rounded-sm flex gap-1.5 items-center focus-visible:outline-3',
    linkLeadingIcon: 'shrink-0 size-5',
    linkLabel: 'truncate',
    linkLabelExternalIcon: 'color-text-dimmed size-3 inline-block top-0 absolute',
  },
  variants: {
    active: {
      true: {
        link: 'color-primary font-500',
      },
      false: {
        link: 'color-text-muted hover:color-text transition-colors',
      },
    },
  },
};
