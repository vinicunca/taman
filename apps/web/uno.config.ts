import type { UserConfig } from 'unocss';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { TAMAN_UI_CONTENT } from '@vinicunca/taman-ui/unocss';
import { defineConfig } from 'unocss';
import { presetCore } from '@taman/designs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @keep-sorted */
/** @keep-sorted */
const config: UserConfig = defineConfig({
  configDeps: getAllConfigFiles('../../packages/shell/designs/src'),

  content: {
    // Vite pre-bundles taman-ui, so its compiled modules never reach the transform pipeline. Read them from disk instead.
    filesystem: [
      path.join(__dirname, 'node_modules/@vinicunca/taman-ui/dist/**/*.mjs'),
    ],

    pipeline: {
      include: [
        // the default
        /\.(vue|svelte|[jt]sx|vine.ts|mdx?|astro|elm|php|phtml|marko|html)($|\?)/,
        // Pohon UI theme modules
        /virtual:pohon-ui-templates\//,
        TAMAN_UI_CONTENT,
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

export default config;

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
