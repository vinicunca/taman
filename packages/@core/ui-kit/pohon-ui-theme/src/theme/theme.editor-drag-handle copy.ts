// @unocss-include
import type { PThemeEditorDragHandle } from 'pohon-ui';

export const themeEditorDragHandle = {
  slots: {
    root: 'hidden sm:flex items-center justify-center transition-[top,left]-200 ease-out motion-reduce:transition-none',
    handle: 'cursor-grab px-1',
  },
} satisfies PThemeEditorDragHandle;
