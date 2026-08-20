// @unocss-include

import type { PThemeModal } from 'pohon-ui';

export const modal = {
  slots: {
    overlay: 'fixed inset-0',
    content: 'bg-background divide-y divide-divide flex flex-col focus:outline-none',
    header: 'flex items-center gap-1.5 p-4 sm:px-6 min-h-$ui-header-height',
    wrapper: '',
    body: 'flex-1 p-4 sm:p-6',
    footer: 'flex items-center gap-1.5 p-4 sm:px-6',
    title: 'color-text-highlighted font-semibold',
    description: 'mt-1 color-text-muted text-sm',
    close: 'absolute top-4 end-4',
  },
  variants: {
    transition: {
      true: {
        overlay: 'data-[state=closed]:(animate-out fade-out-0) data-[state=open]:(animate-in fade-in-0) pohon:animate-duration-280',
        content: 'data-[state=closed]:(animate-out fade-out-0 zoom-out-95) data-[state=open]:(animate-in fade-in-0 zoom-in-95) pohon:animate-duration-280',
      },
    },
    fullscreen: {
      true: {
        content: 'inset-0',
      },
      false: {
        content: 'w-[calc(100vw-2rem)] max-w-lg rounded-lg shadow-lg ring ring-ring',
      },
    },
    overlay: {
      true: {
        overlay: 'bg-background-elevated/75',
      },
    },
    scrollable: {
      true: {
        overlay: 'overflow-y-auto',
        content: 'relative',
      },
      false: {
        content: 'fixed',
        body: 'overflow-y-auto',
      },
    },
  },
  compoundVariants: [
    {
      scrollable: true,
      fullscreen: false,
      class: {
        overlay: 'grid place-items-center p-4 sm:py-8',
      },
    },
    {
      scrollable: false,
      fullscreen: false,
      class: {
        content: 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 max-h-[calc(100dvh-2rem)] sm:max-h-[calc(100dvh-4rem)] overflow-hidden',
      },
    },
  ],
} satisfies PThemeModal;
