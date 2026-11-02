import type { Result } from 'publint';
import { createHash } from 'node:crypto';
import { glob, readFile, stat } from 'node:fs/promises';
import { resolve } from 'node:path';

function collectRelativePaths(value: unknown, paths = new Set<string>()) {
  if (typeof value === 'string' && value.startsWith('./')) {
    paths.add(value);
  } else if (Array.isArray(value)) {
    value.forEach((item) => {
      collectRelativePaths(item, paths);
    });
  } else if (value && typeof value === 'object') {
    Object.values(value).forEach((item) => {
      collectRelativePaths(item, paths);
    });
  }
  return paths;
}

export async function getPackageHash(pkgJson: Record<string, unknown>, pkgDir: string) {
  const expandedPaths = await Promise.all([
    ...collectRelativePaths(pkgJson),
  ].map(async (path) => {
    if (!path.includes('*')) {
      return [path];
    }
    const matches: Array<string> = [];
    for await (const match of glob(path, { cwd: pkgDir })) {
      matches.push(match);
    }
    return matches.length > 0
      ? matches
      : [path];
  }));
  const paths = new Set(expandedPaths.flat());
  const fileStates = await Promise.all([...paths].toSorted().map(async (path) => {
    try {
      const file = resolve(pkgDir, path);
      const info = await stat(file);
      // Content also catches rewrites that preserve the size and timestamp.
      return [
        path,
        info.isDirectory(),
        info.size,
        info.mtimeMs,
        info.isFile()
          ? await readFile(file, 'base64')
          : null,
      ];
    } catch {
      return [path, false];
    }
  }));
  return createHash('sha256').update(JSON.stringify({ package: pkgJson, fileStates })).digest('hex');
}

export async function readCache(path: string): Promise<Record<string, { hash: string; result: Result }>> {
  try {
    const value = JSON.parse(await readFile(path, 'utf8'));
    return value && typeof value === 'object' && !Array.isArray(value)
      ? value
      : {};
  } catch {
    return {};
  }
}
