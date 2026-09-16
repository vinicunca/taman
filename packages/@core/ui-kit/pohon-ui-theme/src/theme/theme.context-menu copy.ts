// @unocss-include

import type { PThemeContextMenu } from 'pohon-ui';
import { POHON_THEME_BRANDS } from '../constants.ts';

export const themeContextMenu = {
  slots: {
    content: 'bg-background ring-ring rounded-md flex flex-col max-h-$akar-context-menu-content-available-height min-w-32 ring shadow-lg origin-$akar-context-menu-content-transform-origin overflow-hidden data-[state=closed]:(animate-out fade-out-0 zoom-out-95) data-[state=open]:(animate-in fade-in-0 zoom-in-95) data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
    viewport: 'divide-divide flex-1 relative overflow-y-auto scroll-py-1 divide-y',
    group: 'p-1 isolate',
    label: 'color-text-highlighted font-600 flex w-full items-center',
    separator: 'bg-border my-1 h-px -mx-1',
    item: 'group outline-none flex w-full select-none items-start relative before:(rounded-md inset-px absolute -z-1 content-empty) data-[disabled]:(opacity-75 cursor-not-allowed)',
    itemLeadingIcon: 'shrink-0',
    itemLeadingAvatar: 'shrink-0',
    itemLeadingAvatarSize: '',
    itemTrailing: 'ms-auto inline-flex gap-1.5 items-center',
    itemTrailingIcon: 'shrink-0',
    itemTrailingKbds: 'shrink-0 hidden items-center lg:inline-flex',
    itemTrailingKbdsSize: '',
    itemWrapper: 'text-start flex flex-1 flex-col min-w-0',
    itemLabel: 'truncate',
    itemDescription: 'color-text-muted truncate',
    itemLabelExternalIcon: 'color-text-dimmed align-top size-3 inline-block',
  },
  variants: {
    color: {
      ...Object.fromEntries(POHON_THEME_BRANDS.map((color: string) => [color, ''])),
      neutral: '',
    },
    active: {
      true: {
        item: 'color-text-highlighted before:bg-background-elevated',
        itemLeadingIcon: 'color-text',
      },
      false: {
        item: 'color-text data-[highlighted]:color-text-highlighted data-[state=open]:color-text-highlighted data-[highlighted]:before:bg-background-elevated/50 data-[state=open]:before:bg-background-elevated/50 transition-colors before:transition-colors',
        itemLeadingIcon: 'color-text-dimmed group-data-[highlighted]:color-text group-data-[state=open]:color-text transition-colors',
      },
    },
    loading: {
      true: {
        itemLeadingIcon: 'animate-spin',
      },
    },
    size: {
      xs: {
        label: 'text-xs p-1 gap-1',
        item: 'text-xs p-1 gap-1',
        itemLeadingIcon: 'size-4',
        itemLeadingAvatarSize: '3xs',
        itemTrailingIcon: 'size-4',
        itemTrailingKbds: 'gap-0.5',
        itemTrailingKbdsSize: 'sm',
      },
      sm: {
        label: 'text-xs p-1.5 gap-1.5',
        item: 'text-xs p-1.5 gap-1.5',
        itemLeadingIcon: 'size-4',
        itemLeadingAvatarSize: '3xs',
        itemTrailingIcon: 'size-4',
        itemTrailingKbds: 'gap-0.5',
        itemTrailingKbdsSize: 'sm',
      },
      md: {
        label: 'text-sm p-1.5 gap-1.5',
        item: 'text-sm p-1.5 gap-1.5',
        itemLeadingIcon: 'size-5',
        itemLeadingAvatarSize: '2xs',
        itemTrailingIcon: 'size-5',
        itemTrailingKbds: 'gap-0.5',
        itemTrailingKbdsSize: 'md',
      },
      lg: {
        label: 'text-sm p-2 gap-2',
        item: 'text-sm p-2 gap-2',
        itemLeadingIcon: 'size-5',
        itemLeadingAvatarSize: '2xs',
        itemTrailingIcon: 'size-5',
        itemTrailingKbds: 'gap-1',
        itemTrailingKbdsSize: 'md',
      },
      xl: {
        label: 'text-base p-2 gap-2',
        item: 'text-base p-2 gap-2',
        itemLeadingIcon: 'size-6',
        itemLeadingAvatarSize: 'xs',
        itemTrailingIcon: 'size-6',
        itemTrailingKbds: 'gap-1',
        itemTrailingKbdsSize: 'lg',
      },
    },
  },
  compoundVariants: [
    ...POHON_THEME_BRANDS.map((color: string) => ({
      color,
      active: false,
      class: {
        item: `color-${color} data-highlighted:color-${color} data-highlighted:before:bg-${color}/10 data-[state=open]:before:bg-${color}/10`,
        itemLeadingIcon: `color-${color}/75 group-data-highlighted:color-${color} group-data-[state=open]:color-${color}`,
      },
    })),
    ...POHON_THEME_BRANDS.map((color: string) => ({
      color,
      active: true,
      class: {
        item: `color-${color} before:bg-${color}/10`,
        itemLeadingIcon: `color-${color}`,
      },
    })),
  ],
} satisfies PThemeContextMenu;
