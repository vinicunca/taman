import type { PThemeEmpty } from 'pohon-ui';

// @unocss-include
export const themeEmpty = {
  slots: {
    root: 'p-4 rounded-lg flex flex-col gap-4 min-w-0 items-center justify-center relative lg:p-8 sm:p-6',
    header: 'text-center flex flex-col gap-2 max-w-sm items-center',
    avatar: 'mb-2 shrink-0',
    title: 'color-text-highlighted font-500 text-pretty',
    description: 'text-center text-balance',
    body: 'flex flex-col gap-4 max-w-sm items-center',
    actions: 'flex shrink-0 flex-wrap gap-2 justify-center',
    footer: 'flex flex-col gap-2 max-w-sm items-center',
  },
  variants: {
    size: {
      xs: {
        avatar: 'pohon:size-8 text-base',
        title: 'text-sm',
        description: 'text-xs',
      },
      sm: {
        avatar: 'pohon:size-9 text-lg',
        title: 'text-sm',
        description: 'text-xs',
      },
      md: {
        avatar: 'pohon:size-10 text-xl',
        title: 'text-base',
        description: 'text-sm',
      },
      lg: {
        avatar: 'pohon:size-11 text-[22px]',
        title: 'text-base',
        description: 'text-sm',
      },
      xl: {
        avatar: 'pohon:size-12 text-2xl',
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
        root: 'bg-background ring-ring ring',
        description: 'color-text-muted',
      },
      soft: {
        root: 'bg-background-elevated/50',
        description: 'color-text-toned',
      },
      subtle: {
        root: 'bg-background-elevated/50 ring-ring ring',
        description: 'color-text-toned',
      },
      naked: {
        description: 'color-text-muted',
      },
    },
    loading: {
      true: {
        avatar: '[&>[data-slot=icon]]:animate-spin',
      },
    },
  },
} satisfies PThemeEmpty;
