// @unocss-include
import type { PThemeDrawer } from 'pohon-ui';

export const themeDrawer = {
  slots: {
    overlay: 'bg-background-elevated/75 inset-0 fixed',
    content: 'bg-background ring-ring flex ring fixed focus:outline-none',
    // TODO: remove the important when vaul is replaced by the built in drawer
    handle: '!bg-background-accented shrink-0 transition-opacity ease-out',
    container: 'p-4 flex flex-col gap-4 w-full overflow-y-auto',
    header: 'flex gap-1.5 min-h-8 items-center',
    wrapper: 'flex-1 min-w-0',
    title: 'color-text-highlighted font-600',
    description: 'color-text-muted text-sm mt-1',
    actions: 'ms-auto flex shrink-0 gap-1.5 items-center',
    body: 'flex-1',
    footer: 'flex flex-col gap-1.5',
    close: '',
  },
  variants: {
    direction: {
      top: {
        content: 'mb-24 flex-col-reverse',
        handle: 'mb-4',
      },
      right: {
        content: 'flex-row rtl:flex-row-reverse',
        // TODO: remove the important when vaul is replaced by the built in drawer
        handle: '!ml-4',
      },
      bottom: {
        content: 'mt-24 flex-col',
        handle: 'mt-4',
      },
      left: {
        content: 'flex-row-reverse rtl:flex-row',
        // TODO: remove the important when vaul is replaced by the built in drawer
        handle: '!mr-4',
      },
    },
    inset: {
      true: {
        content: 'rounded-lg [--initial-transform:calc(100%+1.5rem)] overflow-hidden after:hidden',
      },
    },
    snapPoints: {
      true: '',
    },
  },
  compoundVariants: [
    {
      direction: ['top', 'bottom'],
      class: {
        content: 'h-auto max-h-[96%]',
        // TODO: remove the important when vaul is replaced by the built in drawer
        handle: 'mx-auto !h-1.5 !w-12',
      },
    },
    {
      direction: ['top', 'bottom'],
      snapPoints: true,
      class: {
        content: 'h-full',
      },
    },
    {
      direction: ['right', 'left'],
      class: {
        content: 'w-auto max-w-[calc(100%-2rem)]',
        // TODO: remove the important when vaul is replaced by the built in drawer
        handle: '!h-12 !w-1.5 my-auto',
      },
    },
    {
      direction: ['right', 'left'],
      snapPoints: true,
      class: {
        content: 'w-full',
      },
    },
    {
      direction: 'top',
      inset: true,
      class: {
        content: 'inset-x-4 top-4',
      },
    },
    {
      direction: 'top',
      inset: false,
      class: {
        content: 'inset-x-0 top-0 rounded-b-lg',
      },
    },
    {
      direction: 'bottom',
      inset: true,
      class: {
        content: 'inset-x-4 bottom-4',
      },
    },
    {
      direction: 'bottom',
      inset: false,
      class: {
        content: 'inset-x-0 bottom-0 rounded-t-lg',
      },
    },
    {
      direction: 'left',
      inset: true,
      class: {
        content: 'inset-y-4 left-4',
      },
    },
    {
      direction: 'left',
      inset: false,
      class: {
        content: 'inset-y-0 left-0 rounded-r-lg',
      },
    },
    {
      direction: 'right',
      inset: true,
      class: {
        content: 'inset-y-4 right-4',
      },
    },
    {
      direction: 'right',
      inset: false,
      class: {
        content: 'inset-y-0 right-0 rounded-l-lg',
      },
    },
  ],
} satisfies PThemeDrawer;
