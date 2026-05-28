import { existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import * as manypkg from '@manypkg/get-packages';

const {
  getPackages: getPackagesFunc,
  getPackagesSync: getPackagesSyncFunc,
} = manypkg;

function findMonorepoRoot(cwd: string = process.cwd()) {
  let currentDir = resolve(cwd);

  while (true) {
    if (existsSync(join(currentDir, 'pnpm-lock.yaml'))) {
      return currentDir;
    }

    const parentDir = dirname(currentDir);
    if (parentDir === currentDir) {
      return '';
    }

    currentDir = parentDir;
  }
}

function getPackagesSync() {
  const root = findMonorepoRoot();
  return getPackagesSyncFunc(root);
}

async function getPackages() {
  const root = findMonorepoRoot();

  return await getPackagesFunc(root);
}

export {
  getPackages,
  getPackagesSync,
};
