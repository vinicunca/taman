import type { ApplyResult, FileMap, GenerateNames, TemplateManifest } from './types';
import { rewritePublishedDeps } from './published-deps';
import { removeFiles } from './remove';
import { applyExplicitRenames, renameScope } from './rename';
import { removeRootScripts } from './scripts';
import { removeWorkspacePackages } from './workspace-yaml';

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
  let files = removeFiles(snapshot, manifest.remove);

  const deps = rewritePublishedDeps(snapshot, files);
  files = deps.files;
  files.set('pnpm-workspace.yaml', removeWorkspacePackages(files.get('pnpm-workspace.yaml') as string, manifest.workspacePackages));

  const explicit = applyExplicitRenames(files, manifest.rename, names);
  files = renameScope(explicit.files, manifest.scopeFrom, names.scope);

  const scripts = removeRootScripts(files, manifest.scripts);
  files = scripts.files;

  return {
    errors: [...deps.errors, ...explicit.errors],
    files,
    warnings: [
      ...scripts.warnings,
      ...findLeftovers(files, manifest.scopeFrom).map((path) => `${manifest.scopeFrom} still appears in ${path}`),
    ],
  };
}
