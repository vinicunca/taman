// @unocss-include
import type { PThemeSlideover } from 'pohon-ui';

export const themeSlideover = {
  slots: {
    overlay: 'bg-background-elevated/75 inset-0 fixed',
    content: 'bg-background flex flex-col ring-ring fixed divide-divide divide-y focus:outline-none sm:(ring shadow-lg)',
    header: 'p-4 flex gap-1.5 min-h-$ui-header-height items-center sm:px-6',
    wrapper: '',
    body: 'p-4 flex-1 overflow-y-auto sm:p-6',
    footer: 'p-4 flex gap-1.5 items-center sm:px-6',
    title: 'color-text-highlighted font-600',
    description: 'text-sm color-text-muted mt-1',
    close: 'end-4 top-4 absolute',
  },
  variants: {
    side: {
      top: {
        content: '',
      },
      right: {
        content: 'max-w-md',
      },
      bottom: {
        content: '',
      },
      left: {
        content: 'max-w-md',
      },
    },
    inset: {
      true: {
        content: 'rounded-lg',
      },
    },
    transition: {
      true: {
        overlay: 'data-[state=closed]:(animate-out fade-out-0) data-[state=open]:(animate-in fade-in-0)',
      },
    },
  },
  compoundVariants: [
    {
      side: 'top',
      inset: true,
      class: {
        content: 'max-h-[calc(100%-2rem)] inset-x-4 top-4',
      },
    },
    {
      side: 'top',
      inset: false,
      class: {
        content: 'max-h-full inset-x-0 top-0',
      },
    },
    {
      side: 'right',
      inset: true,
      class: {
        content: 'w-[calc(100%-2rem)] inset-y-4 right-4',
      },
    },
    {
      side: 'right',
      inset: false,
      class: {
        content: 'w-full inset-y-0 right-0',
      },
    },
    {
      side: 'bottom',
      inset: true,
      class: {
        content: 'max-h-[calc(100%-2rem)] inset-x-4 bottom-4',
      },
    },
    {
      side: 'bottom',
      inset: false,
      class: {
        content: 'max-h-full inset-x-0 bottom-0',
      },
    },
    {
      side: 'left',
      inset: true,
      class: {
        content: 'w-[calc(100%-2rem)] inset-y-4 left-4',
      },
    },
    {
      side: 'left',
      inset: false,
      class: {
        content: 'w-full inset-y-0 left-0',
      },
    },
    {
      transition: true,
      side: 'top',
      class: {
        content: 'data-[state=open]:(animate-in slide-in-from-top) data-[state=closed]:(animate-out slide-out-to-top)',
      },
    },
    {
      transition: true,
      side: 'right',
      class: {
        content: 'data-[state=open]:(animate-in slide-in-from-right) data-[state=closed]:(animate-out slide-out-to-right)',
      },
    },
    {
      transition: true,
      side: 'bottom',
      class: {
        content: 'data-[state=open]:(animate-in slide-in-from-bottom) data-[state=closed]:(animate-out slide-out-to-bottom)',
      },
    },
    {
      transition: true,
      side: 'left',
      class: {
        content: 'data-[state=open]:(animate-in slide-in-left) data-[state=closed]:(animate-out slide-out-left)',
      },
    },
  ],
} satisfies PThemeSlideover;
