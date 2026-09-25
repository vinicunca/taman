import { defineConfig } from 'tsdown';

export default defineConfig({
  clean: true,
  deps: {
    skipNodeModulesBundle: true,
  },
  dts: true,
  entry: {
    'orpc': 'src/orpc.ts',
    'orpc-query': 'src/orpc-query.ts',
    'http': 'src/http/index.ts',
    'http-query': 'src/http-query.ts',
  },
  format: ['esm'],
});
