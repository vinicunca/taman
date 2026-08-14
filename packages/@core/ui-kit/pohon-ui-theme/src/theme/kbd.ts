// @unocss-include

import type { PThemeKbd } from 'pohon-ui';
import { POHON_THEME_BRANDS } from '../constants.ts';

export const kbd = {
  base: 'inline-flex items-center justify-center px-1 rounded-sm font-medium font-sans uppercase',
  variants: {
    color: {
      ...Object.fromEntries(POHON_THEME_BRANDS.map((color: string) => [color, ''])),
      neutral: '',
    },
    variant: {
      solid: '',
      outline: '',
      soft: '',
      subtle: '',
    },
    size: {
      sm: 'h-4 min-w-[16px] text-[10px]',
      md: 'h-5 min-w-[20px] text-[11px]',
      lg: 'h-6 min-w-[24px] text-[12px]',
    },
  },
  compoundVariants: [
    ...POHON_THEME_BRANDS.map((color: string) => ({
      color,
      variant: 'solid',
      class: `color-text-inverted bg-${color}`,
    })),
    ...POHON_THEME_BRANDS.map((color: string) => ({
      color,
      variant: 'outline',
      class: `ring ring-inset ring-${color}/50 color-${color}`,
    })),
    ...POHON_THEME_BRANDS.map((color: string) => ({
      color,
      variant: 'soft',
      class: `color-${color} bg-${color}/10`,
    })),
    ...POHON_THEME_BRANDS.map((color: string) => ({
      color,
      variant: 'subtle',
      class: `color-${color} ring ring-inset ring-${color}/25 bg-${color}/10`,
    })),
    {
      color: 'neutral',
      variant: 'solid',
      class: 'color-text-inverted bg-background-inverted',
    },
    {
      color: 'neutral',
      variant: 'outline',
      class: 'ring ring-inset ring-ring-accented color-text bg-background',
    },
    {
      color: 'neutral',
      variant: 'soft',
      class: 'color-text bg-background-elevated',
    },
    {
      color: 'neutral',
      variant: 'subtle',
      class: 'ring ring-inset ring-ring-accented color-text bg-background-elevated',
    },
  ],
} satisfies PThemeKbd;
