import { posix } from 'node:path';

/**
 * Convert a file path to POSIX style separators.
 * @param {string} pathname - Original file path.
 */
function toPosixPath(pathname: string) {
  return pathname.split(`\\`).join(posix.sep);
}

export { toPosixPath };
