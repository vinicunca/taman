// @unocss-include

import type { PThemeSlider } from 'pohon-ui';
import { POHON_THEME_BRANDS } from '../constants.ts';

export const themeSlider = {
  slots: {
    root: 'flex select-none items-center relative touch-none',
    track: 'rounded-full bg-background-accented grow relative overflow-hidden',
    range: 'rounded-full absolute',
    thumb: 'rounded-full bg-background ring-2 focus-visible:(outline-3 outline-offset-2)',
  },
  variants: {
    color: {
      ...Object.fromEntries(POHON_THEME_BRANDS.map((color: string) => [color, {
        range: `bg-${color}`,
        thumb: `ring-${color} outline-${color}/25`,
      }])),
      neutral: {
        range: 'bg-background-inverted',
        thumb: 'outline-outline-inverted/25 ring-ring-inverted',
      },
    },
    size: {
      xs: {
        thumb: 'size-3',
      },
      sm: {
        thumb: 'size-3.5',
      },
      md: {
        thumb: 'size-4',
      },
      lg: {
        thumb: 'size-4.5',
      },
      xl: {
        thumb: 'size-5',
      },
    },
    orientation: {
      horizontal: {
        root: 'w-full',
        range: 'h-full',
      },
      vertical: {
        root: 'flex-col h-full',
        range: 'w-full',
      },
    },
    disabled: {
      true: {
        root: 'opacity-75 cursor-not-allowed',
      },
    },
  },
  compoundVariants: [
    {
      orientation: 'horizontal',
      size: 'xs',
      class: {
        track: 'h-[6px]',
      },
    },
    {
      orientation: 'horizontal',
      size: 'sm',
      class: {
        track: 'h-[7px]',
      },
    },
    {
      orientation: 'horizontal',
      size: 'md',
      class: {
        track: 'h-[8px]',
      },
    },
    {
      orientation: 'horizontal',
      size: 'lg',
      class: {
        track: 'h-[9px]',
      },
    },
    {
      orientation: 'horizontal',
      size: 'xl',
      class: {
        track: 'h-[10px]',
      },
    },
    {
      orientation: 'vertical',
      size: 'xs',
      class: {
        track: 'w-[6px]',
      },
    },
    {
      orientation: 'vertical',
      size: 'sm',
      class: {
        track: 'w-[7px]',
      },
    },
    {
      orientation: 'vertical',
      size: 'md',
      class: {
        track: 'w-[8px]',
      },
    },
    {
      orientation: 'vertical',
      size: 'lg',
      class: {
        track: 'w-[9px]',
      },
    },
    {
      orientation: 'vertical',
      size: 'xl',
      class: {
        track: 'w-[10px]',
      },
    },
  ],
} satisfies PThemeSlider;
