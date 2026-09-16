// @unocss-include
import type {
  PThemeBreadcrumb,
} from 'pohon-ui';
import { POHON_THEME_BRANDS } from '../constants.ts';

export const themeBreadcrumb = {
  slots: {
    root: 'min-w-0 relative',
    list: 'flex gap-1.5 items-center',
    item: 'flex min-w-0',
    link: 'group text-sm rounded-md flex gap-1.5 min-w-0 items-center relative',
    linkLeadingIcon: 'shrink-0 size-5',
    linkLeadingAvatar: 'shrink-0',
    linkLeadingAvatarSize: '2xs',
    linkLabel: 'truncate',
    separator: 'flex',
    separatorIcon: 'color-text-muted shrink-0 size-5',
  },
  variants: {
    active: {
      true: {
        link: 'font-600',
      },
      false: {
        link: 'color-text-muted font-500',
      },
    },
    disabled: {
      true: {
        link: 'opacity-75 cursor-not-allowed',
      },
    },
    color: {
      ...Object.fromEntries(POHON_THEME_BRANDS.map((color) => [
        color,
        { link: `outline-${color}/25 focus-visible:outline-3` },
      ])),
      neutral: { link: 'outline-outline-inverted/25 focus-visible:outline-3' },
    },
  },
  compoundVariants: [
    {
      disabled: false,
      active: false,
      to: true,
      class: {
        link: 'hover:color-text transition-colors',
      },
    },
    ...POHON_THEME_BRANDS.map((color) => ({
      color,
      active: true,
      class: {
        link: `color-${color}`,
      },
    })),
    {
      color: 'neutral',
      active: true,
      class: {
        link: 'color-text-highlighted',
      },
    },
  ],
} satisfies PThemeBreadcrumb;
