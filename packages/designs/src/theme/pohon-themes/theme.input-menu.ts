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
      content: 'max-h-[min(15rem,var(--akar-combobox-content-available-height,15rem))] w-$akar-combobox-trigger-width bg-background shadow-lg rounded-md ring ring-ring overflow-hidden data-[state=closed]:(animate-out fade-out-0 zoom-out-95) data-[state=open]:(animate-in fade-in-0 zoom-in-95) data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-$akar-combobox-content-transform-origin pointer-events-auto flex flex-col',
      viewport: 'relative scroll-py-1 overflow-y-auto flex-1',
      group: 'p-1 isolate',
      empty: 'text-center color-text-muted',
      label: 'font-600 color-text-highlighted',
      separator: '-mx-1 my-1 h-px bg-border',
      item: 'group color-text data-[highlighted]:not-[[data-disabled]]:color-text-highlighted data-[highlighted]:not-[[data-disabled]]:before:bg-background-elevated/50 text-sm p-1.5 outline-none flex gap-1.5 w-full select-none transition-colors items-start relative before:(rounded-md content-empty transition-colors inset-px absolute -z-1) data-[disabled]:(opacity-75 cursor-not-allowed)',
      itemLeadingIcon: 'shrink-0 color-text-dimmed [.group[data-highlighted]:not([data-disabled])_&]:color-text transition-colors',
      itemLeadingAvatar: 'shrink-0',
      itemLeadingAvatarSize: '',
      itemLeadingChip: 'shrink-0',
      itemLeadingChipSize: '',
      itemTrailing: 'ms-auto inline-flex gap-1.5 items-center',
      itemTrailingIcon: 'shrink-0',
      itemWrapper: 'flex-1 flex flex-col min-w-0',
      itemLabel: 'truncate',
      itemDescription: 'truncate color-text-muted',
      tagsItem: 'px-1.5 py-0.5 rounded-sm font-500 inline-flex items-center gap-0.5 ring ring-inset ring-ring-accented bg-background-elevated color-text data-[disabled]:(cursor-not-allowed opacity-75)',
      tagsItemText: 'truncate',
      tagsItemDelete: 'inline-flex items-center rounded-xs color-text-dimmed hover:color-text hover:bg-background-accented/75 disabled:pointer-events-none transition-colors',
      tagsItemDeleteIcon: 'shrink-0',
      tagsInput: 'flex-1 border-0 bg-transparent placeholder:color-text-dimmed focus:outline-none disabled:(cursor-not-allowed opacity-75)',
    },
    variants: {
      virtualize: {
        true: {
          viewport: 'p-1 isolate',
        },
        false: {
          viewport: 'divide-y divide-divide',
        },
      },
      multiple: {
        true: {
          root: 'flex-wrap',
        },
        false: {
          base: 'w-full border-0 placeholder:color-text-dimmed disabled:(cursor-not-allowed opacity-75)',
        },
      },
      size: {
        xs: {
          label: 'p-1 text-[10px]/3 gap-1',
          item: 'p-1 text-xs gap-1',
          itemLeadingIcon: 'size-4',
          itemLeadingAvatarSize: '3xs',
          itemLeadingChip: 'size-4',
          itemLeadingChipSize: 'sm',
          itemTrailingIcon: 'size-4',
          tagsItem: 'text-[10px]/3',
          tagsItemDeleteIcon: 'size-3',
          empty: 'p-2 text-xs',
        },
        sm: {
          label: 'p-1.5 text-[10px]/3 gap-1.5',
          item: 'p-1.5 text-xs gap-1.5',
          itemLeadingIcon: 'size-4',
          itemLeadingAvatarSize: '3xs',
          itemLeadingChip: 'size-4',
          itemLeadingChipSize: 'sm',
          itemTrailingIcon: 'size-4',
          tagsItem: 'text-[10px]/3',
          tagsItemDeleteIcon: 'size-3',
          empty: 'p-2.5 text-xs',
        },
        md: {
          label: 'p-1.5 text-xs gap-1.5',
          item: 'p-1.5 text-sm gap-1.5',
          itemLeadingIcon: 'size-5',
          itemLeadingAvatarSize: '2xs',
          itemLeadingChip: 'size-5',
          itemLeadingChipSize: 'md',
          itemTrailingIcon: 'size-5',
          tagsItem: 'text-xs',
          tagsItemDeleteIcon: 'size-3.5',
          empty: 'p-2.5 text-sm',
        },
        lg: {
          label: 'p-2 text-xs gap-2',
          item: 'p-2 text-sm gap-2',
          itemLeadingIcon: 'size-5',
          itemLeadingAvatarSize: '2xs',
          itemLeadingChip: 'size-5',
          itemLeadingChipSize: 'md',
          itemTrailingIcon: 'size-5',
          tagsItem: 'text-xs',
          tagsItemDeleteIcon: 'size-3.5',
          empty: 'p-3 text-sm',
        },
        xl: {
          label: 'p-2 text-sm gap-2',
          item: 'p-2 text-base gap-2',
          itemLeadingIcon: 'size-6',
          itemLeadingAvatarSize: 'xs',
          itemLeadingChip: 'size-6',
          itemLeadingChipSize: 'lg',
          itemTrailingIcon: 'size-6',
          tagsItem: 'text-sm',
          tagsItemDeleteIcon: 'size-4',
          empty: 'p-3 text-base',
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
