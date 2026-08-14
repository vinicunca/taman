// @unocss-include

import type { PThemeBreadcrumb } from 'pohon-ui';
import { POHON_THEME_BRANDS } from '../constants.ts';

export const breadcrumb = {
  slots: {
    root: 'relative min-w-0',
    list: 'flex items-center gap-1.5',
    item: 'flex min-w-0',
    link: 'group relative flex items-center gap-1.5 text-sm min-w-0',
    linkLeadingIcon: 'shrink-0 size-5',
    linkLeadingAvatar: 'shrink-0',
    linkLeadingAvatarSize: '2xs',
    linkLabel: 'truncate',
    separator: 'flex',
    separatorIcon: 'shrink-0 size-5 color-text-muted',
  },
  variants: {
    active: {
      true: {
        link: 'font-semibold',
      },
      false: {
        link: 'color-text-muted font-medium',
      },
    },
    disabled: {
      true: {
        link: 'cursor-not-allowed opacity-75',
      },
    },
    to: {
      true: '',
    },
    color: {
      ...Object.fromEntries(POHON_THEME_BRANDS.map((color: string) => [color, { link: `focus-visible:outline-${color}` }])),
      neutral: { link: 'focus-visible:outline-inverted' },
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
    ...POHON_THEME_BRANDS.map((color: string) => ({
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
