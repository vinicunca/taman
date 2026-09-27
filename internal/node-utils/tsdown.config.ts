import { defineConfig } from 'tsdown';

export default defineConfig({
  // Safe only because tsdown runs before tsc in scripts/build.mjs — tsc then
  // writes the .d.ts files into the freshly cleaned dist/.
  clean: true,
  deps: {
    // Externalize every npm dependency and keep them as plain imports in dist/.
    // This is a Node-only library: everything it imports (execa, consola, chalk,
    // @manypkg/get-packages, ...) is declared in `dependencies`, so consumers
    // install it anyway. Inlining would duplicate those copies in every
    // consumer and risks breaking CJS packages or ones that locate files at
    // runtime. Local src/ files are still bundled.
    //
    // `neverBundle: true` replaces `skipNodeModulesBundle: true`, deprecated
    // in tsdown 0.22.
    neverBundle: true,
  },
  entry: ['src/index.ts'],
  format: ['esm'],
});
