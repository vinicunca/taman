// @unocss-include

import type { PThemeAvatar } from 'pohon-ui';
import { POHON_THEME_BRANDS } from '../constants.ts';

export const avatar = {
  slots: {
    root: 'inline-flex items-center justify-center shrink-0 select-none rounded-full align-middle',
    image: 'size-full rounded-inherit object-cover',
    fallback: 'font-medium truncate',
    icon: 'shrink-0',
  },
  variants: {
    color: {
      ...Object.fromEntries(POHON_THEME_BRANDS.map((color: string) => [color, {
        root: `bg-${color}/10`,
        fallback: `color-${color}`,
        icon: `color-${color}`,
      }])),
      neutral: {
        root: 'bg-background-elevated',
        fallback: 'color-text-muted',
        icon: 'color-text-muted',
      },
    },
    size: {
      '3xs': {
        root: 'size-4 text-[8px]',
      },
      '2xs': {
        root: 'size-5 text-[10px]',
      },
      'xs': {
        root: 'size-6 text-xs',
      },
      'sm': {
        root: 'size-7 text-sm',
      },
      'md': {
        root: 'size-8 text-base',
      },
      'lg': {
        root: 'size-9 text-lg',
      },
      'xl': {
        root: 'size-10 text-xl',
      },
      '2xl': {
        root: 'size-11 text-[22px]',
      },
      '3xl': {
        root: 'size-12 text-2xl',
      },
    },
  },
} satisfies PThemeAvatar;
