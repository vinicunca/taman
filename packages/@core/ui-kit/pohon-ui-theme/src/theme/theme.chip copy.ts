// @unocss-include
import type {
  PThemeChip,
} from 'pohon-ui';
import { POHON_THEME_BRANDS } from '../constants.ts';

export const themeChip = {
  slots: {
    root: 'inline-flex shrink-0 items-center justify-center relative',
    base: 'ring-background color-text-inverted font-500 rounded-full flex whitespace-nowrap ring items-center justify-center',
  },
  variants: {
    color: {
      ...Object.fromEntries(POHON_THEME_BRANDS.map((color) => [color, `bg-${color}`])),
      neutral: 'bg-background-inverted',
    },
    size: {
      '3xs': 'text-[4px] h-[4px] min-w-[4px]',
      '2xs': 'text-[5px] h-[5px] min-w-[5px]',
      'xs': 'text-[6px] h-[6px] min-w-[6px]',
      'sm': 'text-[7px] h-[7px] min-w-[7px]',
      'md': 'text-[8px] h-[8px] min-w-[8px]',
      'lg': 'text-[9px] h-[9px] min-w-[9px]',
      'xl': 'text-[10px] h-[10px] min-w-[10px]',
      '2xl': 'text-[11px] h-[11px] min-w-[11px]',
      '3xl': 'text-[12px] h-[12px] min-w-[12px]',
    },
    position: {
      'top-right': 'right-0 top-0',
      'bottom-right': 'bottom-0 right-0',
      'top-left': 'left-0 top-0',
      'bottom-left': 'bottom-0 left-0',
    },
    inset: {
      false: '',
    },
    standalone: {
      false: 'absolute',
    },
  },
  compoundVariants: [{
    position: 'top-right',
    inset: false,
    class: '-translate-y-1/2 translate-x-1/2 transform',
  }, {
    position: 'bottom-right',
    inset: false,
    class: 'translate-y-1/2 translate-x-1/2 transform',
  }, {
    position: 'top-left',
    inset: false,
    class: '-translate-y-1/2 -translate-x-1/2 transform',
  }, {
    position: 'bottom-left',
    inset: false,
    class: 'translate-y-1/2 -translate-x-1/2 transform',
  }],
} satisfies PThemeChip;
