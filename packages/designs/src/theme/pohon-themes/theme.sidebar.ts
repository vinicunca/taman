// @unocss-include
export const themeSidebar = {
  slots: {
    root: 'peer [--sidebar-width-icon:4rem] [--sidebar-width:16rem]',
    gap: 'bg-transparent w-$sidebar-width relative',
    container: 'w-$sidebar-width hidden inset-y-0 fixed z-10 h-svh lg:flex',
    inner: 'flex flex-col size-full overflow-hidden divide-divide divide-y',
    header: 'px-4 flex gap-1.5 min-h-$ui-header-height items-center overflow-hidden',
    wrapper: 'flex-1 min-w-0',
    title: 'color-text-highlighted font-600 truncate',
    description: 'text-sm color-text-muted truncate',
    actions: 'flex shrink-0 gap-1.5 items-center',
    close: '',
    body: 'p-4 flex flex-1 flex-col gap-4 min-h-0 overflow-y-auto',
    footer: 'p-4 flex gap-1.5 items-center overflow-hidden',
    rail: 'w-4 hidden inset-y-0 absolute z-20 lg:flex after:(w-px content-empty transition-colors inset-y-0 left-1/2 absolute) hover:after:bg-$ui-border-accented',
  },
  variants: {
    transition: {
      true: {
        gap: 'transition-[width]-280 ease-out motion-reduce:transition-none',
        container: 'duration-280 ease-out [transition-property:inset-inline-start,inset-inline-end,width] motion-reduce:transition-none',
      },
    },
    side: {
      left: {
        container: 'border-e border-border start-0',
        rail: 'translate-x-1/2 end-0 rtl:-translate-x-1/2',
      },
      right: {
        container: 'border-s border-border end-0',
        rail: '-translate-x-1/2 rtl:translate-x-1/2 -start-px',
      },
    },
    collapsible: {
      offcanvas: {
        root: 'group/sidebar hidden lg:block',
        gap: 'data-[state=collapsed]:w-0',
      },
      icon: {
        root: 'group/sidebar hidden lg:block',
        gap: 'data-[state=collapsed]:w-$sidebar-width-icon',
        container: 'data-[state=collapsed]:w-$sidebar-width-icon',
        actions: 'group-data-[state=collapsed]/sidebar:hidden',
        body: 'group-data-[state=collapsed]/sidebar:overflow-hidden',
      },
      none: {
        root: 'h-full w-$sidebar-width',
      },
    },
    variant: {
      sidebar: {},
      floating: {
        container: 'p-4 border-transparent',
        inner: 'rounded-lg ring ring-ring shadow-lg',
        rail: 'inset-y-4',
      },
      inset: {
        container: 'py-4 border-transparent',
        inner: 'divide-transparent',
        rail: 'inset-y-4',
      },
    },
  },
  compoundVariants: [
    {
      side: 'left',
      collapsible: ['offcanvas', 'icon'],
      class: {
        rail: 'cursor-w-resize rtl:cursor-e-resize data-[state=collapsed]:cursor-e-resize data-[state=collapsed]:rtl:cursor-w-resize',
      },
    },
    {
      side: 'right',
      collapsible: ['offcanvas', 'icon'],
      class: {
        rail: 'cursor-e-resize rtl:cursor-w-resize data-[state=collapsed]:cursor-w-resize data-[state=collapsed]:rtl:cursor-e-resize',
      },
    },
    {
      side: 'left',
      collapsible: 'none',
      class: {
        root: 'border-e border-border',
      },
    },
    {
      side: 'right',
      collapsible: 'none',
      class: {
        root: 'border-s border-border',
      },
    },
    {
      side: 'left',
      collapsible: 'offcanvas',
      class: {
        container: 'data-[state=collapsed]:-start-$sidebar-width',
      },
    },
    {
      side: 'right',
      collapsible: 'offcanvas',
      class: {
        container: 'data-[state=collapsed]:-end-$sidebar-width',
      },
    },
    {
      variant: 'floating',
      collapsible: 'icon',
      class: {
        gap: 'data-[state=collapsed]:w-[calc(var(--sidebar-width-icon)+--spacing(8))]',
        container: 'data-[state=collapsed]:w-[calc(var(--sidebar-width-icon)+--spacing(8)+2px)]',
      },
    },
    {
      variant: 'floating',
      collapsible: 'none',
      class: {
        root: 'p-4 border-0',
      },
    },
    {
      variant: 'inset',
      collapsible: 'none',
      class: {
        root: 'py-4 border-0',
      },
    },
    {
      variant: 'floating',
      side: 'left',
      class: {
        rail: 'end-4',
      },
    },
    {
      variant: 'floating',
      side: 'right',
      class: {
        rail: 'start-[calc(--spacing(4)-1px)]',
      },
    },
  ],
};
