import type { FileMap } from './types';
import { globToRegExp } from './glob';

/** Returns a copy of `files` without the paths any glob matches. */
export function removeFiles(files: FileMap, globs: Array<string>): FileMap {
  const patterns = globs.map(globToRegExp);
  return new Map([...files].filter(([path]) => !patterns.some((pattern) => pattern.test(path))));
}

/** Globs that match no path: a sign the manifest no longer matches the code. */
export function unmatchedGlobs(files: FileMap, globs: Array<string>): Array<string> {
  const paths = [...files.keys()];
  return globs.filter((glob) => {
    const pattern = globToRegExp(glob);
    return !paths.some((path) => pattern.test(path));
  });
}
