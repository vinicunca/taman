import type { Options as PwaPluginOptions } from 'vite-plugin-pwa';

import type { ImportmapPluginOptions } from './typing';

const isDevelopment = process.env.NODE_ENV === 'development';

function getDefaultPwaOptions(name: string): Partial<PwaPluginOptions> {
  return {
    manifest: {
      name: `${name}${isDevelopment ? ' dev' : ''}`,
      short_name: `${name}${isDevelopment ? ' dev' : ''}`,
    },
  };
}

/**
 * Importmap CDN is off by default: some packages lack support and CDNs can be unstable
 */
const defaultImportmapOptions: ImportmapPluginOptions = {
  // Load deps via Importmap CDN
  // esm.sh has better compatibility; jspm.io expects stricter ESM entry points
  defaultProvider: 'esm.sh',
  importmap: [
    { name: 'vue' },
    { name: 'pinia' },
    { name: 'vue-router' },
    { name: 'vue-demi' },
  ],
};

export { defaultImportmapOptions, getDefaultPwaOptions };
