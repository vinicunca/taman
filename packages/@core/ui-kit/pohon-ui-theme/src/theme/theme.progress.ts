// @unocss-include

import type { PThemeProgress } from 'pohon-ui';
import { POHON_THEME_BRANDS } from '../constants.ts';

export const themeProgress = {
  slots: {
    root: 'gap-2',
    base: 'rounded-full bg-background-accented relative overflow-hidden',
    indicator: 'rounded-full size-full transition-transform-280 ease-out motion-reduce:transition-none motion-reduce:data-[state=indeterminate]:animate-pulse',
    status: 'color-text-dimmed flex duration-280 ease-out motion-reduce:transition-none',
    steps: 'grid items-end',
    step: 'text-end col-start-1 row-start-1 truncate transition-opacity ease-out',
  },
  variants: {
    animation: {
      'carousel': '',
      'carousel-inverse': '',
      'swing': '',
      'elastic': '',
    },
    color: {
      ...Object.fromEntries(POHON_THEME_BRANDS.map((color: string) => [color, {
        indicator: `bg-${color}`,
        steps: `color-${color}`,
      }])),
      neutral: {
        indicator: 'bg-background-inverted',
        steps: 'color-text-highlighted',
      },
    },
    size: {
      '2xs': {
        status: 'text-xs',
        steps: 'text-xs',
      },
      'xs': {
        status: 'text-xs',
        steps: 'text-xs',
      },
      'sm': {
        status: 'text-sm',
        steps: 'text-sm',
      },
      'md': {
        status: 'text-sm',
        steps: 'text-sm',
      },
      'lg': {
        status: 'text-sm',
        steps: 'text-sm',
      },
      'xl': {
        status: 'text-base',
        steps: 'text-base',
      },
      '2xl': {
        status: 'text-base',
        steps: 'text-base',
      },
    },
    step: {
      active: {
        step: 'opacity-100',
      },
      first: {
        step: 'color-text-muted opacity-100',
      },
      other: {
        step: 'opacity-0',
      },
      last: {
        step: '',
      },
    },
    orientation: {
      horizontal: {
        root: 'flex flex-col w-full',
        base: 'w-full',
        status: 'flex-row min-w-fit w-$percent transition-[width] items-center justify-end',
      },
      vertical: {
        root: 'flex flex-row-reverse h-full',
        base: 'h-full',
        status: 'flex-col h-$percent min-h-fit transition-[height] justify-end',
      },
    },
    inverted: {
      true: {
        status: 'self-end',
      },
    },
  },
  compoundVariants: [
    {
      inverted: true,
      orientation: 'horizontal',
      class: {
        step: 'text-start',
        status: 'flex-row-reverse',
      },
    },
    {
      inverted: true,
      orientation: 'vertical',
      class: {
        steps: 'items-start',
        status: 'flex-col-reverse',
      },
    },
    {
      orientation: 'horizontal',
      size: '2xs',
      class: 'h-px',
    },
    {
      orientation: 'horizontal',
      size: 'xs',
      class: 'h-0.5',
    },
    {
      orientation: 'horizontal',
      size: 'sm',
      class: 'h-1',
    },
    {
      orientation: 'horizontal',
      size: 'md',
      class: 'h-2',
    },
    {
      orientation: 'horizontal',
      size: 'lg',
      class: 'h-3',
    },
    {
      orientation: 'horizontal',
      size: 'xl',
      class: 'h-4',
    },
    {
      orientation: 'horizontal',
      size: '2xl',
      class: 'h-5',
    },
    {
      orientation: 'vertical',
      size: '2xs',
      class: 'w-px',
    },
    {
      orientation: 'vertical',
      size: 'xs',
      class: 'w-0.5',
    },
    {
      orientation: 'vertical',
      size: 'sm',
      class: 'w-1',
    },
    {
      orientation: 'vertical',
      size: 'md',
      class: 'w-2',
    },
    {
      orientation: 'vertical',
      size: 'lg',
      class: 'w-3',
    },
    {
      orientation: 'vertical',
      size: 'xl',
      class: 'w-4',
    },
    {
      orientation: 'vertical',
      size: '2xl',
      class: 'w-5',
    },
    {
      orientation: 'horizontal',
      animation: 'carousel',
      class: {
        indicator: 'motion-safe:data-[state=indeterminate]:animate-carousel motion-safe:data-[state=indeterminate]:rtl:animate-carousel-rtl',
      },
    },
    {
      orientation: 'vertical',
      animation: 'carousel',
      class: {
        indicator: 'motion-safe:data-[state=indeterminate]:animate-carousel-vertical',
      },
    },
    {
      orientation: 'horizontal',
      animation: 'carousel-inverse',
      class: {
        indicator: 'motion-safe:data-[state=indeterminate]:animate-carousel-inverse motion-safe:data-[state=indeterminate]:rtl:animate-carousel-inverse-rtl',
      },
    },
    {
      orientation: 'vertical',
      animation: 'carousel-inverse',
      class: {
        indicator: 'motion-safe:data-[state=indeterminate]:animate-carousel-inverse-vertical',
      },
    },
    {
      orientation: 'horizontal',
      animation: 'swing',
      class: {
        indicator: 'motion-safe:data-[state=indeterminate]:animate-swing',
      },
    },
    {
      orientation: 'vertical',
      animation: 'swing',
      class: {
        indicator: 'motion-safe:data-[state=indeterminate]:animate-swing-vertical',
      },
    },
    {
      orientation: 'horizontal',
      animation: 'elastic',
      class: {
        indicator: 'relative motion-safe:data-[state=indeterminate]:animate-elastic',
      },
    },
    {
      orientation: 'vertical',
      animation: 'elastic',
      class: {
        indicator: 'relative motion-safe:data-[state=indeterminate]:animate-elastic-vertical',
      },
    },
  ],
} satisfies PThemeProgress;
