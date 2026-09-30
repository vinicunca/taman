// @unocss-include
import { POHON_THEME_BRANDS } from '../constants.ts';

export const themeProgressGroup = {
  slots: {
    root: 'gap-2',
    base: 'rounded-full bg-background-accented flex overflow-hidden',
    segment: 'duration-280 ease-out motion-reduce:transition-none',
    indicator: 'size-full',
    status: 'color-text-dimmed flex duration-280 ease-out motion-reduce:transition-none',
    list: 'flex flex-col gap-1',
    item: 'flex gap-1.5 min-w-0 items-center',
    itemLeadingIcon: 'shrink-0',
    itemLeadingDot: 'rounded-full shrink-0',
    itemLabel: 'truncate',
    itemTrailing: 'color-text-dimmed ms-auto shrink-0',
  },
  variants: {
    color: {
      ...Object.fromEntries(POHON_THEME_BRANDS.map((color: string) => [color, {
        indicator: `bg-${color}`,
        itemLeadingIcon: `color-${color}`,
        itemLeadingDot: `bg-${color}`,
      }])),
      neutral: {
        indicator: 'bg-background-inverted',
        itemLeadingIcon: 'color-text-highlighted',
        itemLeadingDot: 'bg-background-inverted',
      },
    },
    size: {
      '2xs': {
        status: 'text-xs',
        list: 'text-xs',
        itemLeadingIcon: 'size-3',
        itemLeadingDot: 'size-1.5',
      },
      'xs': {
        status: 'text-xs',
        list: 'text-xs',
        itemLeadingIcon: 'size-3',
        itemLeadingDot: 'size-1.5',
      },
      'sm': {
        status: 'text-sm',
        list: 'text-sm',
        itemLeadingIcon: 'size-4',
        itemLeadingDot: 'size-2',
      },
      'md': {
        status: 'text-sm',
        list: 'text-sm',
        itemLeadingIcon: 'size-4',
        itemLeadingDot: 'size-2',
      },
      'lg': {
        status: 'text-sm',
        list: 'text-sm',
        itemLeadingIcon: 'size-4',
        itemLeadingDot: 'size-2',
      },
      'xl': {
        status: 'text-base',
        list: 'text-base',
        itemLeadingIcon: 'size-5',
        itemLeadingDot: 'size-2.5',
      },
      '2xl': {
        status: 'text-base',
        list: 'text-base',
        itemLeadingIcon: 'size-5',
        itemLeadingDot: 'size-2.5',
      },
    },
    orientation: {
      horizontal: {
        root: 'flex flex-col w-full',
        base: 'flex-row w-full',
        segment: 'h-full transition-[width]',
        status: 'flex-row min-w-fit w-(--percent) transition-[width] items-center justify-end',
      },
      vertical: {
        root: 'flex flex-row h-full',
        base: 'flex-col h-full',
        segment: 'w-full transition-[height]',
        status: 'flex-col h-(--percent) min-h-fit transition-[height] justify-end',
      },
    },
  },
  compoundVariants: [
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
  ],
};
