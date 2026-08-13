// @unocss-include

import type { PThemePinInput } from 'pohon-ui';
import { BRANDS } from '../constants.ts';

export const pinInput = {
  slots: {
    root: 'relative inline-flex items-center gap-1.5',
    base: 'rounded-md border-0 placeholder:color-text-dimmed text-center focus:outline-none disabled:cursor-not-allowed disabled:opacity-75 transition-colors',
  },
  variants: {
    size: {
      xs: {
        base: 'size-6 text-sm/4',
      },
      sm: {
        base: 'size-7 text-sm/4',
      },
      md: {
        base: 'size-8 text-base/5',
      },
      lg: {
        base: 'size-9 text-base/5',
      },
      xl: {
        base: 'size-10 text-base',
      },
    },
    variant: {
      outline: 'color-text-highlighted bg-background ring ring-inset ring-ring-accented',
      soft: 'color-text-highlighted bg-background-elevated/50 hover:bg-background-elevated focus:bg-background-elevated disabled:bg-background-elevated/50',
      subtle: 'color-text-highlighted bg-background-elevated ring ring-inset ring-ring-accented',
      ghost: 'color-text-highlighted bg-transparent hover:bg-background-elevated focus:bg-background-elevated disabled:bg-transparent dark:disabled:bg-transparent',
      none: 'color-text-highlighted bg-transparent',
    },
    color: {
      ...Object.fromEntries(BRANDS.map((color: string) => [color, ''])),
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
    ...BRANDS.map((color: string) => ({
      color,
      variant: ['outline', 'subtle'],
      class: `focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-${color}`,
    })),
    ...BRANDS.map((color: string) => ({
      color,
      highlight: true,
      class: `ring ring-inset ring-${color}`,
    })),
    {
      color: 'neutral',
      variant: ['outline', 'subtle'],
      class: 'focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring-inverted',
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
