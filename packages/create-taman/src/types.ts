/** One exact edit in one file, applied before the scope rename. */
export interface TemplateRename {
  /** Repo-relative path of the file to edit. */
  file: string;
  /** Text that must occur in the file; every occurrence is replaced. */
  from: string;
  /** Replacement; may contain `{{name}}`, `{{scope}}` and `{{nameSnake}}`. */
  to: string;
}

/** How `create-taman` turns the taman repository into a project. */
export interface TemplateManifest {
  /** Globs (relative to the repo root) deleted from the snapshot. */
  remove: Array<string>;
  /** `packages:` entries dropped from pnpm-workspace.yaml. */
  workspacePackages: Array<string>;
  /** Root package.json scripts deleted. */
  scripts: Array<string>;
  /** Prefix replaced by `@<scope>/` in every text file, e.g. `@taman/`. */
  scopeFrom: string;
  /** Exact edits, applied before the scope rename. */
  rename: Array<TemplateRename>;
}

/** Names derived from the user's answers. */
export interface GenerateNames {
  /** Project (folder) name, e.g. `my-app`. */
  name: string;
  /** npm scope without `@`, e.g. `acme`. */
  scope: string;
  /** `name` with non-alphanumerics replaced by `_`, for database identifiers. */
  nameSnake: string;
}

/** Posix repo-relative path → contents. Binary files stay as bytes. */
export type FileMap = Map<string, string | Uint8Array>;

export interface ApplyResult {
  files: FileMap;
  /** Manifest drift; generation must stop. */
  errors: Array<string>;
  /** Worth showing, not fatal. */
  warnings: Array<string>;
}
