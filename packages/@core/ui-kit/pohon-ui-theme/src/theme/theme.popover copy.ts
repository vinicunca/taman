// @unocss-include
import type { PThemePopover } from 'pohon-ui';

export const themePopover = {
  slots: {
    content: 'rounded-md bg-background pointer-events-auto ring ring-ring shadow-lg origin-$akar-popover-content-transform-origin focus:outline-none data-[state=closed]:(animate-out fade-out-0 zoom-out-95) data-[state=open]:(animate-in fade-in-0 zoom-in-95) data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
    arrow: 'fill-fill-bg stroke-stroke',
  },
} satisfies PThemePopover;
