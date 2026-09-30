import type { FileMap } from './types';
import { chmodSync, existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, sep } from 'node:path';

const decoder = new TextDecoder('utf-8', { fatal: true });

/** Valid UTF-8 without NUL bytes is text; anything else stays as bytes. */
export function decodeFile(bytes: Uint8Array): string | Uint8Array {
  if (bytes.includes(0)) {
    return bytes;
  }
  try {
    return decoder.decode(bytes);
  } catch {
    return bytes;
  }
}

/** Reads every file under `root` (except `.git`) keyed by posix-relative path. */
export function readFileMap(root: string): FileMap {
  const files: FileMap = new Map();

  const walk = (dir: string) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name !== '.git') {
          walk(full);
        }
      } else if (entry.isFile()) {
        files.set(relative(root, full).split(sep).join('/'), decodeFile(readFileSync(full)));
      }
    }
  };

  walk(root);
  return files;
}

/**
 * Writes the map under `root`. When `modeSource` is given, each file copies
 * the permission bits of the same path there, so executable scripts stay
 * executable.
 */
export function writeFileMap(root: string, files: FileMap, modeSource?: string): void {
  for (const [path, contents] of files) {
    const target = join(root, path);
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, contents);

    const source = modeSource ? join(modeSource, path) : undefined;
    if (source && existsSync(source)) {
      chmodSync(target, statSync(source).mode & 0o777);
    }
  }
}
