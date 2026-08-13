import type { PohonUiOptions } from 'pohon-ui/vite';
import type { PluginOption } from 'vite';
import { ui } from '@taman-core/pohon-ui-theme';
import { defineConfig } from '@taman/vite-config';
import vitePohon from 'pohon-ui/vite';

const pohonOptions: PohonUiOptions = {
  colorMode: false,
  ui: {
    colors: {
      primary: 'blue',
      secondary: 'purple',
      success: 'green',
      info: 'sky',
      warning: 'yellow',
      error: 'red',
    },
    ...ui,
  },
  theme: {
    unstyled: true,
  },
  scanPackages: [
    '@taman-core/popup-ui',
    '@taman/common-ui',
  ],
};

export default defineConfig(async () => {
  return {
    vite: {
      plugins: [
        vitePohon(pohonOptions),
        vitePohonThemePlugin(pohonOptions?.ui),
      ],
    },
  };
});

function vitePohonThemePlugin(
  ui: PohonUiOptions['ui'] = {},
): PluginOption {
  return {
    name: 'virtual-pohon-theme',
    resolveId(id) {
      if (id === 'virtual:pohon-theme') {
        return '\0virtual:pohon-theme';
      }
    },
    load(id) {
      if (id === '\0virtual:pohon-theme') {
        return `
          // @unocss-include
          export const ui = ${JSON.stringify(ui)}
        `;
      }
    },
  };
}
