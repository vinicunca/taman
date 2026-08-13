// @unocss-include

import type { PThemeTree } from 'pohon-ui';
import { BRANDS } from '../constants.ts';

export const tree = {
  slots: {
    root: 'relative isolate',
    item: 'w-full',
    listWithChildren: 'border-s border-border',
    itemWithChildren: 'ps-1.5 -ms-px',
    link: 'relative group w-full flex items-center text-sm select-none before:(absolute inset-y-px inset-x-0 -z-1 rounded-md) focus:outline-none focus-visible:outline-none focus-visible:before:ring-inset focus-visible:before:ring-2',
    linkLeadingIcon: 'shrink-0 relative',
    linkLabel: 'truncate',
    linkTrailing: 'ms-auto inline-flex gap-1.5 items-center',
    linkTrailingIcon: 'shrink-0 transform transition-transform-200 group-[data-expanded]:rotate-180',
  },
  variants: {
    virtualize: {
      true: {
        root: 'overflow-y-auto',
      },
    },
    color: {
      ...Object.fromEntries(BRANDS.map((color: string) => [color, {
        link: `focus-visible:before:ring-${color}`,
      }])),
      neutral: {
        link: 'focus-visible:before:ring-ring-inverted',
      },
    },
    size: {
      xs: {
        listWithChildren: 'ms-4',
        link: 'px-2 py-1 text-xs gap-1',
        linkLeadingIcon: 'size-4',
        linkTrailingIcon: 'size-4',
      },
      sm: {
        listWithChildren: 'ms-4.5',
        link: 'px-2.5 py-1.5 text-xs gap-1.5',
        linkLeadingIcon: 'size-4',
        linkTrailingIcon: 'size-4',
      },
      md: {
        listWithChildren: 'ms-5',
        link: 'px-2.5 py-1.5 text-sm gap-1.5',
        linkLeadingIcon: 'size-5',
        linkTrailingIcon: 'size-5',
      },
      lg: {
        listWithChildren: 'ms-5.5',
        link: 'px-3 py-2 text-sm gap-2',
        linkLeadingIcon: 'size-5',
        linkTrailingIcon: 'size-5',
      },
      xl: {
        listWithChildren: 'ms-6',
        link: 'px-3 py-2 text-base gap-2',
        linkLeadingIcon: 'size-6',
        linkTrailingIcon: 'size-6',
      },
    },
    selected: {
      true: {
        link: 'before:bg-background-elevated',
      },
    },
    disabled: {
      true: {
        link: 'cursor-not-allowed opacity-75',
      },
    },
  },
  compoundVariants: [
    ...BRANDS.map((color: string) => ({
      color,
      selected: true,
      class: {
        link: `color-${color}`,
      },
    })),
    {
      color: 'neutral',
      selected: true,
      class: {
        link: 'color-text-highlighted',
      },
    },
    {
      selected: false,
      disabled: false,
      class: {
        link: 'hover:color-text-highlighted hover:before:bg-background-elevated/50 transition-colors before:transition-colors',
      },
    },
  ],
} satisfies PThemeTree;
