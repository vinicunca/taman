// @unocss-include
export const tooltip = {
  slots: {
    content: 'z-popup flex items-center gap-1 bg-background color-text-highlighted shadow-sm rounded-sm ring ring-border h-6 px-2.5 py-1 text-xs select-none data-[state=closed]:(animate-out fade-out-0 zoom-out-95) data-[state=delayed-open]:(animate-in fade-in-0 zoom-in-95) data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 max-w-[400px] origin-$akar-tooltip-content-transform-origin pointer-events-auto',
    arrow: 'fill-background stroke-border',
    text: 'truncate',
    kbds: 'shrink-0 gap-0.5 hidden items-center lg:inline-flex not-first-of-type:before:(me-0.5 content-["·"])',
    kbdsSize: 'sm',
  },
};
