// @unocss-include

import type { PThemePinInput } from 'pohon-ui';
import { POHON_THEME_BRANDS } from '../constants.ts';

export const themePinInput = {
  slots: {
    root: 'inline-flex gap-1.5 items-center relative',
    base: 'text-center border-0 rounded-md transition-colors placeholder:color-text-dimmed disabled:(opacity-75 cursor-not-allowed)',
    separator: 'color-text-dimmed flex items-center justify-center',
  },
  variants: {
    size: {
      xs: {
        base: 'text-sm/4 size-6',
      },
      sm: {
        base: 'text-sm/4 size-7',
      },
      md: {
        base: 'text-base/5 size-8',
      },
      lg: {
        base: 'text-base/5 size-9',
      },
      xl: {
        base: 'text-base size-10',
      },
    },
    variant: {
      outline: 'color-text-highlighted bg-background ring ring-ring-accented ring-inset',
      soft: 'color-text-highlighted bg-background-elevated/50 disabled:bg-background-elevated/50 focus:bg-background-elevated hover:bg-background-elevated',
      subtle: 'color-text-highlighted bg-background-elevated ring ring-ring-accented ring-inset',
      ghost: 'color-text-highlighted bg-transparent disabled:bg-transparent focus:bg-background-elevated hover:bg-background-elevated dark:disabled:bg-transparent',
      none: 'color-text-highlighted bg-transparent focus:outline-none',
    },
    color: {
      ...Object.fromEntries(POHON_THEME_BRANDS.map((color: string) => [color, ''])),
      neutral: '',
    },
    highlight: {
      true: '',
    },
    fixed: {
      false: '',
    },
  },
  compoundVariants: [
    ...POHON_THEME_BRANDS.map((color: string) => ({
      color,
      variant: ['outline', 'subtle'],
      class: `outline-${color}/25 focus-visible:outline-3 focus-visible:ring-${color}`,
    })),
    ...POHON_THEME_BRANDS.map((color: string) => ({
      color,
      variant: ['soft', 'ghost'],
      class: `outline-${color}/25 focus-visible:outline-3`,
    })),
    ...POHON_THEME_BRANDS.map((color: string) => ({
      color,
      highlight: true,
      class: `ring ring-inset pohon:ring-${color}`,
    })),
    {
      color: 'neutral',
      variant: ['outline', 'subtle'],
      class: 'outline-outline-inverted/25 focus-visible:outline-3 focus-visible:ring-ring-inverted',
    },
    {
      color: 'neutral',
      variant: ['soft', 'ghost'],
      class: 'outline-outline-inverted/25 focus-visible:outline-3',
    },
    {
      color: 'neutral',
      highlight: true,
      class: 'ring ring-inset ring-ring-inverted',
    },
    {
      fixed: false,
      size: 'xs',
      class: 'md:text-xs',
    },
    {
      fixed: false,
      size: 'sm',
      class: 'md:text-xs',
    },
    {
      fixed: false,
      size: 'md',
      class: 'md:text-sm',
    },
    {
      fixed: false,
      size: 'lg',
      class: 'md:text-sm',
    },
  ],
} satisfies PThemePinInput;
