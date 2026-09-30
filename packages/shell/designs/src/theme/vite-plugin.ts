import type { PohonUiOptions } from 'pohon-ui/vite';
import type { Plugin } from 'vite';

const VIRTUAL_ID = 'virtual:pohon-theme';
const RESOLVED_ID = `\0${VIRTUAL_ID}`;

/**
 * Exposes the pohon theme config as `virtual:pohon-theme` so UnoCSS can
 * extract the theme's classes. Import `virtual:pohon-theme` once in the app
 * entry and add `/virtual:pohon-theme/` to UnoCSS `content.pipeline.include`.
 * @param ui The same `ui` config passed to the pohon-ui Vite plugin.
 */
export function vitePohonTheme(ui: PohonUiOptions['ui'] = {}): Plugin {
  return {
    name: 'virtual-pohon-theme',
    resolveId(id) {
      if (id === VIRTUAL_ID) {
        return RESOLVED_ID;
      }
    },
    load(id) {
      if (id === RESOLVED_ID) {
        return `
          // @unocss-include
          export const ui = ${JSON.stringify(ui)}
        `;
      }
    },
  };
}
