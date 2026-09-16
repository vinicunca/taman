// @unocss-include

import type { PThemeCollapsible } from 'pohon-ui';

export const collapsible = {
  slots: {
    root: '',
    content: 'data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up overflow-hidden transition-all p-1 -mx-1',
  },
} satisfies PThemeCollapsible;
