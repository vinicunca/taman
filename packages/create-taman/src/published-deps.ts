import type { FileMap } from './types';
import { readJson, writeJson } from './json';
import { addCatalogEntries } from './workspace-yaml';

const DEPENDENCY_FIELDS = ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies'] as const;

interface PackageJson {
  name?: string;
  version?: string;
  private?: boolean;
  [field: string]: unknown;
}

/** Every workspace package.json (outside node_modules) by package name. */
export function listPackages(files: FileMap) {
  const packages = new Map<string, { path: string; version: string; private: boolean }>();

  for (const path of files.keys()) {
    if (!path.endsWith('package.json') || path.includes('node_modules/')) {
      continue;
    }
    const json = readJson<PackageJson>(files, path);
    if (json.name) {
      packages.set(json.name, { path, private: json.private === true, version: json.version ?? '0.0.0' });
    }
  }

  return packages;
}

/**
 * Packages removed from the snapshot that are published (not private) move
 * from `workspace:` to `catalog:` with their snapshot version. A `workspace:`
 * dependency on anything else that was removed is an error.
 */
export function rewritePublishedDeps(before: FileMap, after: FileMap) {
  const remaining = listPackages(after);
  const published = new Map(
    [...listPackages(before)]
      .filter(([name, info]) => !remaining.has(name) && !info.private)
      .map(([name, info]) => [name, info.version]),
  );

  const files: FileMap = new Map(after);
  const errors: Array<string> = [];
  const catalog = new Map<string, string>();

  for (const { path } of remaining.values()) {
    const json = readJson<PackageJson>(files, path);
    let changed = false;

    for (const field of DEPENDENCY_FIELDS) {
      const deps = json[field] as Record<string, string> | undefined;
      for (const [name, range] of Object.entries(deps ?? {})) {
        if (!range.startsWith('workspace:') || remaining.has(name)) {
          continue;
        }
        const version = published.get(name);
        if (version) {
          deps![name] = 'catalog:';
          catalog.set(name, `^${version}`);
          changed = true;
        } else {
          errors.push(`${path}: ${field}.${name} is "${range}" but ${name} is not in the generated project`);
        }
      }
    }

    if (changed) {
      writeJson(files, path, json);
    }
  }

  if (catalog.size > 0) {
    files.set('pnpm-workspace.yaml', addCatalogEntries(files.get('pnpm-workspace.yaml') as string, catalog));
  }

  return { errors, files };
}
