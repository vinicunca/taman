import type { FileMap } from './types';
import { readJson, writeJson } from './json';

/** Deletes root package.json scripts that only make sense in the taman repo. */
export function removeRootScripts(files: FileMap, scripts: Array<string>) {
  const result: FileMap = new Map(files);
  const warnings: Array<string> = [];
  const json = readJson<{ scripts?: Record<string, string> }>(result, 'package.json');

  for (const name of scripts) {
    if (!json.scripts || !(name in json.scripts)) {
      warnings.push(`scripts: root package.json has no "${name}" script`);
    }
  }
  if (json.scripts) {
    json.scripts = Object.fromEntries(Object.entries(json.scripts).filter(([name]) => !scripts.includes(name)));
  }

  writeJson(result, 'package.json', json);
  return { files: result, warnings };
}
