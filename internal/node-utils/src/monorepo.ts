import { existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

import * as manypkg from '@manypkg/get-packages';

const { getPackages: getPackagesFunc, getPackagesSync: getPackagesSyncFunc }
  = manypkg;

/**
 * Find the nearest pnpm workspace root. Throws when none is found.
 * @param cwd
 */
function findMonorepoRoot(cwd: string = process.cwd()): string {
  let currentDir = resolve(cwd);

  while (true) {
    if (existsSync(join(currentDir, 'pnpm-workspace.yaml')) || existsSync(join(currentDir, 'pnpm-lock.yaml'))) {
      return currentDir;
    }

    const parentDir = dirname(currentDir);
    if (parentDir === currentDir) {
      throw new Error(`No pnpm workspace found from ${resolve(cwd)}`);
    }

    currentDir = parentDir;
  }
}

/**
 * Get all packages in the monorepo (sync)
 */
function getPackagesSync(cwd: string = process.cwd()): manypkg.Packages {
  const root = findMonorepoRoot(cwd);
  return getPackagesSyncFunc(root);
}

/**
 * Get all packages in the monorepo
 */
async function getPackages(cwd: string = process.cwd()): Promise<manypkg.Packages> {
  const root = findMonorepoRoot(cwd);

  return await getPackagesFunc(root);
}

export { findMonorepoRoot, getPackages, getPackagesSync };
