// @unocss-include

import type { PThemeInputRating } from 'pohon-ui';
import { POHON_THEME_BRANDS } from '../constants.ts';

export const themeInputRating = {
  slots: {
    root: '',
    item: 'rounded-sm inline-block cursor-pointer select-none transition relative has-focus-visible:outline-3',
    indicator: 'text-transparent outline-none opacity-$akar-rating-item-step-opacity w-$akar-rating-item-step-width inset-0 absolute z-$akar-rating-item-step-z-index overflow-hidden',
    icon: 'block',
    emptyIcon: 'color-text-muted h-full w-full block pointer-events-none',
  },
  variants: {
    orientation: {
      horizontal: {
        root: 'inline-flex gap-0.5 items-center',
      },
      vertical: {
        root: 'inline-flex flex-col gap-0.5 items-center',
      },
    },
    size: {
      xs: {
        item: 'size-3',
        icon: 'size-3',
      },
      sm: {
        item: 'size-4',
        icon: 'size-4',
      },
      md: {
        item: 'size-5',
        icon: 'size-5',
      },
      lg: {
        item: 'size-6',
        icon: 'size-6',
      },
      xl: {
        item: 'size-7',
        icon: 'size-7',
      },
    },
    color: {
      ...Object.fromEntries(POHON_THEME_BRANDS.map((color) => [color, {
        indicator: `data-[state=active]:color-${color}`,
        item: `outline-${color}/25`,
      }])),
      neutral: {
        indicator: 'data-[state=active]:color-text-highlighted',
        item: 'outline-outline-inverted/25',
      },
    },
    readonly: {
      true: {
        root: 'cursor-default',
        item: 'cursor-default',
      },
      false: {},
    },
    disabled: {
      true: {
        root: 'opacity-75 cursor-not-allowed',
        item: 'cursor-not-allowed pointer-events-none',
      },
      false: {},
    },
  },
  compoundVariants: [
    {
      readonly: false,
      disabled: false,
      class: {
        item: 'hover:scale-110',
      },
    },
  ],
} satisfies PThemeInputRating;
