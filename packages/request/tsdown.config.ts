import { defineConfig } from 'tsdown';

export default defineConfig({
  clean: true,
  deps: {
    skipNodeModulesBundle: true,
  },
  dts: true,
  entry: ['src/orpc.ts', 'src/orpc-query.ts'],
  format: ['esm'],
});
