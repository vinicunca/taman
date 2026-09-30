import type { FileMap } from './types';

export function readJson<T>(files: FileMap, path: string): T {
  const text = files.get(path);
  if (typeof text !== 'string') {
    throw new TypeError(`${path} is missing or not a text file`);
  }
  return JSON.parse(text) as T;
}

/** Writes with the repo's formatting: two-space indent and a trailing newline. */
export function writeJson(files: FileMap, path: string, value: unknown): void {
  files.set(path, `${JSON.stringify(value, null, 2)}\n`);
}
