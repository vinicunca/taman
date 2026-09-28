import { defineConfig } from 'tsdown';

export default defineConfig({
  clean: true,
  deps: {
    neverBundle: true,
  },
  dts: true,
  entry: {
    'cache/index': 'src/cache/index.ts',
    'color/index': 'src/color/index.ts',
    'composables/index': 'src/composables/index.ts',
    'constants/index': 'src/constants/index.ts',
    'global-state': 'src/global-state.ts',
    'preferences/index': 'src/preferences/index.ts',
    'store': 'src/store.ts',
    'typings/index': 'src/typings/index.ts',
    'utils/index': 'src/utils/index.ts',
  },
  format: ['esm'],
  outExtensions: () => ({
    dts: '.d.ts',
  }),
});
