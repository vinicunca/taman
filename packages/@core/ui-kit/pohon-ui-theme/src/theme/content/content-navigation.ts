// @unocss-include

import type { PThemeContentNavigation } from 'pohon-ui';
import { BRANDS } from '../../constants.ts';

export const contentNavigation = {
  slots: {
    root: '',
    content: 'data-[state=open]:animate-[accordion-down_200ms_ease-out] data-[state=closed]:animate-[accordion-up_200ms_ease-out] overflow-hidden focus:outline-none',
    list: 'isolate -mx-2.5 -mt-1.5',
    item: '',
    listWithChildren: 'ms-5 border-s border-border',
    itemWithChildren: 'flex flex-col data-[state=open]:mb-1.5',
    trigger: 'font-semibold',
    link: 'group relative w-full px-2.5 py-1.5 before:(inset-y-px inset-x-0 absolute -z-1 rounded-md) flex items-center gap-1.5 text-sm focus:outline-none focus-visible:outline-none focus-visible:before:ring-inset focus-visible:before:ring-2',
    linkLeadingIcon: 'shrink-0 size-5',
    linkTrailing: 'ms-auto inline-flex gap-1.5 items-center',
    linkTrailingBadge: 'shrink-0',
    linkTrailingBadgeSize: 'sm',
    linkTrailingIcon: 'size-5 transform transition-transform duration-200 shrink-0 group-data-[state=open]:rotate-180',
    linkTitle: 'truncate',
    linkTitleExternalIcon: 'size-3 align-top color-text-dimmed',
  },
  variants: {
    color: {
      ...Object.fromEntries(BRANDS.map((color: string) => [color, {
        trigger: `focus-visible:ring-${color}`,
        link: `focus-visible:before:ring-${color}`,
      }])),
      neutral: {
        trigger: 'focus-visible:ring-ring-inverted',
        link: 'focus-visible:before:ring-ring-inverted',
      },
    },
    highlightColor: {
      ...Object.fromEntries(BRANDS.map((color: string) => [color, ''])),
      neutral: '',
    },
    variant: {
      pill: '',
      link: '',
    },
    active: {
      true: {
        link: 'font-medium',
      },
      false: {
        link: 'color-text-muted',
        linkLeadingIcon: 'color-text-dimmed',
      },
    },
    disabled: {
      true: {
        trigger: 'data-[state=open]:color-text-highlighted',
      },
    },
    highlight: {
      true: {},
    },
    level: {
      true: {
        item: 'ps-1.5 -ms-px',
        itemWithChildren: 'ps-1.5 -ms-px',
      },
    },
  },
  compoundVariants: [
    {
      highlight: true,
      level: true,
      class: {
        link: 'after:(absolute -left-1.5 inset-y-0.5 block w-px rounded-full transition-colors)',
      },
    },
    {
      disabled: false,
      active: false,
      variant: 'pill',
      class: {
        link: 'hover:color-text-highlighted hover:before:bg-background-elevated/50 data-[state=open]:color-text-highlighted transition-colors before:transition-colors',
        linkLeadingIcon: 'group-hover:color-text group-data-[state=open]:color-text transition-colors',
      },
    },
    ...BRANDS.map((color: string) => ({
      color,
      variant: 'pill',
      active: true,
      class: {
        link: `color-${color}`,
        linkLeadingIcon: `color-${color} group-data-[state=open]:color-${color}`,
      },
    })),
    {
      color: 'neutral',
      variant: 'pill',
      active: true,
      class: {
        link: 'color-text-highlighted',
        linkLeadingIcon: 'color-text-highlighted group-data-[state=open]:color-text-highlighted',
      },
    },
    {
      variant: 'pill',
      active: true,
      highlight: false,
      class: {
        link: 'before:bg-background-elevated',
      },
    },
    {
      variant: 'pill',
      active: true,
      highlight: true,
      disabled: false,
      class: {
        link: 'hover:before:bg-background-elevated/50 before:transition-colors',
      },
    },
    {
      disabled: false,
      active: false,
      variant: 'link',
      class: {
        link: 'hover:color-text-highlighted data-[state=open]:color-text-highlighted transition-colors',
        linkLeadingIcon: 'group-hover:color-text group-data-[state=open]:color-text transition-colors',
      },
    },
    ...BRANDS.map((color: string) => ({
      color,
      variant: 'link',
      active: true,
      class: {
        link: `color-${color}`,
        linkLeadingIcon: `color-${color} group-data-[state=open]:color-${color}`,
      },
    })),
    {
      color: 'neutral',
      variant: 'link',
      active: true,
      class: {
        link: 'color-text-highlighted',
        linkLeadingIcon: 'color-text-highlighted group-data-[state=open]:color-text-highlighted',
      },
    },
    ...BRANDS.map((highlightColor: string) => ({
      highlightColor,
      highlight: true,
      level: true,
      active: true,
      class: {
        link: `after:bg-${highlightColor}`,
      },
    })),
    {
      highlightColor: 'neutral',
      highlight: true,
      level: true,
      active: true,
      class: {
        link: 'after:bg-background-inverted',
      },
    },
  ],
} satisfies PThemeContentNavigation;
