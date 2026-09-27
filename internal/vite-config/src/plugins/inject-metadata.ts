import type { PluginOption } from 'vite';

import { readWorkspaceManifest } from '@pnpm/workspace.read-manifest';
import {
  findMonorepoRoot,
  formatNow,
  getPackages,
  readPackageJSON,
} from '@vinicunca/node-utils';

function resolvePackageVersion(
  pkgsMeta: Record<string, string>,
  name: string,
  value: string,
  catalog: Record<string, string>,
) {
  if (value.includes('catalog:')) {
    return catalog[name];
  }

  if (value.includes('workspace')) {
    return pkgsMeta[name];
  }

  return value;
}

/**
 * Collects dependency versions for the metadata. Inside a pnpm workspace this
 * merges every workspace package and resolves `catalog:` / `workspace:`
 * versions; anywhere else (standalone app, npm or yarn project) it falls back
 * to the project's own package.json instead of throwing.
 */
async function resolveDependencies(root: string) {
  let workspaceRoot: string | undefined;
  try {
    workspaceRoot = findMonorepoRoot(root);
  } catch {
    // No pnpm-workspace.yaml / pnpm-lock.yaml above `root`
  }

  if (!workspaceRoot) {
    const { dependencies = {}, devDependencies = {} } = await readPackageJSON(root);
    return { dependencies, devDependencies };
  }

  const { packages } = await getPackages(workspaceRoot);
  const manifest = await readWorkspaceManifest(workspaceRoot);
  const catalog = manifest?.catalog || {};

  const resultDevDependencies: Record<string, string | undefined> = {};
  const resultDependencies: Record<string, string | undefined> = {};
  const pkgsMeta: Record<string, string> = {};

  for (const { packageJson } of packages) {
    pkgsMeta[packageJson.name] = packageJson.version;
  }

  for (const { packageJson } of packages) {
    const { dependencies = {}, devDependencies = {} } = packageJson;
    for (const [key, value] of Object.entries(dependencies)) {
      resultDependencies[key] = resolvePackageVersion(
        pkgsMeta,
        key,
        value,
        catalog,
      );
    }
    for (const [key, value] of Object.entries(devDependencies)) {
      resultDevDependencies[key] = resolvePackageVersion(
        pkgsMeta,
        key,
        value,
        catalog,
      );
    }
  }
  return {
    dependencies: resultDependencies,
    devDependencies: resultDevDependencies,
  };
}

/**
 * Injects project metadata into the Vite config
 */
async function viteMetadataPlugin(
  root = process.cwd(),
): Promise<PluginOption | undefined> {
  const { author, description, homepage, license, version }
    = await readPackageJSON(root);

  const buildTime = formatNow('YYYY-MM-DD HH:mm:ss');

  return {
    async config() {
      const { dependencies, devDependencies }
        = await resolveDependencies(root);

      const isAuthorObject = typeof author === 'object';
      const authorName = isAuthorObject ? author.name : author;
      const authorEmail = isAuthorObject ? author.email : null;
      const authorUrl = isAuthorObject ? author.url : null;

      return {
        define: {
          '__TAMAN_METADATA__': JSON.stringify({
            authorEmail,
            authorName,
            authorUrl,
            buildTime,
            dependencies,
            description,
            devDependencies,
            homepage,
            license,
            version,
          }),
          'import.meta.env.VITE_APP_VERSION': JSON.stringify(version),
        },
      };
    },
    enforce: 'post',
    name: 'vite:inject-metadata',
  };
}

export { viteMetadataPlugin };
