// @unocss-include

import type { PThemePageCta } from 'pohon-ui';

export const pageCta = {
  slots: {
    root: 'relative isolate rounded-xl overflow-hidden',
    container: 'flex flex-col lg:grid px-6 py-12 sm:px-12 sm:py-24 lg:px-16 lg:py-24 gap-8 sm:gap-16',
    wrapper: '',
    header: '',
    title: 'text-3xl sm:text-4xl text-pretty tracking-tight font-bold color-text-highlighted',
    description: 'text-base sm:text-lg color-text-muted',
    body: 'mt-8',
    footer: 'mt-8',
    links: 'flex flex-wrap gap-x-6 gap-y-3',
  },
  variants: {
    orientation: {
      horizontal: {
        container: 'lg:grid-cols-2 lg:items-center',
        description: 'text-pretty',
      },
      vertical: {
        container: '',
        title: 'text-center',
        description: 'text-center text-balance',
        links: 'justify-center',
      },
    },
    reverse: {
      true: {
        wrapper: 'order-last',
      },
    },
    variant: {
      solid: {
        root: 'bg-background-inverted color-text-inverted',
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
    title: {
      true: {
        description: 'mt-6',
      },
    },
  },
} satisfies PThemePageCta;
