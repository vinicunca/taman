// @unocss-include

import type { PThemeEmpty } from 'pohon-ui';

export const empty = {
  slots: {
    root: 'relative flex flex-col items-center justify-center gap-4 rounded-lg p-4 sm:p-6 lg:p-8 min-w-0',
    header: 'flex flex-col items-center gap-2 max-w-sm text-center',
    avatar: 'shrink-0 mb-2',
    title: 'color-text-highlighted text-pretty font-medium',
    description: 'text-balance text-center',
    body: 'flex flex-col items-center gap-4 max-w-sm',
    actions: 'flex flex-wrap justify-center gap-2 shrink-0',
    footer: 'flex flex-col items-center gap-2 max-w-sm',
  },
  variants: {
    size: {
      xs: {
        avatar: 'size-8 text-base',
        title: 'text-sm',
        description: 'text-xs',
      },
      sm: {
        avatar: 'size-9 text-lg',
        title: 'text-sm',
        description: 'text-xs',
      },
      md: {
        avatar: 'size-10 text-xl',
        title: 'text-base',
        description: 'text-sm',
      },
      lg: {
        avatar: 'size-11 text-[22px]',
        title: 'text-base',
        description: 'text-sm',
      },
      xl: {
        avatar: 'size-12 text-2xl',
        title: 'text-lg',
        description: 'text-base',
      },
    },
    variant: {
      solid: {
        root: 'bg-background-inverted',
        title: 'color-text-inverted',
        description: 'color-text-dimmed',
      },
      outline: {
        root: 'bg-background ring ring-ring',
        description: 'color-text-muted',
      },
      soft: {
        root: 'bg-background-elevated/50',
        description: 'color-text-toned',
      },
      subtle: {
        root: 'bg-background-elevated/50 ring ring-ring',
        description: 'color-text-toned',
      },
      naked: {
        description: 'color-text-muted',
      },
    },
  },
} satisfies PThemeEmpty;
