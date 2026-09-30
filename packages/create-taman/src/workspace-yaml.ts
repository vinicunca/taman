/** The key of a `  key: value` catalog line, without quotes. */
function catalogKey(line: string): string {
  return line.trim().split(': ')[0]!.replace(/^'|'$/g, '');
}

/**
 * Adds or replaces `name: range` lines in the top-level `catalog:` block,
 * inserting each new one in alphabetical position so existing lines keep
 * their order.
 */
export function addCatalogEntries(yaml: string, entries: Map<string, string>): string {
  const lines = yaml.split('\n');
  const start = lines.indexOf('catalog:');
  if (start === -1) {
    throw new Error('pnpm-workspace.yaml has no top-level `catalog:` block');
  }

  for (const [name, range] of [...entries].sort(([a], [b]) => (a < b ? -1 : 1))) {
    // Quote only keys that need it, matching the repo (`vue:` vs `'@types/node':`)
    const key = /^[\w-]+$/.test(name) ? name : `'${name}'`;
    const line = `  ${key}: ${range}`;
    let end = start + 1;
    while (end < lines.length && lines[end]!.startsWith('  ')) {
      end++;
    }

    const block = lines.slice(start + 1, end);
    const existing = block.findIndex((entry) => catalogKey(entry) === name);
    if (existing !== -1) {
      lines[start + 1 + existing] = line;
      continue;
    }

    const after = block.findIndex((entry) => catalogKey(entry) > name);
    lines.splice(after === -1 ? end : start + 1 + after, 0, line);
  }

  return lines.join('\n');
}

/** Removes `  - <glob>` lines (the workspace `packages:` list). */
export function removeWorkspacePackages(yaml: string, globs: Array<string>): string {
  return yaml
    .split('\n')
    .filter((line) => !globs.some((glob) => line.trim() === `- ${glob}`))
    .join('\n');
}

/** `packages:` entries from `globs` that the workspace file does not list. */
export function missingWorkspacePackages(yaml: string, globs: Array<string>): Array<string> {
  const entries = new Set(yaml.split('\n').map((line) => line.trim()));
  return globs.filter((glob) => !entries.has(`- ${glob}`));
}
