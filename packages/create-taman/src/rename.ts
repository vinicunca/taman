import type { FileMap, GenerateNames, TemplateRename } from './types';

export function fillPlaceholders(text: string, names: GenerateNames): string {
  return text
    .replaceAll('{{name}}', names.name)
    .replaceAll('{{scope}}', names.scope)
    .replaceAll('{{nameSnake}}', names.nameSnake);
}

/**
 * Exact edits from the manifest. A missing file or string is an error, never
 * a silent skip: it means the manifest no longer matches the code.
 */
export function applyExplicitRenames(files: FileMap, renames: Array<TemplateRename>, names: GenerateNames) {
  const result: FileMap = new Map(files);
  const errors: Array<string> = [];

  for (const { file, from, to } of renames) {
    const text = result.get(file);
    if (typeof text !== 'string') {
      errors.push(`rename: ${file} does not exist`);
    } else if (!text.includes(from)) {
      errors.push(`rename: "${from}" not found in ${file}`);
    } else {
      result.set(file, text.replaceAll(from, fillPlaceholders(to, names)));
    }
  }

  return { errors, files: result };
}

/** Replaces the template scope (e.g. `@taman/`) with `@<scope>/` in every text file. */
export function renameScope(files: FileMap, from: string, scope: string): FileMap {
  return new Map(
    [...files].map(([path, contents]) => [
      path,
      typeof contents === 'string' ? contents.replaceAll(from, `@${scope}/`) : contents,
    ]),
  );
}
