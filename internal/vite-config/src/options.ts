import type { Options as PwaPluginOptions } from 'vite-plugin-pwa';

import type { ImportmapPluginOptions } from './typing';

const isDevelopment = process.env.NODE_ENV === 'development';

function getDefaultPwaOptions(name: string): Partial<PwaPluginOptions> {
  return {
    manifest: {
      description:
      'Taman Admin is a modern admin dashboard template based on Vue 3. ',
      icons: [
        {
          sizes: '192x192',
          src: 'https://unpkg.com/@vbenjs/static-source@0.1.7/source/pwa-icon-192.png',
          type: 'image/png',
        },
        {
          sizes: '512x512',
          src: 'https://unpkg.com/@vbenjs/static-source@0.1.7/source/pwa-icon-512.png',
          type: 'image/png',
        },
      ],
      name: `${name}${isDevelopment ? ' dev' : ''}`,
      short_name: `${name}${isDevelopment ? ' dev' : ''}`,
    },
  };
}

/**
 * importmap CDN is not enabled temporarily because some packages do not support it, and the network is unstable
 */
const defaultImportmapOptions: ImportmapPluginOptions = {
  // Importmap CDN is used to introduce packages,
  // Currently, only the esm.sh source is compatible, and jspm.io requires a high entry for esm
  defaultProvider: 'esm.sh',
  importmap: [
    { name: 'vue' },
    { name: 'pinia' },
    { name: 'vue-router' },
    { name: 'vue-demi' },
  ],
};

export { defaultImportmapOptions, getDefaultPwaOptions };
