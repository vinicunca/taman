// @unocss-include

import type { PThemeSelect } from 'pohon-ui';
import { isString, omit } from '@taman-core/shared/utils';
import { defu } from 'defu';
import { fieldGroupVariant } from './field-group.ts';
import { input } from './input.ts';

const inputSlots = omit(input.slots, ['root', 'base']);

export const select = {
  slots: defu(
    {
      base: 'relative group rounded-md inline-flex items-center focus:outline-none disabled:(cursor-not-allowed opacity-75) transition-colors',
      value: 'truncate pointer-events-none',
      placeholder: 'truncate color-text-dimmed',
      arrow: 'fill-bg stroke-default',
      content: 'max-h-[min(15rem,var(--akar-select-content-available-height))] w-$akar-select-trigger-width bg-background shadow-lg rounded-md ring ring-ring overflow-hidden origin-$akar-select-content-transform-origin pointer-events-auto flex flex-col',
      viewport: 'relative divide-y divide-divide scroll-py-1 overflow-y-auto flex-1',
      group: 'p-1 isolate',
      empty: 'text-center color-text-muted',
      label: 'font-semibold color-text-highlighted',
      separator: '-mx-1 my-1 h-px bg-border',
      item: 'group relative w-full flex items-start select-none outline-none before:(content-empty absolute -z-1 inset-px rounded-md) data-[disabled]:(cursor-not-allowed opacity-75) color-text data-[highlighted]:not-[data-disabled]:color-text-highlighted data-[highlighted]:not-[data-disabled]:before:bg-background-elevated/50 transition-colors before:transition-colors',
      itemLeadingIcon: 'shrink-0 color-text-dimmed transition-colors group-data-[highlighted]:group-not-[[data-disabled]]:color-text',
      itemLeadingAvatar: 'shrink-0',
      itemLeadingAvatarSize: '',
      itemLeadingChip: 'shrink-0',
      itemLeadingChipSize: '',
      itemTrailing: 'ms-auto inline-flex gap-1.5 items-center',
      itemTrailingIcon: 'shrink-0',
      itemWrapper: 'flex-1 flex flex-col min-w-0',
      itemLabel: 'truncate',
      itemDescription: 'truncate color-text-muted',
    },
    inputSlots,
  ),
  variants: defu(
    {
      ...fieldGroupVariant,

      variant: {
        outline: [input.variants.variant.outline, 'hover:bg-background-elevated disabled:bg-background'].join(' '),
        subtle: [input.variants.variant.subtle, 'hover:bg-background-accented/75 disabled:bg-background-elevated'].join(' '),
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
          empty: 'text-xs p-1',
        },
        sm: {
          label: 'text-[10px]/3 p-1.5 gap-1.5',
          item: 'text-xs p-1.5 gap-1.5',
          itemLeadingIcon: 'size-4',
          itemLeadingAvatarSize: '3xs',
          itemLeadingChip: 'size-4',
          itemLeadingChipSize: 'sm',
          itemTrailingIcon: 'size-4',
          empty: 'text-xs p-1.5',
        },
        md: {
          label: 'text-xs p-1.5 gap-1.5',
          item: 'text-sm p-1.5 gap-1.5',
          itemLeadingIcon: 'size-5',
          itemLeadingAvatarSize: '2xs',
          itemLeadingChip: 'size-5',
          itemLeadingChipSize: 'md',
          itemTrailingIcon: 'size-5',
          empty: 'text-sm p-1.5',
        },
        lg: {
          label: 'text-xs p-2 gap-2',
          item: 'text-sm p-2 gap-2',
          itemLeadingIcon: 'size-5',
          itemLeadingAvatarSize: '2xs',
          itemLeadingChip: 'size-5',
          itemLeadingChipSize: 'md',
          itemTrailingIcon: 'size-5',
          empty: 'text-sm p-2',
        },
        xl: {
          label: 'text-sm p-2 gap-2',
          item: 'text-base p-2 gap-2',
          itemLeadingIcon: 'size-6',
          itemLeadingAvatarSize: 'xs',
          itemLeadingChip: 'size-6',
          itemLeadingChipSize: 'lg',
          itemTrailingIcon: 'size-6',
          empty: 'text-base p-2',
        },
      },
    },
    input.variants,
  ),
  compoundVariants: [
    ...input.compoundVariants.map((item) => ({
      ...item,
      class: isString(item.class) ? replaceFocus(item.class) : item.class,
    })),
  ],
} satisfies PThemeSelect;

function replaceFocus(str: string): string {
  return str
    .replace(/focus-visible:/g, 'focus:');
}
