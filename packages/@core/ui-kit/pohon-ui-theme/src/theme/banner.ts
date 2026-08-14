// @unocss-include
import type { PThemeBanner } from 'pohon-ui';
import { POHON_THEME_BRANDS } from '../constants.ts';

export const banner = {
  slots: {
    root: 'relative z-50 w-full transition-colors',
    container: 'flex items-center justify-between gap-3 h-12',
    left: 'hidden lg:flex-1 lg:flex lg:items-center',
    center: 'flex items-center gap-1.5 min-w-0',
    right: 'lg:flex-1 flex items-center justify-end',
    icon: 'size-5 shrink-0 color-text-inverted pointer-events-none',
    title: 'text-sm color-text-inverted font-medium truncate',
    actions: 'flex gap-1.5 shrink-0 isolate',
    close: 'color-text-inverted hover:bg-background/10 focus-visible:bg-background/10 -me-1.5 lg:me-0',
  },
  variants: {
    color: {
      ...Object.fromEntries(POHON_THEME_BRANDS.map((color: string) => [color, {
        root: `bg-${color}`,
      }])),
      neutral: {
        root: 'bg-background-inverted',
      },
    },
    to: {
      true: '',
    },
  },
  compoundVariants: [
    ...POHON_THEME_BRANDS.map((color: string) => ({
      color,
      to: true,
      class: {
        root: `hover:bg-${color}/90`,
      },
    })),
    {
      color: 'neutral',
      to: true,
      class: {
        root: 'hover:bg-background-inverted/90',
      },
    },
  ],
} satisfies PThemeBanner;
