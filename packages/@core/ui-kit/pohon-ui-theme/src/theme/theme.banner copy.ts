// @unocss-include
import type {
  PThemeBanner,
} from 'pohon-ui';
import { POHON_THEME_BRANDS } from '../constants.ts';

export const themeBanner = {
  slots: {
    root: 'w-full transition-colors relative z-50',
    container: 'flex gap-3 h-12 items-center justify-between',
    left: 'hidden lg:(flex flex-1 items-center)',
    center: 'flex gap-1.5 min-w-0 items-center',
    right: 'flex items-center justify-end lg:flex-1',
    icon: 'color-text-inverted shrink-0 size-5 pointer-events-none',
    title: 'color-text-inverted text-sm font-500 truncate',
    actions: 'flex shrink-0 gap-1.5 isolate',
    close: 'color-text-inverted hover:bg-background/10 focus-visible:bg-background/10 -me-1.5 lg:me-0',
  },
  variants: {
    color: {
      ...Object.fromEntries(POHON_THEME_BRANDS.map((color) => [color, {
        root: `bg-${color}`,
      }])),
      neutral: {
        root: 'bg-background-inverted',
      },
    },
    to: {
      true: {
        root: 'outline-$ui-color-bg/25 has-[>a:focus-visible]:outline-3 -outline-offset-3',
      },
    },
  },
  compoundVariants: [
    ...POHON_THEME_BRANDS.map((color) => ({
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
