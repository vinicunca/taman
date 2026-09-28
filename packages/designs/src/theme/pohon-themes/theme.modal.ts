// @unocss-include

import type { PThemeModal } from 'pohon-ui';

export const themeModal = {
  slots: {
    overlay: 'inset-0 fixed',
    content: 'bg-background flex flex-col divide-divide divide-y focus:outline-none',
    header: 'p-4 flex gap-1.5 min-h-$ui-header-height items-center sm:px-6',
    wrapper: '',
    body: 'p-4 flex-1 sm:p-6',
    footer: 'p-4 flex gap-1.5 items-center sm:px-6',
    title: 'color-text-highlighted font-600',
    description: 'text-sm color-text-muted mt-1',
    close: 'end-4 top-4 absolute',
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
        content: 'rounded-lg max-w-lg w-[calc(100vw-2rem)] ring ring-ring shadow-lg',
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
