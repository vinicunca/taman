// @unocss-include

import type { PThemeKbd } from 'pohon-ui';
import { POHON_THEME_BRANDS } from '../constants.ts';

export const themeKbd = {
  base: 'font-500 font-sans px-1 rounded-sm inline-flex uppercase items-center justify-center',
  variants: {
    color: {
      ...Object.fromEntries(POHON_THEME_BRANDS.map((color) => [color, ''])),
      neutral: '',
    },
    variant: {
      solid: '',
      outline: '',
      soft: '',
      subtle: '',
    },
    size: {
      sm: 'text-[10px] h-4 min-w-[16px]',
      md: 'text-[11px] h-5 min-w-[20px]',
      lg: 'text-[12px] h-6 min-w-[24px]',
    },
  },
  compoundVariants: [
    ...POHON_THEME_BRANDS.map((color) => ({
      color,
      variant: 'solid',
      class: `color-text-inverted bg-${color}`,
    })),
    ...POHON_THEME_BRANDS.map((color) => ({
      color,
      variant: 'outline',
      class: `ring ring-inset ring-${color}/50 color-${color}`,
    })),
    ...POHON_THEME_BRANDS.map((color) => ({
      color,
      variant: 'soft',
      class: `color-${color} bg-${color}/10`,
    })),
    ...POHON_THEME_BRANDS.map((color) => ({
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
