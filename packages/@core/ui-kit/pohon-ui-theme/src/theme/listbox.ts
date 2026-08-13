// @unocss-include

import type { PThemeListbox } from 'pohon-ui';
import { BRANDS } from '../constants.ts';

export const listbox = {
  slots: {
    root: 'flex flex-col min-h-0 min-w-0 ring ring-inset ring-ring rounded-lg overflow-hidden',
    input: 'border-b border-border',
    content: 'relative overflow-y-auto flex-1 max-h-60 scroll-py-1 focus:outline-none',
    group: 'p-1 isolate',
    label: 'font-semibold color-text-highlighted',
    separator: '-mx-1 my-1 h-px bg-border',
    empty: 'text-center color-text-muted',
    loading: 'flex items-center justify-center color-text-muted',
    loadingIcon: 'animate-spin shrink-0',
    item: 'group relative w-full flex items-start select-none outline-none before:absolute before:-z-1 before:inset-px before:rounded-md data-disabled:cursor-not-allowed data-disabled:opacity-75 color-text data-highlighted:not-data-disabled:color-text-highlighted data-highlighted:not-data-disabled:before:bg-background-elevated/50 transition-colors before:transition-colors',
    itemLeadingIcon: 'shrink-0 color-text-dimmed group-data-highlighted:not-group-data-disabled:color-text transition-colors',
    itemLeadingAvatar: 'shrink-0',
    itemLeadingAvatarSize: '',
    itemLeadingChip: 'shrink-0',
    itemLeadingChipSize: '',
    itemWrapper: 'flex-1 flex flex-col min-w-0',
    itemLabel: 'truncate',
    itemDescription: 'truncate color-text-muted',
    itemTrailing: 'ms-auto inline-flex gap-1.5 items-center',
    itemTrailingIcon: 'shrink-0',
  },
  variants: {
    size: {
      xs: {
        label: 'p-1 text-[10px]/3 gap-1',
        empty: 'py-3 text-xs',
        loading: 'py-3',
        loadingIcon: 'size-4',
        item: 'p-1 text-xs gap-1',
        itemLeadingIcon: 'size-4',
        itemLeadingAvatarSize: '3xs',
        itemLeadingChip: 'size-4',
        itemLeadingChipSize: 'sm',
        itemTrailingIcon: 'size-4',
      },
      sm: {
        label: 'p-1.5 text-[10px]/3 gap-1.5',
        empty: 'py-4 text-xs',
        loading: 'py-4',
        loadingIcon: 'size-4',
        item: 'p-1.5 text-xs gap-1.5',
        itemLeadingIcon: 'size-4',
        itemLeadingAvatarSize: '3xs',
        itemLeadingChip: 'size-4',
        itemLeadingChipSize: 'sm',
        itemTrailingIcon: 'size-4',
      },
      md: {
        label: 'p-1.5 text-xs gap-1.5',
        empty: 'py-6 text-sm',
        loading: 'py-6',
        loadingIcon: 'size-5',
        item: 'p-1.5 text-sm gap-1.5',
        itemLeadingIcon: 'size-5',
        itemLeadingAvatarSize: '2xs',
        itemLeadingChip: 'size-5',
        itemLeadingChipSize: 'md',
        itemTrailingIcon: 'size-5',
      },
      lg: {
        label: 'p-2 text-xs gap-2',
        empty: 'py-7 text-sm',
        loading: 'py-7',
        loadingIcon: 'size-5',
        item: 'p-2 text-sm gap-2',
        itemLeadingIcon: 'size-5',
        itemLeadingAvatarSize: '2xs',
        itemLeadingChip: 'size-5',
        itemLeadingChipSize: 'md',
        itemTrailingIcon: 'size-5',
      },
      xl: {
        label: 'p-2 text-sm gap-2',
        empty: 'py-8 text-base',
        loading: 'py-8',
        loadingIcon: 'size-6',
        item: 'p-2 text-base gap-2',
        itemLeadingIcon: 'size-6',
        itemLeadingAvatarSize: 'xs',
        itemLeadingChip: 'size-6',
        itemLeadingChipSize: 'lg',
        itemTrailingIcon: 'size-6',
        itemDescription: 'text-sm',
      },
    },
    color: {
      ...Object.fromEntries(BRANDS.map((color: string) => [color, ''])),
      neutral: '',
    },
    virtualize: {
      true: {
        content: 'p-1 isolate',
      },
      false: {
        content: 'divide-y divide-divide',
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
    ...BRANDS.map((color: string) => ({
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
