// @unocss-include

import type { PThemeInputMenu } from 'pohon-ui';
import { defuFn } from 'defu';
import { POHON_THEME_BRANDS } from '../constants.ts';
import { themeInput } from './theme.input.ts';

export const themeInputMenu = defuFn(
  {
    slots: {
      base: () => 'rounded-md transition-colors',
      trailing: 'group flex items-center end-0 inset-y-0 absolute focus:outline-none disabled:(opacity-75 cursor-not-allowed)',
      trailingClear: 'pohon:p-0',
      arrow: 'fill-fill-bg stroke-stroke',
      content: 'rounded-md bg-background flex flex-col max-h-[min(15rem,var(--akar-combobox-content-available-height,15rem))] w-$akar-combobox-trigger-width pointer-events-auto ring ring-ring shadow-lg origin-$akar-combobox-content-transform-origin z-popup overflow-hidden data-[state=closed]:(animate-out fade-out-0 zoom-out-95) data-[state=open]:(animate-in fade-in-0 zoom-in-95) data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
      viewport: 'flex-1 relative overflow-y-auto scroll-py-1',
      group: 'p-1 isolate',
      empty: 'color-text-muted text-center',
      label: 'color-text-highlighted font-600',
      separator: 'my-1 bg-border h-px -mx-1',
      item: 'group text-sm color-text p-1.5 outline-none flex gap-1.5 w-full select-none transition-colors items-start relative before:(rounded-md content-empty transition-colors inset-px absolute -z-1) data-[disabled]:(opacity-75 cursor-not-allowed) data-[highlighted]:not-[[data-disabled]]:color-text-highlighted data-[highlighted]:not-[[data-disabled]]:before:bg-background-elevated/50',
      itemLeadingIcon: 'color-text-dimmed shrink-0 transition-colors [.group[data-highlighted]:not([data-disabled])_&]:color-text',
      itemLeadingAvatar: 'shrink-0',
      itemLeadingAvatarSize: '',
      itemLeadingChip: 'shrink-0',
      itemLeadingChipSize: '',
      itemTrailing: 'ms-auto inline-flex gap-1.5 items-center',
      itemTrailingIcon: 'shrink-0',
      itemWrapper: 'flex flex-1 flex-col min-w-0',
      itemLabel: 'truncate',
      itemDescription: 'color-text-muted truncate',
      tagsItem: 'color-text font-500 px-1.5 py-0.5 rounded-sm bg-background-elevated inline-flex gap-0.5 ring ring-ring-accented ring-inset items-center data-[disabled]:(opacity-75 cursor-not-allowed)',
      tagsItemText: 'truncate',
      tagsItemDelete: 'color-text-dimmed rounded-xs inline-flex transition-colors items-center hover:color-text hover:bg-background-accented/75 disabled:pointer-events-none',
      tagsItemDeleteIcon: 'shrink-0',
      tagsInput: 'border-0 bg-transparent flex-1 placeholder:color-text-dimmed focus:outline-none disabled:(opacity-75 cursor-not-allowed)',
    },
    variants: {
      virtualize: {
        true: {
          viewport: 'p-1 isolate',
        },
        false: {
          viewport: 'divide-divide divide-y',
        },
      },
      multiple: {
        true: {
          root: 'flex-wrap',
        },
        false: {
          base: 'border-0 w-full placeholder:color-text-dimmed disabled:(opacity-75 cursor-not-allowed)',
        },
      },
      size: {
        xs: {
          label: 'text-[10px]/3 p-1 gap-1',
          item: 'text-xs p-1 gap-1',
          itemLeadingIcon: 'size-4',
          itemLeadingAvatarSize: '3xs',
          itemLeadingChip: 'size-4',
          itemLeadingChipSize: 'sm',
          itemTrailingIcon: 'size-4',
          tagsItem: 'text-[10px]/3',
          tagsItemDeleteIcon: 'size-3',
          empty: 'text-xs p-2',
        },
        sm: {
          label: 'text-[10px]/3 p-1.5 gap-1.5',
          item: 'text-xs p-1.5 gap-1.5',
          itemLeadingIcon: 'size-4',
          itemLeadingAvatarSize: '3xs',
          itemLeadingChip: 'size-4',
          itemLeadingChipSize: 'sm',
          itemTrailingIcon: 'size-4',
          tagsItem: 'text-[10px]/3',
          tagsItemDeleteIcon: 'size-3',
          empty: 'text-xs p-2.5',
        },
        md: {
          label: 'text-xs p-1.5 gap-1.5',
          item: 'text-sm p-1.5 gap-1.5',
          itemLeadingIcon: 'size-5',
          itemLeadingAvatarSize: '2xs',
          itemLeadingChip: 'size-5',
          itemLeadingChipSize: 'md',
          itemTrailingIcon: 'size-5',
          tagsItem: 'text-xs',
          tagsItemDeleteIcon: 'size-3.5',
          empty: 'text-sm p-2.5',
        },
        lg: {
          label: 'text-xs p-2 gap-2',
          item: 'text-sm p-2 gap-2',
          itemLeadingIcon: 'size-5',
          itemLeadingAvatarSize: '2xs',
          itemLeadingChip: 'size-5',
          itemLeadingChipSize: 'md',
          itemTrailingIcon: 'size-5',
          tagsItem: 'text-xs',
          tagsItemDeleteIcon: 'size-3.5',
          empty: 'text-sm p-3',
        },
        xl: {
          label: 'text-sm p-2 gap-2',
          item: 'text-base p-2 gap-2',
          itemLeadingIcon: 'size-6',
          itemLeadingAvatarSize: 'xs',
          itemLeadingChip: 'size-6',
          itemLeadingChipSize: 'lg',
          itemTrailingIcon: 'size-6',
          tagsItem: 'text-sm',
          tagsItemDeleteIcon: 'size-4',
          empty: 'text-base p-3',
        },
      },
    },
    compoundVariants: [
      {
        variant: 'soft',
        multiple: true,
        class: 'has-focus:bg-background-elevated has-focus-visible:outline-3',
      },
      {
        variant: 'ghost',
        multiple: true,
        class: 'has-focus:bg-background-elevated has-focus-visible:outline-3',
      },
      ...POHON_THEME_BRANDS.map((color: string) => ({
        color,
        multiple: true,
        variant: ['outline', 'subtle'],
        class: `has-focus-visible:outline-3 has-focus-visible:ring-${color}`,
      })),
      {
        color: 'neutral',
        multiple: true,
        variant: ['outline', 'subtle'],
        class: 'has-focus-visible:outline-3 has-focus-visible:ring-ring-inverted',
      },
    ],
  },
  themeInput,
) as PThemeInputMenu;
