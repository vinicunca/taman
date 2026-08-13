import type { Preflight } from 'unocss';
import { readFileSync } from 'node:fs';

function getCssFile(path: string) {
  return readFileSync(new URL(path, import.meta.url), 'utf-8');
}

const STYLE_FILES = [
  './styles/global.css',
  './styles/default.css',
  './styles/dark.css',
  './styles/menu.css',
];

export const preflights: Array<Preflight> = [
  {
    getCSS: () => STYLE_FILES.map(getCssFile).join('\n'),
  },
];
