// @unocss-include
import type { PThemeLink } from 'pohon-ui';

export const themeLink = {
  base: 'outline-primary/25 rounded-md focus-visible:outline-3',
  variants: {
    active: {
      true: 'color-primary',
      false: 'color-text-muted',
    },
    disabled: {
      true: 'opacity-75 cursor-not-allowed',
    },
  },
  compoundVariants: [
    {
      active: false,
      disabled: false,
      class: 'hover:color-text transition-colors',
    },
  ],
} as PThemeLink;
