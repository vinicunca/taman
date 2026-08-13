// @unocss-include

import type { PThemeChatPrompt } from 'pohon-ui';

export const chatPrompt = {
  slots: {
    root: 'relative flex flex-col items-stretch gap-2 px-2.5 py-2 w-full rounded-lg backdrop-blur',
    header: 'flex items-center gap-1.5',
    body: 'items-start',
    footer: 'flex items-center justify-between gap-1.5',
    base: '',
  },
  variants: {
    variant: {
      outline: {
        root: 'bg-background/75 ring ring-ring',
      },
      soft: {
        root: 'bg-background-elevated/50',
      },
      subtle: {
        root: 'bg-background-elevated/50 ring ring-ring',
      },
      naked: {
        root: '',
      },
    },
  },
} satisfies PThemeChatPrompt;
