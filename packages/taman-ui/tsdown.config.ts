import { expandVariantGroup } from '@unocss/core';
import { defineConfig } from 'tsdown';
import Vue from 'unplugin-vue/rolldown';

// The class attribute ships as-is, and consumers never run transformerVariantGroup on dist, so expand `variant:(a b)` into plain classes before compiling the SFCs.
const variantGroup = {
  name: 'taman:variant-group',
  transform: {
    filter: { id: /\.vue$/ },
    handler(code: string) {
      const expanded = expandVariantGroup(code);

      return expanded === code ? null : expanded;
    },
  },
};

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
  plugins: [
    variantGroup,
    Vue({ isProduction: true }),
  ],
  unbundle: true,
});
