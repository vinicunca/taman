// @vitest-environment node
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import process from 'node:process';
import { describe, expect, it } from 'vitest';

const script = resolve(import.meta.dirname, 'prepare-hooks.mjs');
const env = { ...process.env, CI: '' };

function run(cwd: string) {
  return execFileSync('node', [script], { cwd, encoding: 'utf8', env });
}

describe('prepare-hooks', () => {
  it('succeeds without installing anything outside a git repository', () => {
    const dir = mkdtempSync(join(tmpdir(), 'hooks-nogit-'));

    expect(() => run(dir)).not.toThrow();
  });

  it('leaves a parent repository alone when nested inside one', () => {
    const parent = mkdtempSync(join(tmpdir(), 'hooks-parent-'));
    execFileSync('git', ['init', '-q'], { cwd: parent });
    const child = join(parent, 'project');
    mkdirSync(child);

    expect(() => run(child)).not.toThrow();
    expect(existsSync(join(parent, '.git/hooks/pre-commit'))).toBe(false);
  });
});
