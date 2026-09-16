// @unocss-include
import type { PThemeTree } from 'pohon-ui';
import { POHON_THEME_BRANDS } from '../constants.ts';

export const themeTree = {
  slots: {
    root: 'relative isolate',
    item: 'w-full',
    listWithChildren: 'border-s border-border',
    itemWithChildren: 'ps-1.5 -ms-px',
    link: 'group text-sm flex w-full select-none items-center relative focus-visible:outline-none focus:outline-none before:(rounded-md content-empty inset-x-0 inset-y-px absolute -z-1) focus-visible:before:outline-3',
    linkLeadingIcon: 'shrink-0 relative',
    linkLabel: 'truncate',
    linkTrailing: 'ms-auto inline-flex gap-1.5 items-center',
    linkTrailingIcon: 'shrink-0 transition-transform-280 ease-out group-data-[expanded]:rotate-180 motion-reduce:transition-none',
  },
  variants: {
    virtualize: {
      true: {
        root: 'overflow-y-auto',
      },
    },
    color: {
      ...Object.fromEntries(POHON_THEME_BRANDS.map((color) => [
        color,
        {
          link: `before:outline-${color}/25`,
        },
      ])),
      neutral: {
        link: 'before:outline-outline-inverted/25',
      },
    },
    size: {
      xs: {
        listWithChildren: 'ms-4',
        link: 'text-xs px-2 py-1 gap-1',
        linkLeadingIcon: 'size-4',
        linkTrailingIcon: 'size-4',
      },
      sm: {
        listWithChildren: 'ms-4.5',
        link: 'text-xs px-2.5 py-1.5 gap-1.5',
        linkLeadingIcon: 'size-4',
        linkTrailingIcon: 'size-4',
      },
      md: {
        listWithChildren: 'ms-5',
        link: 'text-sm px-2.5 py-1.5 gap-1.5',
        linkLeadingIcon: 'size-5',
        linkTrailingIcon: 'size-5',
      },
      lg: {
        listWithChildren: 'ms-5.5',
        link: 'text-sm px-3 py-2 gap-2',
        linkLeadingIcon: 'size-5',
        linkTrailingIcon: 'size-5',
      },
      xl: {
        listWithChildren: 'ms-6',
        link: 'text-base px-3 py-2 gap-2',
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
        link: 'opacity-75 cursor-not-allowed',
      },
    },
  },
  compoundVariants: [
    ...POHON_THEME_BRANDS.map((color) => ({
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
