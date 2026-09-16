// @unocss-include
import { POHON_THEME_BRANDS } from '../constants.ts';

// Active-tab highlight shown before akar's `TabsIndicator` mounts (SSR / pre-hydration).
// akar only renders the real indicator on the client (it needs DOM measurements), so we gate
// a CSS-only pseudo-element fallback on the active trigger by the *absence* of the indicator
// element — the instant akar's measured indicator appears, this selector stops matching.
// use this variant class: `list-no-indicator:data-[state=active]:`

export const themeTabs = {
  slots: {
    root: 'flex gap-2 items-center',
    list: 'group p-1 flex relative',
    indicator: 'transition-[transform,width]-280 ease-out absolute motion-reduce:transition-none',
    trigger: 'group font-500 rounded-md inline-flex min-w-0 transition-colors items-center relative data-[state=inactive]:color-text-muted disabled:(opacity-75 cursor-not-allowed) hover:data-[state=inactive]:not-disabled:color-text',
    leadingIcon: 'shrink-0',
    leadingAvatar: 'shrink-0',
    leadingAvatarSize: '',
    label: 'truncate',
    trailingBadge: 'shrink-0',
    trailingBadgeSize: 'sm',
    content: 'rounded-md w-full focus-visible:outline-3',
  },
  variants: {
    color: {
      ...Object.fromEntries(POHON_THEME_BRANDS.map((color: string) => [color, {
        content: `outline-${color}/25`,
      }])),
      neutral: {
        content: 'outline-outline-inverted/25',
      },
    },
    variant: {
      pill: {
        list: 'rounded-lg bg-background-elevated',
        trigger: 'list-no-indicator:data-[state=active]:isolate list-no-indicator:data-[state=active]:before:content-empty list-no-indicator:data-[state=active]:before:absolute list-no-indicator:data-[state=active]:before:inset-0 list-no-indicator:data-[state=active]:before:rounded-md list-no-indicator:data-[state=active]:before:shadow-xs list-no-indicator:data-[state=active]:before:-z-10 grow',
        indicator: 'rounded-md shadow-xs',
      },
      link: {
        list: 'border-border',
        indicator: 'rounded-full',
        trigger: 'list-no-indicator:data-[state=active]:after:content-empty list-no-indicator:data-[state=active]:after:absolute list-no-indicator:data-[state=active]:after:rounded-full',
      },
    },
    orientation: {
      horizontal: {
        root: 'flex-col',
        list: 'w-full',
        indicator: 'w-$akar-tabs-indicator-size translate-x-$akar-tabs-indicator-position left-0',
        trigger: 'justify-center',
      },
      vertical: {
        list: 'flex-col',
        indicator: 'h-$akar-tabs-indicator-size translate-y-$akar-tabs-indicator-position top-0',
      },
    },
    size: {
      xs: {
        trigger: 'text-xs px-2 py-1 gap-1',
        leadingIcon: 'size-4',
        leadingAvatarSize: '3xs',
      },
      sm: {
        trigger: 'text-xs px-2.5 py-1.5 gap-1.5',
        leadingIcon: 'size-4',
        leadingAvatarSize: '3xs',
      },
      md: {
        trigger: 'text-sm px-3 py-1.5 gap-1.5',
        leadingIcon: 'size-5',
        leadingAvatarSize: '2xs',
      },
      lg: {
        trigger: 'text-sm px-3 py-2 gap-2',
        leadingIcon: 'size-5',
        leadingAvatarSize: '2xs',
      },
      xl: {
        trigger: 'text-base px-3 py-2 gap-2',
        leadingIcon: 'size-6',
        leadingAvatarSize: 'xs',
      },
    },
  },
  compoundVariants: [
    {
      orientation: 'horizontal',
      variant: 'pill',
      class: {
        indicator: 'inset-y-1',
      },
    },
    {
      orientation: 'horizontal',
      variant: 'link',
      class: {
        list: 'border-b -mb-px',
        indicator: '-bottom-px h-px',
        trigger: 'list-no-indicator:data-[state=active]:after:inset-x-0 list-no-indicator:data-[state=active]:after:-bottom-[calc(var(--spacing)+1px)] list-no-indicator:data-[state=active]:after:h-px',
      },
    },
    {
      orientation: 'vertical',
      variant: 'pill',
      class: {
        indicator: 'inset-x-1',
        list: 'items-center',
        trigger: 'w-full justify-center',
      },
    },
    {
      orientation: 'vertical',
      variant: 'link',
      class: {
        list: 'border-s -ms-px',
        indicator: '-start-px w-px',
        trigger: 'list-no-indicator:data-[state=active]:after:inset-y-0 list-no-indicator:data-[state=active]:after:-start-[calc(var(--spacing)+1px)] list-no-indicator:data-[state=active]:after:w-px',
      },
    },
    ...POHON_THEME_BRANDS.map((color: string) => ({
      color,
      variant: 'pill',
      class: {
        indicator: `bg-${color}`,
        trigger: [
          `data-[state=active]:color-text-inverted outline-${color}/25 focus-visible:outline-3`,
          `list-no-indicator:data-[state=active]:before:bg-${color}`,
        ],
      },
    })),
    {
      color: 'neutral',
      variant: 'pill',
      class: {
        indicator: 'bg-background-inverted',
        trigger: [
          'data-[state=active]:color-text-inverted outline-outline-inverted/25 focus-visible:outline-3',
          'list-no-indicator:data-[state=active]:before:bg-background-inverted',
        ],
      },
    },
    ...POHON_THEME_BRANDS.map((color: string) => ({
      color,
      variant: 'link',
      class: {
        indicator: `bg-${color}`,
        trigger: [
          `data-[state=active]:color-${color} outline-${color}/25 focus-visible:outline-3`,
          `list-no-indicator:data-[state=active]:after:bg-${color}`,
        ],
      },
    })),
    {
      color: 'neutral',
      variant: 'link',
      class: {
        indicator: 'bg-background-inverted',
        trigger: [
          'data-[state=active]:color-text-highlighted outline-outline-inverted/25 focus-visible:outline-3',
          'list-no-indicator:data-[state=active]:after:bg-background-inverted',
        ],
      },
    },
  ],
};
