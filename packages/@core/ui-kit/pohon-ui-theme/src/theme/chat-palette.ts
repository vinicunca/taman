// @unocss-include

import type { PThemeChatPalette } from 'pohon-ui';

export const chatPalette = {
  slots: {
    root: 'relative flex-1 flex flex-col min-h-0 min-w-0',
    prompt: 'px-0 rounded-t-none border-t border-border',
    close: '',
    content: 'overflow-y-auto flex-1 flex flex-col py-3',
  },
} satisfies PThemeChatPalette;
