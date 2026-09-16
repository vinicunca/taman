// @unocss-include
import type {
  PThemeAvatar,
  PThemeAvatarGroup,
} from 'pohon-ui';
import { POHON_THEME_BRANDS } from '../constants.ts';

export const themeAvatar = {
  slots: {
    root: 'align-middle rounded-full inline-flex shrink-0 select-none items-center justify-center',
    image: 'rounded-inherit h-full w-full object-cover',
    fallback: 'font-500 truncate',
    icon: 'shrink-0',
  },
  variants: {
    color: {
      ...Object.fromEntries((POHON_THEME_BRANDS).map((color) => [color, {
        root: `bg-${color}/10`,
        fallback: `color-${color}`,
        icon: `color-${color}`,
      }])),
      neutral: {
        root: 'bg-background-elevated',
        fallback: 'color-text-muted',
        icon: 'color-text-muted',
      },
    },
    size: {
      '3xs': {
        root: 'text-[8px] size-4',
      },
      '2xs': {
        root: 'text-[10px] size-5',
      },
      'xs': {
        root: 'text-xs size-6',
      },
      'sm': {
        root: 'text-sm size-7',
      },
      'md': {
        root: 'text-base size-8',
      },
      'lg': {
        root: 'text-lg size-9',
      },
      'xl': {
        root: 'text-xl size-10',
      },
      '2xl': {
        root: 'text-[22px] size-11',
      },
      '3xl': {
        root: 'text-2xl size-12',
      },
    },
  },
} satisfies PThemeAvatar;

export const themeAvatarGroup = {
  slots: {
    root: 'inline-flex flex-row-reverse justify-end',
    base: 'ring-background rounded-full relative first:me-0',
  },
  variants: {
    size: {
      '3xs': {
        base: 'ring -me-0.5',
      },
      '2xs': {
        base: 'ring -me-0.5',
      },
      'xs': {
        base: 'ring -me-0.5',
      },
      'sm': {
        base: 'ring-2 -me-1.5',
      },
      'md': {
        base: 'ring-2 -me-1.5',
      },
      'lg': {
        base: 'ring-2 -me-1.5',
      },
      'xl': {
        base: 'ring-3 -me-2',
      },
      '2xl': {
        base: 'ring-3 -me-2',
      },
      '3xl': {
        base: 'ring-3 -me-2',
      },
    },
  },
} satisfies PThemeAvatarGroup;
