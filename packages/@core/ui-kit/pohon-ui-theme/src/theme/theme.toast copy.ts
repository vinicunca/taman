// @unocss-include
import type { PThemeToast } from 'pohon-ui';
import { POHON_THEME_BRANDS } from '../constants.ts';

export const themeToast = {
  slots: {
    root: 'group bg-background ring-ring p-4 rounded-lg flex gap-2.5 ring shadow-lg relative overflow-hidden',
    wrapper: 'flex flex-1 flex-col w-0',
    title: 'color-text-highlighted text-sm font-500',
    description: 'color-text-muted text-sm',
    icon: 'shrink-0 size-5',
    avatar: 'shrink-0',
    avatarSize: '2xl',
    actions: 'flex shrink-0 gap-1.5',
    progress: 'inset-x-0 bottom-0 absolute',
    close: 'p-0',
  },
  variants: {
    color: {
      ...Object.fromEntries(POHON_THEME_BRANDS.map((color) => [
        color,
        {
          root: `outline-${color}/25 focus-visible:outline-3 focus-visible:ring-${color}`,
          icon: `color-${color}`,
        },
      ])),
      neutral: {
        root: 'outline-outline-inverted/25 focus-visible:ring-ring-inverted focus-visible:outline-3',
        icon: 'color-text-highlighted',
      },
    },
    orientation: {
      horizontal: {
        root: 'items-center',
        actions: 'items-center',
      },
      vertical: {
        root: 'items-start',
        actions: 'mt-2.5 items-start',
      },
    },
    title: {
      true: {
        description: 'mt-1',
      },
    },
  },
} satisfies PThemeToast;
