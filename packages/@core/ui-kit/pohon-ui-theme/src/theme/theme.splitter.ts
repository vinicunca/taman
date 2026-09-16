// @unocss-include
import type { PThemeSplitter } from 'pohon-ui';

export const themeSplitter = {
  slots: {
    root: '',
    panel: 'flex',
    handle: 'group shrink-0 relative focus-visible:outline-2 focus-visible:outline-primary data-[panel-resize-handle-enabled=false]:cursor-default',
  },
  variants: {
    orientation: {
      horizontal: {
        handle: 'w-2 cursor-col-resize',
      },
      vertical: {
        handle: 'h-2 cursor-row-resize',
      },
    },
  },
} satisfies PThemeSplitter;
