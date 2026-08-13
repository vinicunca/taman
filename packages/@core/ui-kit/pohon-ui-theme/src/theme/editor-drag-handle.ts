// @unocss-include

import type { PThemeEditorDragHandle } from 'pohon-ui';

export const editorDragHandle = {
  slots: {
    root: 'hidden sm:flex items-center justify-center transition-all duration-200 ease-out',
    handle: 'cursor-grab px-1',
  },
} satisfies PThemeEditorDragHandle;
