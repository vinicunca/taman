// @unocss-include

import type { PThemeListbox } from 'pohon-ui';
import { POHON_THEME_BRANDS } from '../constants.ts';

export const themeListbox = {
  slots: {
    root: 'rounded-lg flex flex-col min-h-0 min-w-0 ring ring-ring ring-inset overflow-hidden',
    input: 'border-b border-border',
    content: 'flex-1 max-h-60 relative overflow-y-auto scroll-py-1 focus:outline-none',
    group: 'p-1 isolate',
    label: 'color-text-highlighted font-600',
    separator: 'my-1 bg-border h-px -mx-1',
    empty: 'color-text-muted text-center',
    loading: 'color-text-muted flex items-center justify-center',
    loadingIcon: 'shrink-0 animate-spin',
    item: 'group color-text outline-none flex w-full select-none transition-colors items-start relative before:(rounded-md content-empty transition-colors inset-px absolute -z-1) data-[disabled]:(opacity-75 cursor-not-allowed) data-[highlighted]:not-[[data-disabled]]:color-text-highlighted data-[highlighted]:not-[[data-disabled]]:before:bg-background-elevated/50',
    itemLeadingIcon: 'color-text-dimmed shrink-0 transition-colors [.group[data-highlighted]:not([data-disabled])_&]:color-text',
    itemLeadingAvatar: 'shrink-0',
    itemLeadingAvatarSize: '',
    itemLeadingChip: 'shrink-0',
    itemLeadingChipSize: '',
    itemWrapper: 'flex flex-1 flex-col min-w-0',
    itemLabel: 'truncate',
    itemDescription: 'color-text-muted truncate',
    itemTrailing: 'ms-auto inline-flex gap-1.5 items-center',
    itemTrailingIcon: 'shrink-0',
  },
  variants: {
    size: {
      xs: {
        label: 'text-[10px]/3 p-1 gap-1',
        empty: 'text-xs py-3',
        loading: 'py-3',
        loadingIcon: 'size-4',
        item: 'text-xs p-1 gap-1',
        itemLeadingIcon: 'size-4',
        itemLeadingAvatarSize: '3xs',
        itemLeadingChip: 'size-4',
        itemLeadingChipSize: 'sm',
        itemTrailingIcon: 'size-4',
      },
      sm: {
        label: 'text-[10px]/3 p-1.5 gap-1.5',
        empty: 'text-xs py-4',
        loading: 'py-4',
        loadingIcon: 'size-4',
        item: 'text-xs p-1.5 gap-1.5',
        itemLeadingIcon: 'size-4',
        itemLeadingAvatarSize: '3xs',
        itemLeadingChip: 'size-4',
        itemLeadingChipSize: 'sm',
        itemTrailingIcon: 'size-4',
      },
      md: {
        label: 'text-xs p-1.5 gap-1.5',
        empty: 'text-sm py-6',
        loading: 'py-6',
        loadingIcon: 'size-5',
        item: 'text-sm p-1.5 gap-1.5',
        itemLeadingIcon: 'size-5',
        itemLeadingAvatarSize: '2xs',
        itemLeadingChip: 'size-5',
        itemLeadingChipSize: 'md',
        itemTrailingIcon: 'size-5',
      },
      lg: {
        label: 'text-xs p-2 gap-2',
        empty: 'text-sm py-7',
        loading: 'py-7',
        loadingIcon: 'size-5',
        item: 'text-sm p-2 gap-2',
        itemLeadingIcon: 'size-5',
        itemLeadingAvatarSize: '2xs',
        itemLeadingChip: 'size-5',
        itemLeadingChipSize: 'md',
        itemTrailingIcon: 'size-5',
      },
      xl: {
        label: 'text-sm p-2 gap-2',
        empty: 'text-base py-8',
        loading: 'py-8',
        loadingIcon: 'size-6',
        item: 'text-base p-2 gap-2',
        itemLeadingIcon: 'size-6',
        itemLeadingAvatarSize: 'xs',
        itemLeadingChip: 'size-6',
        itemLeadingChipSize: 'lg',
        itemTrailingIcon: 'size-6',
        itemDescription: 'text-sm',
      },
    },
    color: {
      ...Object.fromEntries(POHON_THEME_BRANDS.map((color: string) => [color, {
        root: `outline-${color}/25 has-focus-visible:outline-3 has-focus-visible:ring-${color}`,
      }])),
      neutral: {
        root: 'outline-outline-inverted/25 has-focus-visible:outline-3 has-focus-visible:ring-ring-inverted',
      },
    },
    virtualize: {
      true: {
        content: 'p-1 isolate',
      },
      false: {
        content: 'divide-divide divide-y',
      },
    },
    disabled: {
      true: {
        root: 'opacity-75 cursor-not-allowed',
      },
    },
    highlight: {
      true: '',
    },
  },
  compoundVariants: [
    ...POHON_THEME_BRANDS.map((color: string) => ({
      color,
      highlight: true,
      class: {
        root: `ring ring-inset ring-${color}`,
      },
    })),
    {
      color: 'neutral',
      highlight: true,
      class: {
        root: 'ring ring-inset ring-ring-inverted',
      },
    },
  ],
} satisfies PThemeListbox;
