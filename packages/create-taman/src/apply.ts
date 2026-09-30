import type { ApplyResult, FileMap, GenerateNames, TemplateManifest } from './types';
import { catalogUsage, rewritePublishedDeps, sortDependencyKeys } from './published-deps';
import { removeFiles, unmatchedGlobs } from './remove';
import { applyExplicitRenames, renameScope } from './rename';
import { removeRootScripts } from './scripts';
import { missingWorkspacePackages, pruneCatalog, removeWorkspacePackages } from './workspace-yaml';

/** Paths of text files that still contain `needle`. */
export function findLeftovers(files: FileMap, needle: string): Array<string> {
  return [...files]
    .filter(([, contents]) => typeof contents === 'string' && contents.includes(needle))
    .map(([path]) => path);
}

/**
 * Turns a repo snapshot into a project. Explicit renames run before the
 * scope rename because they match the original text.
 */
export function applyManifest(snapshot: FileMap, manifest: TemplateManifest, names: GenerateNames): ApplyResult {
  // A glob or workspace entry that matches nothing means the manifest no
  // longer describes the code: fail loudly instead of shipping leftovers.
  const drift = [
    ...unmatchedGlobs(snapshot, manifest.remove).map((glob) => `remove: "${glob}" matches no files`),
    ...missingWorkspacePackages(snapshot.get('pnpm-workspace.yaml') as string, manifest.workspacePackages)
      .map((glob) => `workspacePackages: "- ${glob}" is not in pnpm-workspace.yaml`),
  ];

  let files = removeFiles(snapshot, manifest.remove);

  const deps = rewritePublishedDeps(snapshot, files);
  files = deps.files;
  files.set('pnpm-workspace.yaml', removeWorkspacePackages(files.get('pnpm-workspace.yaml') as string, manifest.workspacePackages));

  const explicit = applyExplicitRenames(files, manifest.rename, names);
  files = sortDependencyKeys(renameScope(explicit.files, manifest.scopeFrom, names.scope));

  const scripts = removeRootScripts(files, manifest.scripts);
  files = scripts.files;

  // Removed packages leave catalog entries nothing references any more
  files.set('pnpm-workspace.yaml', pruneCatalog(files.get('pnpm-workspace.yaml') as string, catalogUsage(files)));

  return {
    errors: [...drift, ...deps.errors, ...explicit.errors],
    files,
    warnings: [
      ...scripts.warnings,
      ...findLeftovers(files, manifest.scopeFrom).map((path) => `${manifest.scopeFrom} still appears in ${path}`),
    ],
  };
}
