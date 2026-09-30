// @vitest-environment node
import { execFileSync } from 'node:child_process';
import { chmodSync, existsSync, mkdirSync, mkdtempSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import process from 'node:process';
import { describe, expect, it } from 'vitest';
import { generateProject } from '../generate';
import { toNames } from '../names';

const GIT_ENV = {
  ...process.env,
  GIT_AUTHOR_EMAIL: 'test@example.com',
  GIT_AUTHOR_NAME: 'test',
  GIT_COMMITTER_EMAIL: 'test@example.com',
  GIT_COMMITTER_NAME: 'test',
};

const MANIFEST = `export default {
  remove: ['internal/**', 'CLAUDE.md', 'template.manifest.ts'],
  workspacePackages: ['internal/*'],
  scripts: ['publint'],
  scopeFrom: '@taman/',
  rename: [{ file: 'package.json', from: '"name": "@taman/monorepo"', to: '"name": "{{name}}"' }],
};
`;

function fixtureRepo(manifest = MANIFEST): string {
  const repo = mkdtempSync(join(tmpdir(), 'ct-repo-'));
  const files: Record<string, string> = {
    'package.json': `${JSON.stringify({ name: '@taman/monorepo', private: true, scripts: { publint: 'x' }, devDependencies: { '@vinicunca/tsconfig': 'workspace:*' } }, null, 2)}\n`,
    'pnpm-workspace.yaml': 'packages:\n  - internal/*\n  - apps/*\n\ncatalog:\n  vue: ^3.5.0\n',
    'internal/tsconfig/package.json': '{ "name": "@vinicunca/tsconfig", "version": "1.0.1" }\n',
    'apps/web/package.json': '{ "name": "@taman/web", "private": true }\n',
    'apps/web/.env.example': 'VITE_APP_TITLE=Taman\n',
    'apps/web/src/main.ts': 'import \'@taman/web\';\n',
    'scripts/run.sh': '#!/bin/sh\necho ok\n',
    'CLAUDE.md': '# notes\n',
    'template.manifest.ts': manifest,
  };
  for (const [path, contents] of Object.entries(files)) {
    mkdirSync(dirname(join(repo, path)), { recursive: true });
    writeFileSync(join(repo, path), contents);
  }
  chmodSync(join(repo, 'scripts/run.sh'), 0o755);
  execFileSync('git', ['init', '-q'], { cwd: repo });
  execFileSync('git', ['add', '-A'], { cwd: repo });
  execFileSync('git', ['commit', '-q', '-m', 'fixture'], { cwd: repo, env: GIT_ENV });
  return repo;
}

describe('generateProject', () => {
  it('generates a renamed project from a local checkout', async () => {
    const repo = fixtureRepo();
    const dir = join(mkdtempSync(join(tmpdir(), 'ct-out-')), 'my-app');

    await generateProject({ dir, git: true, names: toNames('my-app', 'acme'), source: { repo, type: 'local' } });

    const read = (path: string) => readFileSync(join(dir, path), 'utf8');
    expect(JSON.parse(read('package.json')).name).toBe('my-app');
    expect(JSON.parse(read('apps/web/package.json')).name).toBe('@acme/web');
    expect(read('apps/web/src/main.ts')).toBe('import \'@acme/web\';\n');
    expect(read('apps/web/.env')).toBe('VITE_APP_TITLE=Taman\n');
    expect(read('README.md')).toContain('my-app');
    expect(existsSync(join(dir, 'CLAUDE.md'))).toBe(false);
    expect(existsSync(join(dir, 'template.manifest.ts'))).toBe(false);
    expect(existsSync(join(dir, 'internal'))).toBe(false);
    expect(statSync(join(dir, 'scripts/run.sh')).mode & 0o111).not.toBe(0);
    expect(execFileSync('git', ['log', '--oneline'], { cwd: dir, encoding: 'utf8' })).toContain('Initial commit from create-taman');
  });

  it('keeps the generated project when the initial commit fails', async () => {
    const config = join(mkdtempSync(join(tmpdir(), 'ct-git-')), 'gitconfig');
    writeFileSync(config, '[commit]\n\tgpgsign = true\n[gpg]\n\tprogram = false\n[user]\n\tname = t\n\temail = t@example.com\n');
    const repo = fixtureRepo();
    const previous = process.env.GIT_CONFIG_GLOBAL;
    process.env.GIT_CONFIG_GLOBAL = config;
    try {
      const dir = join(mkdtempSync(join(tmpdir(), 'ct-out-')), 'my-app');

      const { warnings } = await generateProject({ dir, git: true, names: toNames('my-app', 'acme'), source: { repo, type: 'local' } });

      expect(existsSync(join(dir, 'package.json'))).toBe(true);
      expect(warnings).toEqual([expect.stringMatching(/^git: /)]);
    } finally {
      if (previous === undefined) {
        Reflect.deleteProperty(process.env, 'GIT_CONFIG_GLOBAL');
      } else {
        process.env.GIT_CONFIG_GLOBAL = previous;
      }
    }
  });

  it('refuses a non-empty folder and leaves it untouched', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'ct-busy-'));
    writeFileSync(join(dir, 'keep.txt'), 'mine');

    await expect(generateProject({ dir, git: false, names: toNames('busy', 'busy'), source: { repo: fixtureRepo(), type: 'local' } }))
      .rejects
      .toThrow(/not empty/);
    expect(readFileSync(join(dir, 'keep.txt'), 'utf8')).toBe('mine');
  });

  it('removes the folder it created when the manifest has drifted', async () => {
    const drifted = MANIFEST.replace('"name": "@taman/monorepo"', '"name": "@taman/other"');
    const dir = join(mkdtempSync(join(tmpdir(), 'ct-out-')), 'my-app');

    await expect(generateProject({ dir, git: false, names: toNames('my-app', 'acme'), source: { repo: fixtureRepo(drifted), type: 'local' } }))
      .rejects
      .toThrow(/out of date/);
    expect(existsSync(dir)).toBe(false);
  });
});
