import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

export const TEMPLATE_REPO = 'github:vinicunca/taman';

export type TemplateSource = { type: 'github'; ref: string } | { type: 'local'; repo: string };

/** Downloads the repo tarball at `ref` into `dir` (public repo, no token). */
export async function fetchFromGithub(ref: string, dir: string): Promise<void> {
  const { downloadTemplate } = await import('giget');
  await downloadTemplate(`${TEMPLATE_REPO}#${ref}`, { dir, force: true, forceClean: true });
}

/** Extracts the committed files of a local checkout, exactly like a GitHub tarball. */
export function fetchFromLocal(repo: string, dir: string): void {
  const scratch = mkdtempSync(join(tmpdir(), 'create-taman-archive-'));
  const tarball = join(scratch, 'template.tar');
  try {
    execFileSync('git', ['-C', repo, 'archive', '--format=tar', '-o', tarball, 'HEAD']);
    execFileSync('tar', ['-xf', tarball, '-C', dir]);
  } finally {
    rmSync(scratch, { force: true, recursive: true });
  }
}
