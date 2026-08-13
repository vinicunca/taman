// @unocss-include

import type { PThemeCheckbox } from 'pohon-ui';
import { BRANDS } from '../constants.ts';

export const checkbox = {
  slots: {
    root: 'relative flex items-start',
    container: 'flex items-center',
    base: 'rounded-sm ring ring-inset ring-ring-accented overflow-hidden focus-visible:outline-2 focus-visible:outline-offset-2',
    indicator: 'flex items-center justify-center size-full color-text-inverted',
    icon: 'shrink-0 size-full',
    wrapper: 'w-full',
    label: 'block font-medium color-text',
    description: 'color-text-muted',
  },
  variants: {
    color: {
      ...Object.fromEntries(BRANDS.map((color: string) => [color, {
        base: `focus-visible:outline-${color}`,
        indicator: `bg-${color}`,
      }])),
      neutral: {
        base: 'focus-visible:outline-inverted',
        indicator: 'bg-background-inverted',
      },
    },
    variant: {
      list: {
        root: '',
      },
      card: {
        root: 'border border-border-muted rounded-lg',
      },
    },
    indicator: {
      start: {
        root: 'flex-row',
        wrapper: 'ms-2',
      },
      end: {
        root: 'flex-row-reverse',
        wrapper: 'me-2',
      },
      hidden: {
        base: 'sr-only',
        wrapper: 'text-center',
      },
    },
    size: {
      xs: {
        base: 'size-3',
        container: 'h-4',
        wrapper: 'text-xs',
      },
      sm: {
        base: 'size-3.5',
        container: 'h-4',
        wrapper: 'text-xs',
      },
      md: {
        base: 'size-4',
        container: 'h-5',
        wrapper: 'text-sm',
      },
      lg: {
        base: 'size-4.5',
        container: 'h-5',
        wrapper: 'text-sm',
      },
      xl: {
        base: 'size-5',
        container: 'h-6',
        wrapper: 'text-base',
      },
    },
    required: {
      true: {
        label: 'after:content-[\'*\'] after:ms-0.5 after:text-error',
      },
    },
    disabled: {
      true: {
        root: 'opacity-75',
        base: 'cursor-not-allowed',
        label: 'cursor-not-allowed',
        description: 'cursor-not-allowed',
      },
    },
    checked: {
      true: '',
    },
  },
  compoundVariants: [
    { size: 'xs', variant: 'card', class: { root: 'p-2.5' } },
    { size: 'sm', variant: 'card', class: { root: 'p-3' } },
    { size: 'md', variant: 'card', class: { root: 'p-3.5' } },
    { size: 'lg', variant: 'card', class: { root: 'p-4' } },
    { size: 'xl', variant: 'card', class: { root: 'p-4.5' } },
    ...BRANDS.map((color: string) => ({
      color,
      variant: 'card',
      class: {
        root: `has-data-[state=checked]:border-${color}`,
      },
    })),
    {
      color: 'neutral',
      variant: 'card',
      class: {
        root: 'has-data-[state=checked]:border-border-inverted',
      },
    },
    {
      variant: 'card',
      disabled: true,
      class: {
        root: 'cursor-not-allowed',
      },
    },
    ...BRANDS.map((color: string) => ({
      color,
      highlight: true,
      class: {
        base: `ring-${color}`,
      },
    })),
    {
      color: 'neutral',
      highlight: true,
      class: {
        base: 'ring-ring-inverted',
      },
    },
  ],
} satisfies PThemeCheckbox;
