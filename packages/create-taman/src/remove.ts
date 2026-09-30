import type { FileMap } from './types';
import { globToRegExp } from './glob';

/** Returns a copy of `files` without the paths any glob matches. */
export function removeFiles(files: FileMap, globs: Array<string>): FileMap {
  const patterns = globs.map(globToRegExp);
  return new Map([...files].filter(([path]) => !patterns.some((pattern) => pattern.test(path))));
}
