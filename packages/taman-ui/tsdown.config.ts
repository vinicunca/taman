import { defineConfig } from 'tsdown';
import Vue from 'unplugin-vue/rolldown';

export default defineConfig({
  clean: true,
  deps: {
    neverBundle: true,
  },
  dts: {
    vue: true,
  },
  entry: [
    'src/index.ts',
    'src/form/index.ts',
    'src/layout/index.ts',
    'src/menu/index.ts',
    'src/popup/index.ts',
    'src/tabs/index.ts',
    'src/unocss/index.ts',
  ],
  format: ['esm'],
  outExtensions: () => ({
    dts: '.d.ts',
    js: '.mjs',
  }),
  platform: 'neutral',
  plugins: [Vue({ isProduction: true })],
  unbundle: true,
});
