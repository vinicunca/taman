import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { BRANDS, presetCore } from '@taman/designs';
import { defineConfig } from 'unocss';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// @keep-sorted
export default defineConfig({
  configDeps: getAllConfigFiles('../../packages/designs/src'),

  content: {
    pipeline: {
      include: [
        // the default
        /\.(vue|svelte|[jt]sx|vine.ts|mdx?|astro|elm|php|phtml|marko|html)($|\?)/,
        /virtual:pohon-theme/,
      ],
    },
  },

  outputToCssLayers: {
    allLayers: true,
  },

  presets: [
    presetCore(),
  ],

  safelist: [
    /**
     * In select.ts theme, we have a function that replace the `focus-visible` from input theme.
     * Therefore uno doesn't know about these dynamic classes, so we need to add them to the safelist.
     */
    () => ['focus:ring-2', 'focus:ring-inset'],
    ...BRANDS.map((brand) => `focus:ring-${brand}`),
  ],
});

function getAllConfigFiles(dir: string) {
  const dirFull = path.join(__dirname, dir);
  const extensions = new Set(['.css', '.ts']);
  const files: Array<string> = [];

  function walk(currentDir: string, relativeDir: string) {
    for (const entry of fs.readdirSync(currentDir, { withFileTypes: true })) {
      const relativePath = path.join(relativeDir, entry.name);

      if (entry.isDirectory()) {
        walk(path.join(currentDir, entry.name), relativePath);
      } else if (extensions.has(path.extname(entry.name))) {
        files.push(relativePath);
      }
    }
  }

  walk(dirFull, dir);

  return files;
}
