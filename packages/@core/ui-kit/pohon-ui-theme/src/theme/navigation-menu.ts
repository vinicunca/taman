// @unocss-include
import type { PThemeNavigationMenu } from 'pohon-ui';
import { POHON_THEME_BRANDS } from '../constants.ts';

export const navigationMenu = {
  slots: {
    root: 'relative flex gap-1.5 [&>div]:min-w-0',
    list: 'isolate min-w-0',
    label: 'w-full flex items-center gap-1.5 font-semibold text-xs/5 color-text-highlighted px-2.5 py-1.5',
    item: 'min-w-0',
    link: 'group relative w-full flex items-center gap-1.5 font-medium text-sm before:(absolute content-empty -z-1 rounded-md) focus:outline-none focus-visible:outline-none dark:focus-visible:outline-none focus-visible:before:ring-inset focus-visible:before:ring-2',
    linkLeadingIcon: 'shrink-0 size-5',
    linkLeadingAvatar: 'shrink-0',
    linkLeadingAvatarSize: '2xs',
    linkLeadingChipSize: 'sm',
    linkTrailing: 'group ms-auto inline-flex gap-1.5 items-center',
    linkTrailingBadge: 'shrink-0',
    linkTrailingBadgeSize: 'sm',
    linkTrailingIcon: 'size-5 transform shrink-0 group-data-[state=open]:rotate-180 transition-transform-200',
    linkLabel: 'truncate',
    linkLabelExternalIcon: 'inline-block size-3 align-top color-text-dimmed',
    childList: 'isolate',
    childLabel: 'text-xs color-text-highlighted',
    childLink: 'group relative size-full flex items-start text-start text-sm before:(content-empty absolute -z-1 rounded-md) focus:outline-none focus-visible:outline-none dark:focus-visible:outline-none focus-visible:before:ring-inset focus-visible:before:ring-2',
    childLinkWrapper: 'min-w-0',
    childLinkIcon: 'size-5 shrink-0',
    childLinkLabel: 'truncate',
    childLinkLabelExternalIcon: 'inline-block size-3 align-top color-text-dimmed',
    childLinkDescription: 'color-text-muted',
    separator: 'px-2 h-px bg-border',
    viewportWrapper: 'absolute top-full left-0 flex w-full',
    viewport: 'relative overflow-hidden bg-background shadow-lg rounded-md ring ring-ring h-$akar-navigation-menu-viewport-height w-full transition-[width,height,left]-280 origin-[top_center] data-[state=open]:(animate-in zoom-in-90) data-[state=closed]:(animate-out fade-out-0 zoom-out-95) z-1',
    indicator: 'absolute data-[state=visible]:(animate-in fade-in) data-[state=hidden]:(animate-out fade-out) bottom-0 z-2 w-$akar-navigation-menu-indicator-size translate-x-$akar-navigation-menu-indicator-position flex h-2.5 items-end justify-center overflow-hidden transition-[transform,width]-280',
    arrow: 'relative top-[50%] size-2.5 rotate-45 border border-border bg-background z-1 rounded-xs',
  },
  variants: {
    color: {
      ...Object.fromEntries(POHON_THEME_BRANDS.map((color: string) => [color, {
        link: `focus-visible:before:ring-${color}`,
        childLink: `focus-visible:before:ring-${color}`,
      }])),
      neutral: {
        link: 'focus-visible:before:ring-ring-inverted',
        childLink: 'focus-visible:before:ring-ring-inverted',
      },
    },
    highlightColor: {
      ...Object.fromEntries(POHON_THEME_BRANDS.map((color: string) => [color, ''])),
      neutral: '',
    },
    variant: {
      pill: '',
      link: '',
    },
    orientation: {
      horizontal: {
        root: 'items-center justify-between',
        list: 'flex items-center',
        item: 'py-2',
        link: 'px-2.5 py-1.5 before:inset-x-px before:inset-y-0',
        childList: 'grid p-2',
        childLink: 'px-3 py-2 gap-2 before:inset-x-px before:inset-y-0',
        childLinkLabel: 'font-medium',
        content: 'absolute top-0 left-0 w-full max-h-[70vh] overflow-y-auto',
      },
      vertical: {
        root: 'flex-col',
        link: 'flex-row px-2.5 py-1.5 before:inset-y-px before:inset-x-0',
        childLabel: 'px-1.5 py-0.5',
        childLink: 'p-1.5 gap-1.5 before:inset-y-px before:inset-x-0',
      },
    },
    contentOrientation: {
      horizontal: {
        viewportWrapper: 'justify-center',
        content: 'data-[motion^=from-]:(animate-in fade-in) data-[motion^=to-]:(animate-out fade-out) data-[motion=from-end]:slide-in-from-right-52 data-[motion=from-start]:slide-in-from-left-52 data-[motion=to-end]:slide-out-to-right-52 data-[motion=to-start]:slide-out-to-left-52',
      },
      vertical: {
        viewport: 'sm:w-$akar-navigation-menu-viewport-width left-$akar-navigation-menu-viewport-left rtl:left-auto rtl:right-[calc(100%-var(--akar-navigation-menu-viewport-left)-var(--akar-navigation-menu-viewport-width))]',
      },
    },
    active: {
      true: {
        childLink: 'before:bg-background-elevated color-text-highlighted',
        childLinkIcon: 'color-text',
      },
      false: {
        link: 'color-text-muted',
        linkLeadingIcon: 'color-text-dimmed',
        childLink: 'hover:before:bg-background-elevated/50 color-text hover:color-text-highlighted transition-colors before:transition-colors',
        childLinkIcon: 'color-text-dimmed group-hover:color-text transition-colors',
      },
    },
    disabled: {
      true: {
        link: 'cursor-not-allowed opacity-75',
      },
    },
    highlight: {
      true: '',
    },
    level: {
      true: '',
    },
    collapsed: {
      true: '',
    },
  },
  compoundVariants: [
    {
      orientation: 'horizontal',
      contentOrientation: 'horizontal',
      class: {
        childList: 'grid-cols-2 gap-2',
      },
    },
    {
      orientation: 'horizontal',
      contentOrientation: 'vertical',
      class: {
        childList: 'gap-1',
        content: 'w-60',
      },
    },
    {
      orientation: 'vertical',
      collapsed: false,
      class: {
        childList: 'ms-5 border-s border-border',
        childItem: 'ps-1.5 -ms-px',
        content: 'data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up overflow-hidden',
      },
    },
    {
      orientation: 'vertical',
      collapsed: true,
      class: {
        link: 'px-1.5',
        linkLabel: 'hidden',
        linkTrailing: 'hidden',
        content: 'shadow-sm rounded-sm min-h-6 p-1',
      },
    },
    {
      orientation: 'horizontal',
      highlight: true,
      class: {
        link: 'after:absolute after:-bottom-2 after:inset-x-2.5 after:block after:h-px after:rounded-full after:transition-colors',
      },
    },
    {
      orientation: 'vertical',
      highlight: true,
      level: true,
      class: {
        link: 'after:absolute after:-start-1.5 after:inset-y-0.5 after:block after:w-px after:rounded-full after:transition-colors',
      },
    },
    {
      disabled: false,
      active: false,
      variant: 'pill',
      class: {
        link: 'hover:color-text-highlighted hover:before:bg-background-elevated/50 transition-colors before:transition-colors',
        linkLeadingIcon: 'group-hover:color-text transition-colors',
      },
    },
    {
      disabled: false,
      active: false,
      variant: 'pill',
      orientation: 'horizontal',
      class: {
        link: 'data-[state=open]:color-text-highlighted',
        linkLeadingIcon: 'group-data-[state=open]:color-text',
      },
    },
    {
      disabled: false,
      variant: 'pill',
      highlight: true,
      orientation: 'horizontal',
      class: {
        link: 'data-[state=open]:before:bg-background-elevated/50',
      },
    },
    {
      disabled: false,
      variant: 'pill',
      highlight: false,
      active: false,
      orientation: 'horizontal',
      class: {
        link: 'data-[state=open]:before:bg-background-elevated/50',
      },
    },
    ...POHON_THEME_BRANDS.map((color: string) => ({
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
        link: 'hover:color-text-highlighted transition-colors',
        linkLeadingIcon: 'group-hover:color-text transition-colors',
      },
    },
    {
      disabled: false,
      active: false,
      variant: 'link',
      orientation: 'horizontal',
      class: {
        link: 'data-[state=open]:color-text-highlighted',
        linkLeadingIcon: 'group-data-[state=open]:color-text',
      },
    },
    ...POHON_THEME_BRANDS.map((color: string) => ({
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
    ...POHON_THEME_BRANDS.map((highlightColor: string) => ({
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
} satisfies PThemeNavigationMenu;
