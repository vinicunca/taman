// @unocss-include
import type { PThemeSelect } from 'pohon-ui';
import { defuFn } from 'defu';
import { fieldGroupVariant } from './theme.field-group.ts';
import { themeInput } from './theme.input.ts';

// `defuFn` keeps merger callbacks (e.g. `variant: (prev) => …`) in the inferred
// type, so `satisfies PThemeSelect` fails — assert the runtime-merged shape.
export const themeSelect = defuFn(
  {
    slots: {
      root: () => undefined,
      base: () => 'group rounded-md inline-flex transition-colors items-center relative disabled:(opacity-75 cursor-not-allowed)',
      value: 'pointer-events-none truncate',
      placeholder: 'color-text-dimmed truncate',
      arrow: 'fill-fill-bg stroke-stroke',
      content: 'bg-background ring-ring rounded-md flex flex-col max-h-[min(15rem,var(--akar-select-content-available-height,15rem))] w-$akar-select-trigger-width pointer-events-auto ring shadow-lg origin-$akar-select-content-transform-origin overflow-hidden',
      viewport: 'divide-divide flex-1 relative overflow-y-auto scroll-py-1 divide-y',
      group: 'p-1 isolate',
      empty: 'color-text-muted text-center',
      label: 'color-text-highlighted font-600',
      separator: 'bg-border my-1 h-px -mx-1',
      item: 'group color-text data-[highlighted]:not-[[data-disabled]]:color-text-highlighted data-[highlighted]:not-[[data-disabled]]:before:bg-background-elevated/50 outline-none flex w-full select-none transition-colors items-start relative before:(rounded-md content-empty transition-colors inset-px absolute -z-1) data-[disabled]:(opacity-75 cursor-not-allowed)',
      itemLeadingIcon: 'color-text-dimmed [.group[data-highlighted]:not([data-disabled])_&]:color-text shrink-0 transition-colors',
      itemLeadingAvatar: 'shrink-0',
      itemLeadingAvatarSize: '',
      itemLeadingChip: 'shrink-0',
      itemLeadingChipSize: '',
      itemTrailing: 'ms-auto inline-flex gap-1.5 items-center',
      itemTrailingIcon: 'shrink-0',
      itemWrapper: 'flex flex-1 flex-col min-w-0',
      itemLabel: 'truncate',
      itemDescription: 'color-text-muted truncate',
    },
    variants: {
      ...fieldGroupVariant,
      variant: (prev: Record<string, string>) => ({
        ...prev,
        outline: [prev.outline, 'hover:bg-background-elevated/70 disabled:bg-background-accented'].join(' '),
        subtle: [prev.subtle, 'hover:bg-background-accented/75 disabled:bg-background-elevated'].join(' '),
      }),
      size: {
        xs: {
          label: 'text-[10px]/3 p-1 gap-1',
          item: 'text-xs p-1 gap-1',
          itemLeadingIcon: 'size-4',
          itemLeadingAvatarSize: '3xs',
          itemLeadingChip: 'size-4',
          itemLeadingChipSize: 'sm',
          itemTrailingIcon: 'size-4',
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
          empty: 'text-base p-3',
        },
      },
      position: {
        'popper': {
          content: 'data-[side=bottom]:(translate-y-1 slide-in-from-top-2) data-[side=right]:(translate-x-1 slide-in-from-left-2) data-[state=closed]:(animate-out fade-out-0 zoom-out-95) data-[state=open]:(animate-in fade-in-0 zoom-in-95) data-[side=left]:(slide-in-from-right-2 -translate-x-1) data-[side=top]:(slide-in-from-bottom-2 -translate-y-1)',
        },
        'item-aligned': {
          content: '',
        },
      },
      multiple: {
        true: '',
      },
    },
  },
  themeInput,
) as PThemeSelect;
