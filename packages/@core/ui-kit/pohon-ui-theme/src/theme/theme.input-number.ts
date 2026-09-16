// @unocss-include

import type { PThemeInputNumber } from 'pohon-ui';
import { POHON_THEME_BRANDS } from '../constants.ts';
import { fieldGroupVariantWithRoot } from './theme.field-group.ts';
import { themeInput } from './theme.input.ts';

export const themeInputNumber = {
  slots: {
    root: 'inline-flex items-center relative',
    base: 'placeholder:color-text-dimmed border-0 rounded-md w-full transition-colors disabled:(opacity-75 cursor-not-allowed)',
    increment: 'flex items-center absolute',
    decrement: 'flex items-center absolute',
  },
  variants: {
    ...fieldGroupVariantWithRoot,

    color: {
      ...Object.fromEntries(POHON_THEME_BRANDS.map((color) => [color, ''])),
      neutral: '',
    },
    size: {
      xs: 'text-sm/4 px-2 py-1 gap-1',
      sm: 'text-sm/4 px-2.5 py-1.5 gap-1.5',
      md: 'text-base/5 px-2.5 py-1.5 gap-1.5',
      lg: 'text-base/5 px-3 py-2 gap-2',
      xl: 'text-base px-3 py-2 gap-2',
    },
    variant: {
      ...themeInput.variants.variant,
    },
    disabled: {
      true: {
        increment: 'opacity-75 cursor-not-allowed',
        decrement: 'opacity-75 cursor-not-allowed',
      },
    },
    orientation: {
      horizontal: {
        base: 'text-center',
        increment: 'pe-1 end-0 inset-y-0',
        decrement: 'ps-1 start-0 inset-y-0',
      },
      vertical: {
        increment: 'pe-1 scale-80 end-0 top-0 [&>button]:py-0',
        decrement: 'pe-1 scale-80 end-0 bottom-0 [&>button]:py-0',
      },
    },
    highlight: {
      true: '',
    },
    fixed: {
      false: '',
    },
    increment: {
      false: '',
    },
    decrement: {
      false: '',
    },
  },
  compoundVariants: [
    ...POHON_THEME_BRANDS.map((color) => ({
      color,
      variant: ['outline', 'subtle'],
      class: `outline-${color}/25 focus-visible:outline-3 focus-visible:ring-${color}`,
    })),
    ...POHON_THEME_BRANDS.map((color) => ({
      color,
      variant: ['soft', 'ghost'],
      class: `outline-${color}/25 focus-visible:outline-3`,
    })),
    ...POHON_THEME_BRANDS.map((color) => ({
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
      orientation: 'horizontal',
      decrement: false,
      class: 'text-start',
    },
    {
      decrement: true,
      size: 'xs',
      class: 'ps-7',
    },
    {
      decrement: true,
      size: 'sm',
      class: 'ps-8',
    },
    {
      decrement: true,
      size: 'md',
      class: 'ps-9',
    },
    {
      decrement: true,
      size: 'lg',
      class: 'ps-10',
    },
    {
      decrement: true,
      size: 'xl',
      class: 'ps-11',
    },
    {
      increment: true,
      size: 'xs',
      class: 'pe-7',
    },
    {
      increment: true,
      size: 'sm',
      class: 'pe-8',
    },
    {
      increment: true,
      size: 'md',
      class: 'pe-9',
    },
    {
      increment: true,
      size: 'lg',
      class: 'pe-10',
    },
    {
      increment: true,
      size: 'xl',
      class: 'pe-11',
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
} satisfies PThemeInputNumber;
