// @unocss-include
import type { PThemeEditorEmojiMenu } from 'pohon-ui';
import { editorSuggestionMenu } from './editor-suggestion-menu.ts';

export const editorEmojiMenu = {
  ...editorSuggestionMenu,
} satisfies PThemeEditorEmojiMenu;
