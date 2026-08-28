// @unocss-include

import type { PThemePageAside } from 'pohon-ui';

export const pageAside = {
  slots: {
    root: 'hidden overflow-y-auto lg:block lg:max-h-[calc(100vh-var(--taman-header-height))] lg:sticky lg:top-$ui-header-height py-8 lg:ps-4 lg:-ms-4 lg:pe-6.5',
    container: 'relative',
    top: 'sticky -top-8 -mt-8 pointer-events-none z-[1]',
    topHeader: 'h-8 bg-background -mx-4 px-4',
    topBody: 'bg-background relative pointer-events-auto flex flex-col -mx-4 px-4',
    topFooter: 'h-8 bg-gradient-to-b from-default -mx-4 px-4',
  },
} satisfies PThemePageAside;
