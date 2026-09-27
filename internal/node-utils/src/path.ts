import { posix } from 'node:path';

/**
 * Convert a file path to POSIX style separators.
 * @param pathname - Original file path.
 */
function toPosixPath(pathname: string): string {
  return pathname.split('\\').join(posix.sep);
}

export { toPosixPath };
