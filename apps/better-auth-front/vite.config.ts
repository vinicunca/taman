import type { PohonUiOptions } from 'pohon-ui/vite';
import type { PluginOption } from 'vite';
import { ui } from '@taman-core/pohon-ui-theme';
import { defineConfig } from '@vinicunca/vite-config';
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
      neutral: 'gray',
    },
    ...ui,
  },
  theme: {
    unstyled: true,
  },
  scanPackages: [
    '@taman-core/popup-ui',
    '@taman/app-ui',
  ],
};

export default defineConfig(async () => {
  return {
    application: {
      licenseOptions: {
        author: 'praburangki',
        contact: 'praburangki@gmail.com',
        copyright: 'Copyright (C) 2024 Vinicunca',
        license: 'MIT License',
        name: 'Taman Admin',
      },
      printInfoMap: {
        'Taman Admin Docs': 'https://taman.vinicunca.dev',
      },
      pwaOptions: {
        manifest: {
          description: 'Taman Admin is a modern admin dashboard template based on Vue 3. ',
          icons: [
            {
              sizes: '192x192',
              src: 'https://raw.githubusercontent.com/vinicunca/static-resources/refs/heads/main/taman-192x192.png',
              type: 'image/png',
            },
            {
              sizes: '512x512',
              src: 'https://raw.githubusercontent.com/vinicunca/static-resources/refs/heads/main/taman-512x512.png',
              type: 'image/png',
            },
          ],
        },
      },
    },
    vite: {
      plugins: [
        vitePohon(pohonOptions),
        vitePohonThemePlugin(pohonOptions?.ui),
      ],
      resolve: {
        dedupe: ['pohon-ui'],
      },
      server: {
        warmup: {
          clientFiles: [
            './src/bootstrap.ts',
            './src/{views,layouts,router,store,api,adapter}/*',
          ],
        },
      },
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
