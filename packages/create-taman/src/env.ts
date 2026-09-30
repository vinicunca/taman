import type { FileMap } from './types';

const ENV_EXAMPLE = /(?:^|\/)\.env(?:\.[\w-]+)?\.example$/;

/** Adds `.env*` files from their `.example` copies, never overwriting. */
export function addEnvFiles(files: FileMap): FileMap {
  const result: FileMap = new Map(files);
  for (const [path, contents] of files) {
    if (ENV_EXAMPLE.test(path)) {
      const target = path.slice(0, -'.example'.length);
      if (!result.has(target)) {
        result.set(target, contents);
      }
    }
  }
  return result;
}
