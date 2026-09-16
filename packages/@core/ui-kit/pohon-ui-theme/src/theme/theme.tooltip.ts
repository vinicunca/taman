// @unocss-include
import type { PThemeTooltip } from 'pohon-ui';

export const themeTooltip = {
  slots: {
    content: 'text-xs color-text-highlighted px-2.5 py-1 rounded-sm bg-background flex gap-1 h-6 max-w-[400px] pointer-events-auto select-none ring ring-ring shadow-sm origin-$akar-tooltip-content-transform-origin items-center data-[state=closed]:(animate-out fade-out-0 zoom-out-95) data-[state=delayed-open]:(animate-in fade-in-0 zoom-in-95) data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
    arrow: 'fill-background stroke-border',
    text: 'truncate',
    kbds: 'shrink-0 gap-0.5 hidden items-center lg:inline-flex not-first-of-type:before:(me-0.5 content-["·"])',
    kbdsSize: 'sm',
  },
} satisfies PThemeTooltip;
