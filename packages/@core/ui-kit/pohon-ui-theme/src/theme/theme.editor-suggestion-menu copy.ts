// @unocss-include

import type { PThemeEditorSuggestionMenu } from 'pohon-ui';

export const themeEditorSuggestionMenu = {
  slots: {
    content: 'rounded-md bg-background flex flex-col max-h-96 max-w-60 min-w-48 ring ring-ring shadow-lg origin-$akar-dropdown-menu-content-transform-origin overflow-hidden data-[state=closed]:(animate-out fade-out-0 zoom-out-95) data-[state=open]:(animate-in fade-in-0 zoom-in-95)',
    viewport: 'flex-1 relative overflow-y-auto scroll-py-1 divide-divide divide-y',
    group: 'p-1 isolate',
    label: 'color-text-highlighted font-semibold flex w-full items-center',
    separator: 'my-1 bg-border h-px -mx-1',
    item: 'group outline-none flex w-full select-none items-start relative before:(rounded-md content-empty inset-px absolute -z-1) data-[disabled]:(opacity-75 cursor-not-allowed)',
    itemLeadingIcon: 'flex shrink-0 items-center justify-center',
    itemLeadingAvatar: 'shrink-0',
    itemLeadingAvatarSize: '',
    itemWrapper: 'text-start flex flex-1 flex-col min-w-0',
    itemLabel: 'truncate',
    itemDescription: 'color-text-muted truncate',
    itemLabelExternalIcon: 'color-text-dimmed align-top size-3 inline-block',
  },
  variants: {
    size: {
      xs: {
        label: 'text-[10px]/3 p-1 gap-1',
        item: 'text-xs p-1 gap-1',
        itemLeadingIcon: 'text-sm size-4',
        itemLeadingAvatarSize: '3xs',
      },
      sm: {
        label: 'text-[10px]/3 p-1.5 gap-1.5',
        item: 'text-xs p-1.5 gap-1.5',
        itemLeadingIcon: 'text-sm size-4',
        itemLeadingAvatarSize: '3xs',
      },
      md: {
        label: 'text-xs p-1.5 gap-1.5',
        item: 'text-sm p-1.5 gap-1.5',
        itemLeadingIcon: 'text-base size-5',
        itemLeadingAvatarSize: '2xs',
      },
      lg: {
        label: 'text-xs p-2 gap-2',
        item: 'text-sm p-2 gap-2',
        itemLeadingIcon: 'text-base size-5',
        itemLeadingAvatarSize: '2xs',
      },
      xl: {
        label: 'text-sm p-2 gap-2',
        item: 'text-base p-2 gap-2',
        itemLeadingIcon: 'text-xl size-6',
        itemLeadingAvatarSize: 'xs',
      },
    },
    active: {
      true: {
        item: 'color-text-highlighted before:bg-background-elevated/75',
        itemLeadingIcon: 'color-text',
      },
      false: {
        item: 'color-text transition-colors before:transition-colors data-[highlighted]:not-[[data-disabled]]:color-text-highlighted data-[highlighted]:not-[[data-disabled]]:before:bg-background-elevated/50',
        itemLeadingIcon: 'color-text-dimmed transition-colors [.group[data-highlighted]:not([data-disabled])_&]:color-text',
      },
    },
  },
} satisfies PThemeEditorSuggestionMenu;
