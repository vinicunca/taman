// @unocss-include
import type { PThemeCollapsible } from 'pohon-ui';

export const themeCollapsible = {
  slots: {
    content: 'data-[state=closed]:overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down',
  },
} satisfies PThemeCollapsible;
