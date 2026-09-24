import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { presetCore } from '@taman/designs';
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
