// @unocss-include

import type { PThemeCollapsible } from 'pohon-ui';

export const collapsible = {
  slots: {
    root: '',
    content: 'data-[state=open]:animate-[collapsible-down_200ms_ease-out] data-[state=closed]:animate-[collapsible-up_200ms_ease-out] overflow-hidden',
  },
} satisfies PThemeCollapsible;
