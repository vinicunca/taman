/**
 * Converts a repo-relative glob into an anchored RegExp. Supports `*` (one
 * path segment), `**` (any depth), `**` followed by `/` (zero or more
 * directories) and `?`.
 */
export function globToRegExp(glob: string): RegExp {
  let source = '';

  for (let index = 0; index < glob.length; index++) {
    const char = glob[index]!;

    if (char === '*') {
      if (glob[index + 1] === '*') {
        index++;
        if (glob[index + 1] === '/') {
          index++;
          source += '(?:.*/)?';
        } else {
          source += '.*';
        }
      } else {
        source += '[^/]*';
      }
    } else if (char === '?') {
      source += '[^/]';
    } else {
      source += char.replace(/[.+^${}()|[\]\\]/g, '\\$&');
    }
  }

  return new RegExp(`^${source}$`);
}

export function matchesAny(path: string, globs: Array<string>): boolean {
  return globs.some((glob) => globToRegExp(glob).test(path));
}
