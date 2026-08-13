// @unocss-include
import type { PThemeEditorMentionMenu } from 'pohon-ui';
import { editorSuggestionMenu } from './editor-suggestion-menu.ts';

export const editorMentionMenu = {
  ...editorSuggestionMenu,
} satisfies PThemeEditorMentionMenu;
