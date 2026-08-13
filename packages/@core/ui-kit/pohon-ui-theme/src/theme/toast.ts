import type { PThemeToast } from 'pohon-ui';
// @unocss-include
import { BRANDS } from '../constants.ts';

export const toast = {
  slots: {
    root: 'relative group overflow-hidden bg-background shadow-lg rounded-lg ring ring-ring p-4 flex gap-2.5',
    wrapper: 'w-0 flex-1 flex flex-col',
    title: 'text-sm font-medium color-text-highlighted',
    description: 'text-sm color-text-muted',
    icon: 'shrink-0 size-5',
    avatar: 'shrink-0',
    avatarSize: '2xl',
    actions: 'flex gap-1.5 shrink-0',
    progress: 'absolute inset-x-0 bottom-0',
    close: 'p-0',
  },
  variants: {
    color: {
      ...Object.fromEntries(BRANDS.map((color: string) => [
        color,
        {
          root: `outline-${color}/25 focus-visible:outline-3 focus-visible:ring-${color}`,
          icon: `color-${color}`,
        },
      ])),
      neutral: {
        root: 'outline-outline-inverted/25 focus-visible:outline-3 focus-visible:ring-ring-inverted',
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
        actions: 'items-start mt-2.5',
      },
    },
    title: {
      true: {
        description: 'mt-1',
      },
    },
  },
} satisfies PThemeToast;
